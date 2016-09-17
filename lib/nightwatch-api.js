'use strict'

const co = require('co')
const hookUtils = require('./hook-utils')
const Runner = require.main.require('nightwatch/lib/runner/run')
const ClientManager = require.main.require('nightwatch/lib/runner/clientmanager')
const ClientRunner = require.main.require('nightwatch/lib/runner/cli/clirunner')

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

  addTestModulePaths (modulePaths) {
    this.modulePaths = modulePaths
  }

  addPathResolver (resolve) {
    const self = this

    hookUtils.addHookBefore(ClientRunner.prototype, 'getTestSource', function () {
      if (this.argv._source.length) {
        this.argv._source[0] = resolve(this.argv._source[0])
      } else if (this.argv.test) {
        this.argv.test = resolve(this.argv.test)
      } else {
        this.settings.src_folders = this.settings.src_folders || []
        this.settings.src_folders = this.settings.src_folders.concat(self.modulePaths)
      }
      self.nightwatchArgv = this.argv
    })
  }

  addTestRunner (run) {
    const self = this
    const originalRunnerRun = Runner.prototype.run

    Runner.prototype.run = co.wrap(function * () {
      const that = this
      let error
      let originalTerminate
      this.additionalOpts.output_folder = false
      this.options.output = false

      const modules = yield new Promise((resolve, reject) => {
        Runner
          .readPaths(that.testSource, that.options)
          .spread(function (modulePaths, fullPaths) {
            resolve(modulePaths)
          })
      })

      try {
        self._startSession(this.options)
        const client = self.client.get()
        originalTerminate = client.terminate
        client.terminate = () => {}
        yield * run(self.client, modules)
      } catch (err) {
        error = err
      }

      self.client.get().terminate = originalTerminate
      yield * self._closeSession()

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

      if (!this.testSource.length || error) {
        return this.doneCb(null, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })
  }
}
