/* eslint-env mocha */
'use strict'

let loaded = false
let result = ''

module.exports = function () {
  this.Before(function (scenarioResult) {
    if (!loaded) {
      this.init()
      loaded = true
    }
    this.click('#before-scenario')
  })

  this.After(function (scenarioResult) {
    this.click('#after-scenario')
    this.getText('#hook-result', function (hookResult) {
      if (process.send) process.send(hookResult.value)
    })
  })

  this.Before({ tags: '@a or @b' }, function (scenarioResult, cb) {
    result += 'before-a-b-' + scenarioResult.scenario.name
    cb()
  })

  this.After('@b', function (scenarioResult, cb) {
    result += 'after-b-' + scenarioResult.scenario.name
    if (process.send) process.send(result)
    cb()
  })

  this.Before('@b', function (scenarioResult, cb) {
    setTimeout(function () {
      result += 'before-b-cb-' + scenarioResult.scenario.name
      cb()
    }, 500)
  })

  this.After('@b', function (scenarioResult, cb) {
    setTimeout(function () {
      result += 'after-b-cb-' + scenarioResult.scenario.name
      if (process.send) process.send(result)
      cb()
    }, 400)
  })

  this.Before('@b', function (scenarioResult) {
    return new Promise((resolve) => {
      setTimeout(function () {
        result += 'before-b-promise-' + scenarioResult.scenario.name
        resolve()
      }, 500)
    })
  })

  this.After('@b', function (scenarioResult) {
    return new Promise((resolve) => {
      setTimeout(function () {
        result += 'after-b-promise-' + scenarioResult.scenario.name
        if (process.send) process.send(result)
        resolve()
      }, 400)
    })
  })
}
