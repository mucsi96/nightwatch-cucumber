/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Nightwatch runner', () => {
  it('should handle simple tests', () => {
    return testCaseFactory
      .create('aaaa')
      .feature('adition')
      .scenario('small numbers')
      .given('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .run()
      .then((features) => {
        console.log(require('util').inspect(features, null, 10))
        features[0].scenarios[0].result.status.should.be.passed
      })
  })
})
