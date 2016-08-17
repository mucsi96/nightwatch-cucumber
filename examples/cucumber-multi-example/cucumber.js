var nightwatchCucumber = require('nightwatch-cucumber')({
  runner: 'cucumber'
})

module.exports = {
  default: '--require ' + nightwatchCucumber + ' --require features'
}
