'use strict'

const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const glob = require('glob')
const mkdirp = require('mkdirp')
const dummyTestModulesFolder = tmp.dirSync({ unsafeCleanup: true }).name
const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

tmp.setGracefulCleanup()

module.exports = class Runner {

  constructor () {
    this.originalFeaturePath = {}
  }

  generateDummyTestModules (featureSources) {
    featureSources.forEach((featureSource) => {
      const featureFiles = glob.sync(path.join(featureSource, '**/*.feature'))

      featureFiles.forEach((featureFile) => {
        const dummyTestModuleFile = this.featurePathToDummyPath(featureFile)
        mkdirp.sync(path.dirname(dummyTestModuleFile))
        fs.writeFileSync(dummyTestModuleFile, '')
      })
    })
  }

  getTags (nightwatchArgv) {
    let result = nightwatchArgv.tag || []

    if (typeof result === 'string') {
      result = [result]
    }

    return result.map((tag) => `@${tag}`)
  }

  getSkipTags (nightwatchArgv) {
    let result = nightwatchArgv.skiptags || []

    if (typeof result === 'string') {
      result = [result]
    }

    return result.map((tag) => `~@${tag}`)
  }

  featurePathToDummyPath (featureFile) {
    if (!featureFile.match(/\.feature$/)) featureFile += '.feature'

    const dummyPath = path.join(dummyTestModulesFolder, featureFile.replace(/\.feature$/, '.js'))

    this.originalFeaturePath[dummyPath] = featureFile

    return dummyPath
  }

  dummyPathToFeaturePath (dummyPath) {
    if (!dummyPath.match(/\.js$/)) dummyPath += '.js'

    return this.originalFeaturePath[dummyPath] || dummyPath
  }

  run (options) {
    const self = this
    const nightwatchApi = new NightwatchApi()
    const dummyPaths = options.featureFiles.map((srcPath) => path.join(dummyTestModulesFolder, srcPath))

    this.generateDummyTestModules(options.featureFiles)

    nightwatchApi.addTestModulePaths(dummyPaths)

    nightwatchApi.addPathResolver((path) => {
      return self.featurePathToDummyPath(path)
    })

    nightwatchApi.addTestRunner(function * (nightwatchClient, dummyTestModules) {
      options.featureFiles = dummyTestModules.map((dummyTestModule) => self.dummyPathToFeaturePath(dummyTestModule))
      options.tags = self.getTags(nightwatchApi.nightwatchArgv).concat(self.getSkipTags(nightwatchApi.nightwatchArgv))
      const cucumber = new CucumberApi(options)

      cucumber.addStepDefinitionRunner(function * (stepDefinition, parameters) {
        yield new Promise((resolve, reject) => {
          const nightwatch = nightwatchClient.api()
          nightwatchClient.on('error', reject)
          nightwatch.perform(() => {
            try {
              nightwatchClient.get().results.lastError = null
              nightwatch.currentTest = {
                name: 'test',
                module: 'module'
              }
              stepDefinition.apply(nightwatch, parameters)
            } catch (err) {
              nightwatchClient.removeListener('error', reject)
              return reject(err)
            }
          })
          nightwatch.perform(() => {
            nightwatchClient.removeListener('error', reject)
            const lastError = nightwatchClient.get().results.lastError
            if (lastError) {
              lastError.stack = [lastError.message, lastError.failure, lastError.stackTrace].join('\n')
              return reject(lastError)
            }
            resolve()
          })
          nightwatchClient.start()
        })
      })

      yield * cucumber.run(options.jsonReport)
    })
  }
}
