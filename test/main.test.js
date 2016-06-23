/* eslint-env mocha */
const testApp = require('./test-app')

before(() => {
  testApp.start()
})

after(() => {
  testApp.stop()
})
