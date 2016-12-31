/* eslint-env mocha */
'use strict'
const {defineSupportCode} = require('cucumber')

let result = ''

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', (features, cb) => {
    result += features.length
    cb()
  })

  registerHandler('BeforeFeature', (feature, cb) => {
    result += feature.name
    cb()
  })

  registerHandler('BeforeScenario', (scenario, cb) => {
    result += scenario.name
    cb()
  })

  registerHandler('BeforeStep', (step, cb) => {
    result += step.name
    cb()
  })

  registerHandler('AfterStep', (step, cb) => {
    result += step.name
    cb()
  })

  registerHandler('AfterScenario', (scenario, cb) => {
    result += scenario.name
    cb()
  })

  registerHandler('AfterFeature', (feature, cb) => {
    result += feature.name
    cb()
  })

  registerHandler('AfterFeatures', (features, cb) => {
    result += features.length
    if (process.send) process.send(result)
    cb()
  })
})
