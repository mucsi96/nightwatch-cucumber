'use strict'

const _ = require('lodash')
const co = require('co')
const pify = require('pify')
const path = require('path')
const fs = pify(require('fs'), { include: ['readFile'] })
const hookUtils = require('./hook-utils')
const Runner = require.main.require('nightwatch/lib/runner/run')
const ClientManager = require.main.require('nightwatch/lib/runner/clientmanager')
const ClientRunner = require.main.require('nightwatch/lib/runner/cli/clirunner')
const ChildProcess = require.main.require('nightwatch/lib/runner/cli/child-process')

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

module.exports = class NightwatchApi {
  _startSession (options) {
    this.client = new ClientManager()
    this.client.init(options)
    this.client.api('currentEnv', options.currentEnv)
  }

  * _closeSession () {
    const self = this
    yield new Promise((resolve, reject) => {
      self.client.get().on('nightwatch:finished', function () {
        resolve()
      })
      self.client.terminate()
    })
  }

  * takeScreenshot (fileName) {
    const self = this
    const filePath = path.resolve(this.client.options.screenshots.path, fileName)

    yield new Promise((resolve, reject) => {
      self.client.get().api.saveScreenshot(filePath, function (result, err) {
        if (err) return reject(err)
        resolve(result)
      })
      return self.client.get().start()
    })

    const content = yield fs.readFile(filePath, 'base64')

    return {
      data: new Buffer(content, 'base64'),
      mimeType: 'image/png'
    }
  }

  addTestModulePaths (modulePaths) {
    this.modulePaths = modulePaths
  }

  addPathConverter (convert, revert) {
    const self = this

    hookUtils.addHookBefore(ClientRunner.prototype, 'getTestSource', function () {
      self.originalSettings = _.cloneDeep(this.settings)
      if (this.argv._source.length) {
        this.argv._source[0] = convert(this.argv._source[0])
      } else if (this.argv.test) {
        this.argv.test = convert(this.argv.test)
      } else {
        this.settings.src_folders = this.settings.src_folders || []
        this.settings.src_folders = this.settings.src_folders.concat(self.modulePaths)
      }
      self.nightwatchArgv = this.argv
    })

    hookUtils.addHookBefore(ChildProcess.prototype, 'getArgs', function () {
      const cliArgs = this.args
      const testIndex = cliArgs.indexOf('--test') + 1
      cliArgs[testIndex] = revert(cliArgs[testIndex])
    })
  }

  addHookAfterChildProcesses (hook) {
    hookUtils.addCallbackedHookAfter(ClientRunner.prototype, 'startChildProcesses', 1, hook)
  }

  addTestRunner (run) {
    const self = this
    const originalRunnerRun = Runner.prototype.run

    Runner.prototype.run = co.wrap(function * () {
      const that = this
      let error
      let originalTerminate
      const originalOptions = _.cloneDeep(this.options)
      const originalAdditionalOpts = _.cloneDeep(this.additionalOpts)
      this.additionalOpts.output_folder = false
      this.options.output = false
      this.options.tag_filter = undefined
      this.options.screenshots.enabled = false

      try {
        const modules = yield new Promise((resolve, reject) => {
          Runner
            .readPaths(that.testSource, that.options)
            .spread(function (modulePaths, fullPaths) {
              resolve(modulePaths)
            }).then(resolve, reject)
        })
        self._startSession(this.options)
        const client = self.client.get()
        originalTerminate = client.terminate
        client.terminate = () => {}
        yield * run(self.client, modules)
      } catch (err) {
        error = err
        console.error(err.stack)
      }

      try {
        if (self.client) {
          self.client.get().terminate = originalTerminate
          yield * self._closeSession()
        }
      } catch (err) {
        error = err
        console.error(err.stack)
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

      if (!self.originalSettings.src_folders || !self.originalSettings.src_folders.length || error) {
        return this.doneCb(null, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })
  }
}
