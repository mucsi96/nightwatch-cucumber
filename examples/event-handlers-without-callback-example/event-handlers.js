module.exports = function () {
  this.registerHandler('BeforeFeatures', function () {
    this.init()
    this.click('#before-features')
  })

  this.registerHandler('BeforeFeature', function () {
    this.click('#before-feature')
  })

  this.registerHandler('BeforeScenario', function () {
    this.click('#before-scenario')
  })

  this.registerHandler('BeforeStep', function () {
    this.click('#before-step')
  })

  this.registerHandler('AfterStep', function () {
    this.click('#after-step')
  })

  this.registerHandler('AfterScenario', function () {
    this.click('#after-scenario')
  })

  this.registerHandler('AfterFeature', function () {
    this.click('#after-feature')
  })

  this.registerHandler('AfterFeatures', function () {
    this.click('#after-features')
  })
}
