global.nightwatchCucumberHooks = []

module.exports = {
  before: function (cb) {
    process.send('<F')
    cb()
  },

  beforeEach: function (browser, cb) {
    process.send('<f')
    cb()
  },

  after: function (cb) {
    process.send('F>')
    cb()
  },

  afterEach: function (browser, cb) {
    process.send('f>')
    cb()
  }
}
