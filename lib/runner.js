'use strict'

const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

module.exports = class Runner {

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

  run (options) {
    const self = this
    const nightwatchApi = new NightwatchApi()

    nightwatchApi.addTestRunner(function * (nightwatchClient) {
      options.featureFiles = nightwatchApi.applySrcFilters(options.featureFiles)
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
              lastError.stack = lastError.message + '\n' + lastError.stack
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
