/* eslint-env mocha */
const chai = require('chai')
const testApp = require('./test-app')

chai.use((_chai, utils) => {
  const Assertion = _chai.Assertion

  Assertion.addProperty('passed', () => {
    new Assertion(this._obj).to.equal('passed')
  })

})

before(() => {
  testApp.start()
})

after(() => {
  testApp.stop()
})
