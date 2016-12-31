/* eslint-env mocha */
'use strict'
const {defineSupportCode} = require('cucumber')
const {client} = require('../../lib/index')
let loaded = false
let result = ''

defineSupportCode(({Before, After}) => {
  Before((scenarioResult) => {
    if (!loaded) {
      client.init()
      loaded = true
    }
    return client.click('#before-scenario')
  })

  After((scenarioResult) => {
    client.click('#after-scenario')
    return client.getText('#hook-result', function (hookResult) {
      if (process.send) process.send(hookResult.value)
    })
  })

  Before({ tags: '@a or @b' }, (scenarioResult, cb) => {
    result += 'before-a-b-' + scenarioResult.scenario.name
    cb()
  })

  After('@b', (scenarioResult, cb) => {
    result += 'after-b-' + scenarioResult.scenario.name
    if (process.send) process.send(result)
    cb()
  })

  Before('@b', (scenarioResult, cb) => {
    setTimeout(() => {
      result += 'before-b-cb-' + scenarioResult.scenario.name
      cb()
    }, 500)
  })

  After('@b', (scenarioResult, cb) => {
    setTimeout(() => {
      result += 'after-b-cb-' + scenarioResult.scenario.name
      if (process.send) process.send(result)
      cb()
    }, 400)
  })

  Before('@b', (scenarioResult) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        result += 'before-b-promise-' + scenarioResult.scenario.name
        resolve()
      }, 500)
    })
  })

  After('@b', (scenarioResult) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        result += 'after-b-promise-' + scenarioResult.scenario.name
        if (process.send) process.send(result)
        resolve()
      }, 400)
    })
  })
})
