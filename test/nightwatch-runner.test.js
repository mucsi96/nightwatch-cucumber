/* eslint-env mocha */
const chai = require('chai')
chai.should()
const utils = require('./test-utils')
const testCaseFactory = require('./test-case-factory')

describe('Nightwatch runner', () => {
  it('should handle simple tests', (done) => {
    testCaseFactory
      .create('aaaa')
      .feature('adition')
      .scenario('small numbers')
      .given('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .build()

    return utils.runTest('aaaa')
      .then((result) => {
        result.length.should.equal(1)
      })
      .then(done, done)
  })
})
