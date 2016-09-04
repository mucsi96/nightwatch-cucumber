'use strict'

const co = require('co')
const Runner = require.main.require('nightwatch/lib/runner/run')
const ClientManager = require.main.require('nightwatch/lib/runner/clientmanager')

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

  addTestRunner (run) {
    const self = this
    const originalRunnerRun = Runner.prototype.run

    Runner.prototype.run = co.wrap(function * () {
      let error
      this.additionalOpts.output_folder = false
      this.options.output = false

      try {
        self._startSession(this.options)
        yield * run(self.client)
      } catch (err) {
        error = err
      }

      yield * self._closeSession()

      if (!this.testSource.length || error) {
        return this.doneCb(null, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })
  }
}
