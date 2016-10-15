/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.should()

let result = ''

module.exports = function () {
  this.registerHandler('BeforeFeatures', function (features, cb) {
    result += features.length
    cb()
  })

  this.registerHandler('BeforeFeature', function (feature, cb) {
    result += feature.getName()
    cb()
  })

  this.registerHandler('BeforeScenario', function (scenario, cb) {
    result += scenario.getName()
    cb()
  })

  this.registerHandler('BeforeStep', function (step, cb) {
    result += step.getName()
    cb()
  })

  this.registerHandler('AfterStep', function (step, cb) {
    result += step.getName()
    cb()
  })

  this.registerHandler('AfterScenario', function (scenario, cb) {
    result += scenario.getName()
    cb()
  })

  this.registerHandler('AfterFeature', function (feature, cb) {
    result += feature.getName()
    cb()
  })

  this.registerHandler('AfterFeatures', function (features, cb) {
    result += features.length
    if (process.send) process.send(result)
    cb()
  })
}
