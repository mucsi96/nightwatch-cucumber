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
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .and('User enter 5 in B field', function () {this.setValue('#b', 5)})
      .when('User press Add button', function () {this.click('#add')})
      .then('The result should contain 9', function () {this.assert.containsText('#result', 9)})
      .run()
      .then((features) => {
        features[0].scenarios[0].result.status.should.be.passed
      })
  })
})
