/* eslint-env mocha */
'use strict'

let loaded = false
let result = ''

module.exports = function () {
  this.Before(function (scenario, cb) {
    result += 'before-' + scenario.getName()
    cb()
  })

  this.After(function (scenario, cb) {
    result += 'after-' + scenario.getName()
    if (process.send) process.send(result)
    cb()
  })

  this.Before(function (scenario) {
    if (!loaded) {
      this.init()
      loaded = true
    }
    this.click('#before-scenario')
  })

  this.After(function (scenario) {
    this.click('#after-scenario')
    this.getText('#hook-result', function (hookResult) {
      if (process.send) process.send(hookResult.value)
    })
  })

  this.Before({ tags: ['@a, @b'] }, function (scenario, cb) {
    result += 'before-a-b-' + scenario.getName()
    cb()
  })

  this.After('@b', function (scenario, cb) {
    result += 'after-b-' + scenario.getName()
    if (process.send) process.send(result)
    cb()
  })
}
