const {defineSupportCode} = require('cucumber')

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', function (features, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('BeforeFeature', function (feature, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('BeforeScenario', function (scenario, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('BeforeStep', function (step, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('AfterStep', function (step, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('AfterScenario', function (scenario, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('AfterFeature', function (feature, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })

  registerHandler('AfterFeatures', function (features, cb) {
    setTimeout(function () {
      cb()
    }, 1000)
  })
})
