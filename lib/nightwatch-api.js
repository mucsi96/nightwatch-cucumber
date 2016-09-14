'use strict'

const co = require('co')
const path = require('path')
const _ = require('lodash')
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

  applyGroupFilters (folders) {
    let featureFiles = []

    if (typeof this.nightwatchArgv.group === 'string') {
      this.nightwatchArgv.group = this.nightwatchArgv.group.split(',')
    }

    this.nightwatchArgv.group.forEach((groupName) => {
      const fullGroupPath = path.resolve(groupName)

      folders.forEach((srcFolder) => {
        const fullSrcFolder = path.resolve(srcFolder)

        if (fullGroupPath.indexOf(fullSrcFolder) === 0) {
          return featureFiles.concat(groupName)
        }

        featureFiles.push(path.join(srcFolder, groupName))
      })
    })

    return featureFiles
  }

  addTestRunner (run) {
    const self = this
    const originalRunnerRun = Runner.prototype.run

    Runner.prototype.run = co.wrap(function * () {
      let error
      let originalTerminate
      this.additionalOpts.output_folder = false
      this.options.output = false

      try {
        self._startSession(this.options)
        const client = self.client.get()
        originalTerminate = client.terminate
        client.terminate = () => {}
        yield * run(self.client)
      } catch (err) {
        error = err
      }

      self.client.get().terminate = originalTerminate
      yield * self._closeSession()

      if (!this.testSource.length || error) {
        return this.doneCb(null, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })

    hookUtils.addHookAfter(ClientRunner.prototype, 'getTestSource', function () {
      self.nightwatchArgv = _.cloneDeep(this.argv)
    })
  }
}
