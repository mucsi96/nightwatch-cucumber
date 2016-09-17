/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Error handling', () => {
  it('should handle no test case', () => {
    return testCaseFactory
      .create('noTestTest', {
        noTests: true
      })
      .run()
      .then((result) => {
        result.should.have.ownProperty('features')
        result.output.should.contain('No tests defined!')
        result.output.should.contain('Selenium process finished.')
      })
  })

  it('should handle undefined steps', () => {
    return testCaseFactory
      .create('undefinedStepTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field')
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({undefined: 1})
        result.features[0].scenarios[0].result.status.should.be.undefined
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({undefined: 1, passed: 1})
      })
  })

  it('should handle ambiguous steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({ambiguous: 1})
        result.features[0].scenarios[0].result.status.should.be.ambiguous
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({ambiguous: 2, passed: 1})
      })
  })

  it('should handle pending steps', () => {
    return testCaseFactory
      .create('pendingStepTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function (callback) { callback(null, 'pending') })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({pending: 1})
        result.features[0].scenarios[0].result.status.should.be.pending
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({pending: 1, passed: 1})
      })
  })

  it('should handle failed steps', () => {
    return testCaseFactory
      .create('failedStepTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 8', function () { this.assert.containsText('#result', 8) })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, passed: 4})
      })
  })

  it('should handle JS error in step definition in a one step case', () => {
    return testCaseFactory
      .create('stepDefinitionJSErrorSimpleTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.initte() })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1})
      })
  })

  it('should handle JS error in step definition', () => {
    return testCaseFactory
      .create('stepDefinitionJSErrorTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page. JS error included', function () { this.initte() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
      .scenario('big numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 82 in A field', function () { this.setValue('#a', 82) })
      .and('User enter 11 in B field', function () { this.setValue('#b', 11) })
      .when('User press Add button')
      .then('The result should contain 93', function () { this.assert.containsText('#result', 93) })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1, passed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, skipped: 4})
      })
  })

  it('should handle skipped steps', () => {
    return testCaseFactory
      .create('skippedStepTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
      .and('User enter 4 in A field')
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 1, failed: 1, passed: 4})
      })
  })
})
