const co = require('co')
const pify = require('pify')
const fs = pify(require('fs'), { include: ['readFile'] })
const cloneDeep = require('lodash.clonedeep')
const hookUtils = require('./hook-utils')
const Nightwatch = {
  Runner: require('nightwatch/lib/runner/run'),
  ClientManager: require('nightwatch/lib/runner/clientmanager'),
  ClientRunner: require('nightwatch/lib/runner/cli/clirunner'),
  ChildProcess: require('nightwatch/lib/runner/cli/child-process'),
  Utils: require('nightwatch/lib/util/utils'),
  Protocol: require('nightwatch/lib/api/protocol'),
  ErrorHandler: require('nightwatch/lib/runner/cli/errorhandler'),
  Assertion: require('nightwatch/lib/core/assertion'),
  Expect: require('nightwatch/lib/api/expect')
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

module.exports = class NightwatchApi {
  constructor (options) {
    this.options = options
  }

  _startSession (options) {
    this.client = new Nightwatch.ClientManager()
    this.client.init(options)
    const api = this.client.api('currentEnv', options.currentEnv)
    this.promisifyApi(api)
    this.promisifyAssertions()
    this.promisifyExpect(api)
    this.promisifyPageObjects(api)
    this.protocol = Nightwatch.Protocol(this.client.get())
  }

  promisifyApi (api) {
    let _successCb, _catchCb
    api.catch = (catchCb) => {
      if (catchCb) _catchCb = catchCb
    }
    api.then = (successCb, catchCb) => {
      if (successCb) _successCb = successCb
      if (catchCb) _catchCb = catchCb
      return this.start()
        .then(_successCb)
        .catch(_catchCb)
    }
  }

  promisifyAssertions () {
    const promise = {}
    this.promisifyApi(promise)
    const originalAssert = Nightwatch.Assertion.assert

    Nightwatch.Assertion.assert = function () {
      originalAssert.apply(this, arguments)
      return promise
    }
  }

  promisifyExpect (api) {
    const self = this
    const originalExpectElement = api.expect.element

    api.expect.element = function () {
      const result = originalExpectElement.apply(this, arguments)
      self.promisifyApi(result)
      return result
    }
  }

  promisifySection (section) {
    this.promisifyApi(section)
    this.promisifyExpect(section)
    if (section.section) {
      Object.keys(section.section).forEach((key) => {
        this.promisifySection(section.section[key])
      })
    }
  }

  promisifyChildPageObjects (page) {
    const self = this
    Object.keys(page).forEach((key) => {
      if (typeof page[key] !== 'function') {
        this.promisifyChildPageObjects(page[key])
      } else {
        const originalPageCreator = page[key]
        page[key] = function () {
          const page = originalPageCreator()
          self.promisifySection(page)
          return page
        }
      }
    })
  }

  promisifyPageObjects (api) {
    if (api.page) {
      return this.promisifyChildPageObjects(api.page)
    }
  }

  getClientApi () {
    return this.client.api()
  }

  * _closeSession () {
    yield new Promise((resolve, reject) => {
      this.client.get().on('nightwatch:finished', function () {
        resolve()
      })
      this.client.terminate()
    })
  }

  * takeScreenshot (moduleName, testName) {
    if (!this.takeScreenshotOnFailure) return

    const forbiddenCharacters = /[*|\\:"<>?/+]/g

    const filePath = Nightwatch.Utils.getScreenshotFileName(
      {module: moduleName, name: testName.replace(forbiddenCharacters, '')},
      true,
      this.client.options.screenshots.path
    )

    yield new Promise((resolve, reject) => {
      this.protocol.screenshot(false, (response) => {
        if (response.state !== 'success' && response.status !== 0) {
          reject(new Error('Creating screenshot was not successful. Response was:\n' + require('util').inspect(response)))
        }

        this.client.get().saveScreenshotToFile(filePath, response.value, (err) => {
          if (err) reject(err)
          resolve()
        })
      })
    })

    return {
      data: yield fs.readFile(filePath, 'base64'),
      mimeType: 'image/png'
    }
  }

  addTestModulePaths (modulePaths) {
    this.modulePaths = modulePaths
  }

  overrideOriginalSourceGetter (convert) {
    const self = this
    const originalClientRunnerGetTestSource = Nightwatch.ClientRunner.prototype.getTestSource

    Nightwatch.ClientRunner.prototype.getTestSource = function () {
      Nightwatch.ClientRunner.prototype.getTestSource = originalClientRunnerGetTestSource
      const originalArgv = cloneDeep(this.argv)
      const originalSettings = cloneDeep(this.settings)

      if (this.argv._source && this.argv._source.length) {
        this.argv._source[0] = convert(this.argv._source[0])
      } else if (this.argv.test) {
        this.argv.test = convert(this.argv.test)
      } else {
        this.settings.src_folders = self.modulePaths
      }
      self.nightwatchArgv = this.argv

      self.testSource = Nightwatch.ClientRunner.prototype.getTestSource.apply(this, arguments)

      if (this.parallelMode) {
        return self.testSource
      }

      this.argv = originalArgv
      this.settings = originalSettings
      this.settings.src_folders = this.settings.src_folders || []
      return Nightwatch.ClientRunner.prototype.getTestSource.apply(this, arguments)
    }
  }

  addHookTests (revert) {
    hookUtils.addHookBefore(Nightwatch.ChildProcess.prototype, 'getArgs', function () {
      if (this.args.indexOf('--test') === -1) return

      const cliArgs = this.args
      const testIndex = cliArgs.indexOf('--test') + 1
      cliArgs[testIndex] = revert(cliArgs[testIndex])
    })
  }

  addPathConverter (convert, revert) {
    this.overrideOriginalSourceGetter(convert)
    this.addHookTests(revert)
  }

  overrideOriginalStartTestWorkers () {
    const originalStartTestWorkers = Nightwatch.ClientRunner.prototype.startTestWorkers

    Nightwatch.ClientRunner.prototype.startTestWorkers = function () {
      this.test_settings.tag_filter = undefined
      return originalStartTestWorkers.apply(this, arguments)
    }
  }

  addHookAfterChildProcesses (hook) {
    hookUtils.addCallbackedHookAfter(Nightwatch.ClientRunner.prototype, 'startChildProcesses', 1, hook)
  }

  isRunningInParallel () {
    return process.env.__NIGHTWATCH_PARALLEL_MODE === '1'
  }

  getWorkerIndex () {
    return process.env.__NIGHTWATCH_ENV_KEY.split('_').pop()
  }

  start () {
    return new Promise((resolve, reject) => {
      let originalTerminate
      const checkErrors = () => {
        const lastError = this.client.get().results.lastError
        const errors = this.client.get().errors

        this.client.get().results.lastError = null
        this.client.get().errors = []

        if (lastError || (errors && errors.length)) {
          if (lastError && lastError.stack.indexOf('api.expect.element') >= 0) {
            lastError.name = ''
          }
          if (lastError) {
            lastError.stack = [lastError.message, lastError.stack].join('\n')
          }
          return reject(lastError || new Error(errors[0]))
        }
      }
      const restore = () => {
        this.client.get().terminate = originalTerminate
        this.client.removeListener('error', errorHandler)
        this.client.removeListener('complete', completeHandler)
      }
      const errorHandler = (err) => {
        restore()
        reject(err)
      }
      const completeHandler = () => {
        restore()
        checkErrors()
        resolve()
      }
      const setup = () => {
        originalTerminate = this.client.get().terminate
        this.client.get().terminate = () => {
          const clientError = this.client.get().errors[0]
          if (!clientError) return
          const cutPos = clientError.indexOf(':')
          const err = new Error(clientError.substring(0, cutPos))
          err.stack = clientError
          errorHandler(err)
        }
        this.client.on('error', errorHandler)
        this.client.on('complete', completeHandler)
      }

      checkErrors()
      setup()
      this.client.start()
    })
  }

  addTestRunner (testRunner) {
    const self = this
    const originalRunnerRun = Nightwatch.Runner.prototype.run

    Nightwatch.Runner.prototype.run = co.wrap(function * () {
      const that = this
      let error
      let executionSuccess
      const originalOptions = cloneDeep(this.options)
      const originalAdditionalOpts = cloneDeep(this.additionalOpts)
      this.additionalOpts.output_folder = false
      this.options.output = false
      this.options.tag_filter = undefined
      self.takeScreenshotOnFailure = this.options.screenshots &&
        this.options.screenshots.enabled &&
        this.options.screenshots.path &&
        this.options.screenshots.on_failure

      if (this.options.screenshots) this.options.screenshots.enabled = false

      try {
        const modules = yield new Promise((resolve, reject) => {
          Nightwatch.Runner
            .readPaths(self.testSource, that.options)
            .spread(function (modulePaths, fullPaths) {
              resolve(modulePaths)
            }).then(resolve, reject)
        })
        self._startSession(this.options)
        executionSuccess = yield * testRunner(modules)
      } catch (err) {
        error = err
      }

      try {
        if (self.client) {
          yield * self._closeSession()
        }
      } catch (err) {
        error = err
      }

      if (typeof process.send === 'function') {
        process.send(JSON.stringify({
          type: 'testsuite_finished',
          itemKey: process.env.__NIGHTWATCH_ENV_LABEL,
          moduleKey: 'moduleKey',
          results: {
            completed: {
              ok: 1
            }
          },
          errmessages: []
        }))
      }

      this.additionalOpts = originalAdditionalOpts
      this.options = originalOptions

      if (originalAdditionalOpts.end_session_on_fail) {
        error = error || !executionSuccess
      }

      if (!originalAdditionalOpts.src_folders || !originalAdditionalOpts.src_folders.length || error || !executionSuccess) {
        return this.doneCb(error, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })
  }
}
