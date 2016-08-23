global.nightwatchCucumberHooks = []

module.exports = {
  before: function (cb) {
    global.nightwatchCucumberHooks.push('<F')
    cb()
  },

  beforeEach: function (browser, cb) {
    global.nightwatchCucumberHooks.push('<f')
    cb()
  },

  after: function (cb) {
    global.nightwatchCucumberHooks.push('F>')
    console.log(global.nightwatchCucumberHooks.join(''))
    cb()
  },

  afterEach: function (browser, cb) {
    global.nightwatchCucumberHooks.push('f>')
    cb()
  }
}
