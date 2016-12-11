/* eslint-env mocha */
'use strict'

let result = ''

module.exports = function () {
  this.registerHandler('BeforeFeatures', (client, features, cb) => {
    result += features.length
    cb()
  })

  this.registerHandler('BeforeFeature', (client, feature, cb) => {
    result += feature.name
    cb()
  })

  this.registerHandler('BeforeScenario', (client, scenario, cb) => {
    result += scenario.name
    cb()
  })

  this.registerHandler('BeforeStep', (client, step, cb) => {
    result += step.name
    cb()
  })

  this.registerHandler('AfterStep', (client, step, cb) => {
    result += step.name
    cb()
  })

  this.registerHandler('AfterScenario', (client, scenario, cb) => {
    result += scenario.name
    cb()
  })

  this.registerHandler('AfterFeature', (client, feature, cb) => {
    result += feature.name
    cb()
  })

  this.registerHandler('AfterFeatures', (client, features, cb) => {
    result += features.length
    if (process.send) process.send(result)
    cb()
  })
}
