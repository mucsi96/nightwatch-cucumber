/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Nightwatch runner', () => {
  it('should handle simple tests', () => {
    return testCaseFactory
      .create('simpleTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .and('User enter 5 in B field', function () {this.setValue('#b', 5)})
      .when('User press Add button', function () {this.click('#add')})
      .then('The result should contain 9', function () {this.assert.containsText('#result', 9)})
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        features[0].scenarios[0].result.status.should.be.passed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        features[0].scenarios[1].result.status.should.be.passed
        features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle undefined steps', () => {
    return testCaseFactory
      .create('undefinedStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field')
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({undefined: 1})
        features[0].scenarios[0].result.status.should.be.undefined
        features[0].scenarios[0].result.stepCounts.should.deep.equal({undefined: 1, passed: 1})
      })
  });

  it('should handle ambiguous steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({ambiguous: 1})
        features[0].scenarios[0].result.status.should.be.ambiguous
        features[0].scenarios[0].result.stepCounts.should.deep.equal({ambiguous: 2, passed: 1})
      })
  });

  it('should handle pending steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function (callback) {callback(null, 'pending')})
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({pending: 1})
        features[0].scenarios[0].result.status.should.be.pending
        features[0].scenarios[0].result.stepCounts.should.deep.equal({pending: 1, passed: 1})
      })
  });

  it('should handle failed steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .and('User enter 5 in B field', function () {this.setValue('#b', 5)})
      .when('User press Add button', function () {this.click('#add')})
      .then('The result should contain 9', function () {this.assert.containsText('#result', 8)})
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        features[0].scenarios[0].result.status.should.be.failed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, passed: 4})
      })
  });

  it('should handle skipped steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () {this.init()})
      .and('User enter 4 in A field', function () {this.setValue('#a', 4)})
      .and('User enter 5 in B field', function () {this.setValue('#b', 5)})
      .when('User press Add button', function () {this.click('#add')})
      .then('The result should contain 9', function () {this.assert.containsText('#result', 8)})
      .and('User enter 4 in A field')
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        features[0].scenarios[0].result.status.should.be.failed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 1, failed: 1, passed: 4})
      })
  });
})
