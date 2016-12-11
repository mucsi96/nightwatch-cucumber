/* eslint-env mocha */
'use strict'

module.exports = function () {
  this.registerHandler('BeforeFeatures', (client) => {
    client.init()
    client.click('#before-features')
  })

  this.registerHandler('BeforeFeature', (client) => {
    client.click('#before-feature')
  })

  this.registerHandler('BeforeScenario', (client) => {
    client.click('#before-scenario')
  })

  this.registerHandler('BeforeStep', (client) => {
    client.click('#before-step')
  })

  this.registerHandler('AfterStep', (client) => {
    client.click('#after-step')
  })

  this.registerHandler('AfterScenario', (client) => {
    client.click('#after-scenario')
  })

  this.registerHandler('AfterFeature', (client) => {
    client.click('#after-feature')
  })

  this.registerHandler('AfterFeatures', (client) => {
    client.click('#after-features')
    client.getText('#hook-result', (hookResult) => {
      if (process.send) {
        process.send(hookResult.value)
      }
    })
  })
}
