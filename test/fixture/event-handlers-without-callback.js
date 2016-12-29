/* eslint-env mocha */
'use strict'
const {defineSupportCode} = require('cucumber')
const client = require('../../lib/index').client

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', () => {
    client.init()
    client.click('#before-features')
  })

  registerHandler('BeforeFeature', () => {
    client.click('#before-feature')
  })

  registerHandler('BeforeScenario', () => {
    client.click('#before-scenario')
  })

  registerHandler('BeforeStep', () => {
    client.click('#before-step')
  })

  registerHandler('AfterStep', () => {
    client.click('#after-step')
  })

  registerHandler('AfterScenario', () => {
    client.click('#after-scenario')
  })

  registerHandler('AfterFeature', () => {
    client.click('#after-feature')
  })

  registerHandler('AfterFeatures', () => {
    client.click('#after-features')
    client.getText('#hook-result', (hookResult) => {
      if (process.send) {
        process.send(hookResult.value)
      }
    })
  })
})
