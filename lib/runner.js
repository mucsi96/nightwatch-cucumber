'use strict'

const glob = require('glob')
const path = require('path')
const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

module.exports = class Runner {

  constructor (options) {
    this.options = options
  }

  run () {
    this.nightwatch = new NightwatchApi()
    const expandedFeaturePaths = glob
      .sync(this.options.featureFiles + '/**/*.feature')
      .map((filename) => path.join(process.cwd(), filename))

    this.cucumber = new CucumberApi(this.options)
    this.cucumber.hookUp()

    this.nightwatch.addTestFiles(expandedFeaturePaths)
    this.nightwatch.addTestModuleRunner(this.isFeatureFile, this.runFeatureFile.bind(this))
    this.nightwatch.hookUp()
  }

  * runFeatureFile (nightwatchClient, featureFile) {
    this.cucumber.setStepDefinitionTrap(function * (stepDefinition) {
      yield new Promise((resolve, reject) => {
        nightwatchClient.on('error', reject)
        this.perform(() => {
          stepDefinition.apply(this)
        })
        this.perform(() => {
          nightwatchClient.removeListener('error', reject)
          resolve()
        })
        nightwatchClient.start()
      })
    })
    yield * this.cucumber.run(nightwatchClient.api(), featureFile)
    yield new Promise((resolve, reject) => {
      nightwatchClient.get().on('nightwatch:finished', function () {
        resolve()
      })
      nightwatchClient.terminate()
    })
  }

  isFeatureFile (fileName) {
    return path.extname(fileName) === '.feature'
  }
}
