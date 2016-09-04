'use strict'

const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

module.exports = class Runner {

  run (options) {
    const nightwatchApi = new NightwatchApi()

    nightwatchApi.addTestRunner(function * (nightwatchClient) {
      const cucumber = new CucumberApi(options)

      cucumber.addStepDefinitionRunner(function * (stepDefinition, parameters) {
        yield new Promise((resolve, reject) => {
          const nightwatch = nightwatchClient.api()
          nightwatchClient.on('error', reject)
          nightwatch.perform(() => {
            try {
              stepDefinition.apply(nightwatch, parameters)
            } catch (err) {
              nightwatchClient.removeListener('error', reject)
              return reject(err)
            }
          })
          nightwatch.perform(() => {
            nightwatchClient.removeListener('error', reject)
            resolve()
          })
          nightwatchClient.start()
        })
      })

      yield * cucumber.run(options.jsonReport)
    })
  }
}
