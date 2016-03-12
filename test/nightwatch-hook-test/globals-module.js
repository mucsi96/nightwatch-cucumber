module.exports = {
  before: function (cb) {
    console.log('Runs before all features')
    cb()
  },

  beforeEach: function (browser, cb) {
    console.log('Runs before feature')
    cb()
  },

  after: function (cb) {
    console.log('Runs after all features')
    cb()
  },

  afterEach: function (browser, cb) {
    console.log('Runs after feature')
    cb()
  }
}
