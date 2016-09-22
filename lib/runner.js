'use strict'

const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const glob = require('glob')
const mkdirp = require('mkdirp')
const pify = require('pify')
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

  addIndexToFileName (fileName, index) {
    const cutIndex = fileName.lastIndexOf('.')
    const ext = fileName.slice(cutIndex)
    const rest = fileName.slice(0, cutIndex)
    return `${rest}-${index}${ext}`
  }

  run (options) {
    const self = this
    const nightwatchApi = new NightwatchApi()
    const cucumber = new CucumberApi(options)
    const dummyPaths = options.featureFiles.map((srcPath) => path.join(dummyTestModulesFolder, srcPath))

    this.generateDummyTestModules(options.featureFiles)

    nightwatchApi.addHookAfterChildProcesses(function * () {
      const reports = yield pify(glob)(self.addIndexToFileName(options.jsonReport, '*'))
      yield * cucumber.mergeCucumberJsonReports(reports, options.jsonReport)
      yield * cucumber.createCucumberHtmlReport(options)
    })

    nightwatchApi.addTestModulePaths(dummyPaths)

    nightwatchApi.addPathConverter(this.featurePathToDummyPath.bind(this), this.dummyPathToFeaturePath.bind(this))

    nightwatchApi.addTestRunner(function * (nightwatchClient, dummyTestModules) {
      options.featureFiles = dummyTestModules.map((dummyTestModule) => self.dummyPathToFeaturePath(dummyTestModule))
      options.tags = self.getTags(nightwatchApi.nightwatchArgv).concat(self.getSkipTags(nightwatchApi.nightwatchArgv))

      cucumber.addStepFailureHook(function * (stepResult) {
        const screenshot = yield * nightwatchApi.takeScreenshot(stepResult.feature + '.png')
        yield * stepResult.attach(screenshot.data, screenshot.mimeType)
      })

      cucumber.addStepDefinitionRunner(function * (stepDefinition, parameters, scenario) {
        yield new Promise((resolve, reject) => {
          const nightwatch = nightwatchClient.api()
          nightwatchClient.on('error', reject)
          nightwatch.perform(() => {
            try {
              nightwatchClient.get().results.lastError = null
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
              lastError.stack = [lastError.message, lastError.stack].join('\n')
              return reject(lastError)
            }
            resolve()
          })
          nightwatchClient.start()
        })
      })

      if (process.env.__NIGHTWATCH_PARALLEL_MODE === '1') {
        const workerIndex = process.env.__NIGHTWATCH_ENV_KEY.split('_').pop()
        options.jsonReport = self.addIndexToFileName(options.jsonReport, workerIndex)
      }

      yield * cucumber.run(options.jsonReport)

      if (process.env.__NIGHTWATCH_PARALLEL_MODE !== '1') {
        yield * cucumber.createCucumberHtmlReport(options)
      }
    })
  }
}
