var path = require('nightwatch-cucumber')({
  runner: 'cucumber'
})

module.exports = {
  default: '--require ' + path + ' --require features'
}
