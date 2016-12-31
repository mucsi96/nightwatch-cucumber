/* eslint-env mocha */
const chai = require('chai')
const rimraf = require('rimraf')
const testApp = require('./test-app')

chai.use((_chai, utils) => {
  const Assertion = _chai.Assertion

  Assertion.addProperty('passed', function () {
    new Assertion(this._obj).to.equal('passed')
  })

  Assertion.addProperty('undefined', function () {
    new Assertion(this._obj).to.equal('undefined')
  })

  Assertion.addProperty('failed', function () {
    new Assertion(this._obj).to.equal('failed')
  })

  Assertion.addProperty('ambiguous', function () {
    new Assertion(this._obj).to.equal('ambiguous')
  })

  Assertion.addProperty('pending', function () {
    new Assertion(this._obj).to.equal('pending')
  })
})

before(() => {
  rimraf.sync('coverage')
  rimraf.sync('tmp')
  testApp.start()
})

after(() => {
  console.log('shutting down test app')
  testApp.stop()
})

process.on('uncaughtException', (err) => {
  console.log(err)
  console.log('shutting down test app')
  testApp.stop()
})
