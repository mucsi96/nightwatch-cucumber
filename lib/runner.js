'use strict'

const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

module.exports = class Runner {

  run (options) {
    const nightwatchApi = new NightwatchApi()

    nightwatchApi.addTestRunner(function * (nightwatchClient) {
      options.featureFiles = nightwatchApi.applyGroupFilters(options.featureFiles)
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
