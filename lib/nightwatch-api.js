const tmp = require('tmp')
const co = require('co')
const hookUtils = require('./hook-utils')
const Runner = require.main.require('nightwatch/lib/runner/run')
const Walk = require.main.require('nightwatch/lib/runner/walk')
const ClientManager = require.main.require('nightwatch/lib/runner/clientmanager')
const dummyFolder = tmp.dirSync({ unsafeCleanup: true }).name

tmp.setGracefulCleanup()

module.exports = class NightwatchApi {
  constructor () {
    this.testFiles = []
    this.testModuleRunners = []
  }

  addTestFiles (testFiles) {
    this.testFiles = this.testFiles.concat(testFiles)
  }

  addTestModuleRunner (conditionFn, moduleRunner) {
    this.testModuleRunners.push({
      conditionFn,
      run: moduleRunner
    })
  }

  _getClient (options) {
    const client = new ClientManager()
    client.init(options)
    client.api('currentEnv', options.currentEnv)
    return client
  }

  hookUp () {
    const self = this

    hookUtils.addPromisedHookBefore(Runner.prototype, 'run', function * () {
      this.additionalOpts.output_folder = false
      this.options.output = false
      this.testSource.push(dummyFolder)
    })

    hookUtils.addCallbackedHookAfter(Walk, 'readPaths', 1, function * (err, paths) {
      if (err) return
      self.testFiles.forEach((testFile) => paths.push(testFile))
    })

    const originalRunnerRunTestModule = Runner.prototype.runTestModule
    Runner.prototype.runTestModule = function (modulePath, fullPaths) {
      let runner
      self.testModuleRunners.some((testModuleRunner) => {
        const match = testModuleRunner.conditionFn(modulePath)

        if (match) {
          runner = testModuleRunner.run
        }

        return match
      })

      if (!runner) return originalRunnerRunTestModule.call(this, modulePath, fullPaths)

      return co.wrap(runner).call(this, self._getClient(this.options), modulePath)
    }
  }
}
