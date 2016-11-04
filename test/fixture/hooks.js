/* eslint-env mocha */
'use strict'

let loaded = false
let result = ''

module.exports = function () {
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

  this.Before('@b', function (scenario, cb) {
    setTimeout(function () {
      result += 'before-b-cb-' + scenario.getName()
      cb()
    }, 500)
  })

  this.After('@b', function (scenario, cb) {
    setTimeout(function () {
      result += 'after-b-cb-' + scenario.getName()
      if (process.send) process.send(result)
      cb()
    }, 400)
  })

  this.Before('@b', function (scenario) {
    return new Promise((resolve) => {
      setTimeout(function () {
        result += 'before-b-promise-' + scenario.getName()
        resolve()
      }, 500)
    })
  })

  this.After('@b', function (scenario) {
    return new Promise((resolve) => {
      setTimeout(function () {
        result += 'after-b-promise-' + scenario.getName()
        if (process.send) process.send(result)
        resolve()
      }, 400)
    })
  })

  this.Before('@b', function * (scenario) {
    yield new Promise((resolve) => {
      setTimeout(function () {
        result += 'before-b-generator-' + scenario.getName()
        resolve()
      }, 500)
    })
  })

  this.After('@b', function * (scenario) {
    yield new Promise((resolve) => {
      setTimeout(function () {
        result += 'after-b-generator-' + scenario.getName()
        if (process.send) process.send(result)
        resolve()
      }, 400)
    })
  })
}
