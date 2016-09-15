'use strict'

const co = require('co')
const path = require('path')
const _ = require('lodash')
const glob = require('glob')
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

  _applyGroupFilters (folders) {
    if (!this.nightwatchArgv.group) return folders

    if (typeof this.nightwatchArgv.group === 'string') {
      this.nightwatchArgv.group = this.nightwatchArgv.group.split(',')
    }

    let filteredFolders = []

    this.nightwatchArgv.group.forEach((groupName) => {
      const fullGroupPath = path.resolve(groupName)

      folders.forEach((srcFolder) => {
        const fullSrcFolder = path.resolve(srcFolder)

        if (fullGroupPath.indexOf(fullSrcFolder) === 0) {
          return filteredFolders.concat(groupName)
        }

        filteredFolders.push(path.join(srcFolder, groupName))
      })
    })

    return filteredFolders
  }

  _applySkipGroupFilters (folders) {
    if (!this.nightwatchArgv.skipgroup) return folders

    if (typeof this.nightwatchArgv.skipgroup === 'string') {
      this.nightwatchArgv.skipgroup = this.nightwatchArgv.skipgroup.split(',')
    }

    let filteredFeatureFiles = []

    folders.forEach((srcFolder) => {
      let expandedFeatureFiles = glob.sync(path.join(srcFolder, '**/*.feature'))

      expandedFeatureFiles = expandedFeatureFiles.filter((featureFilePath) => {
        return this.nightwatchArgv.skipgroup.every((skipgroup) => {
          return path.dirname(featureFilePath).split('/').indexOf(skipgroup) === -1
        })
      })

      filteredFeatureFiles = filteredFeatureFiles.concat(expandedFeatureFiles)
    })

    return filteredFeatureFiles
  }

  applySrcFilters (folders) {
    folders = this._applyGroupFilters(folders)
    folders = this._applySkipGroupFilters(folders)
    return folders
  }

  getTags () {
    let result = this.nightwatchArgv.tag || []

    if (typeof result === 'string') {
      result = [result]
    }

    return result.map((tag) => `@${tag}`)
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
