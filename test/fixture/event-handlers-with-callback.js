/* eslint-env mocha */
'use strict'

let result = ''

module.exports = function () {
  this.registerHandler('BeforeFeatures', function (features, cb) {
    result += features.length
    cb()
  })

  this.registerHandler('BeforeFeature', function (feature, cb) {
    result += feature.name
    cb()
  })

  this.registerHandler('BeforeScenario', function (scenario, cb) {
    result += scenario.name
    cb()
  })

  this.registerHandler('BeforeStep', function (step, cb) {
    result += step.name
    cb()
  })

  this.registerHandler('AfterStep', function (step, cb) {
    result += step.name
    cb()
  })

  this.registerHandler('AfterScenario', function (scenario, cb) {
    result += scenario.name
    cb()
  })

  this.registerHandler('AfterFeature', function (feature, cb) {
    result += feature.name
    cb()
  })

  this.registerHandler('AfterFeatures', function (features, cb) {
    result += features.length
    if (process.send) process.send(result)
    cb()
  })
}
