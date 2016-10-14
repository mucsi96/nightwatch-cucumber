module.exports = function () {
  this.registerHandler('BeforeFeatures', function (features, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('BeforeFeature', function (feature, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('BeforeScenario', function (scenario, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('BeforeStep', function (step, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('AfterStep', function (step, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('AfterScenario', function (scenario, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('AfterFeature', function (feature, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })

  this.registerHandler('AfterFeatures', function (features, cb) {
    setTimeout(function () {
      cb();
    }, 1000);
  })
}
