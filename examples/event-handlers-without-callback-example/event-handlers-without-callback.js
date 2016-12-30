const {defineSupportCode} = require('cucumber')
const {client} = require('nightwatch-cucumber')

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', function () {
    return client
      .init()
      .click('#before-features')
  })

  registerHandler('BeforeFeature', function () {
    return client.click('#before-feature')
  })

  registerHandler('BeforeScenario', function () {
    return client.click('#before-scenario')
  })

  registerHandler('BeforeStep', function () {
    return client.click('#before-step')
  })

  registerHandler('AfterStep', function () {
    return client.click('#after-step')
  })

  registerHandler('AfterScenario', function () {
    return client.click('#after-scenario')
  })

  registerHandler('AfterFeature', function () {
    return client.click('#after-feature')
  })

  registerHandler('AfterFeatures', function () {
    return client.click('#after-features')
  })
})
