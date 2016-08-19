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
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
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

  it('should handle multi feature tests', () => {
    return testCaseFactory
      .create('simpleTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('subtraction')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter 9 in A field', function () { this.setValue('#a', 9) })
      .and('User enter 3 in B field', function () { this.setValue('#b', 3) })
      .when('User press Subtract button', function () { this.click('#subtract') })
      .then('The result should contain 6', function () { this.assert.containsText('#result', 6) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Subtract button')
      .then('The result should contain -1', function () { this.assert.containsText('#result', -1) })
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        features[0].scenarios[0].result.status.should.be.passed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        features[0].scenarios[1].result.status.should.be.passed
        features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
        features[1].result.status.should.be.passed
        features[1].result.scenarioCounts.should.deep.equal({passed: 2})
        features[1].scenarios[0].result.status.should.be.passed
        features[1].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        features[1].scenarios[1].result.status.should.be.passed
        features[1].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle undefined steps', () => {
    return testCaseFactory
      .create('undefinedStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field')
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({undefined: 1})
        features[0].scenarios[0].result.status.should.be.undefined
        features[0].scenarios[0].result.stepCounts.should.deep.equal({undefined: 1, passed: 1})
      })
  })

  it('should handle ambiguous steps', () => {
    return testCaseFactory
      .create('ambiguousStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({ambiguous: 1})
        features[0].scenarios[0].result.status.should.be.ambiguous
        features[0].scenarios[0].result.stepCounts.should.deep.equal({ambiguous: 2, passed: 1})
      })
  })

  it('should handle pending steps', () => {
    return testCaseFactory
      .create('pendingStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function (callback) { callback(null, 'pending') })
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({pending: 1})
        features[0].scenarios[0].result.status.should.be.pending
        features[0].scenarios[0].result.stepCounts.should.deep.equal({pending: 1, passed: 1})
      })
  })

  it('should handle failed steps', () => {
    return testCaseFactory
      .create('failedStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        features[0].scenarios[0].result.status.should.be.failed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, passed: 4})
      })
  })

  it('should handle skipped steps', () => {
    return testCaseFactory
      .create('skippedStepTest')
      .feature('adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
      .and('User enter 4 in A field')
      .run()
      .then((features) => {
        features[0].result.status.should.be.failed
        features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        features[0].scenarios[0].result.status.should.be.failed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 1, failed: 1, passed: 4})
      })
  })

  it('should handle background steps', () => {
    return testCaseFactory
      .create('backgroundStepTest')
      .feature('adition')
      .background()
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .scenario('small numbers')
      .given('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .and('User enter 6 in B field', function () { this.setValue('#b', 6) })
      .when('User press Add button')
      .then('The result should contain 10', function () { this.assert.containsText('#result', 10) })
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

  it('should handle test groups', () => {
    return testCaseFactory
      .create('testGroupTest')
      .group('positive')
      .feature('positive adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run()
      .then((features) => {
        features[0].result.status.should.be.passed
        features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        features[0].scenarios[0].result.status.should.be.passed
        features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        features[0].scenarios[1].result.status.should.be.passed
        features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
        features[1].result.status.should.be.passed
        features[1].result.scenarioCounts.should.deep.equal({passed: 2})
        features[1].scenarios[0].result.status.should.be.passed
        features[1].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        features[1].scenarios[1].result.status.should.be.passed
        features[1].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle test group filtering', () => {
    return testCaseFactory
      .create('testGroupTest')
      .group('positive')
      .feature('positive adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--group', 'negative'])
      .then((features) => {
        features.length.should.equal(1)
        features[0].name.should.equal('negative adition')
        features[0].result.status.should.be.passed
      })
  })

  it('should handle test group skipping', () => {
    return testCaseFactory
      .create('testGroupTest')
      .group('positive')
      .feature('positive adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative adition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--skipgroup', 'positive'])
      .then((features) => {
        features.length.should.equal(1)
        features[0].name.should.equal('negative adition')
        features[0].result.status.should.be.passed
      })
  })

  it('should handle scenario outlines', () => {
    return testCaseFactory
      .create('backgroundStepTest')
      .feature('adition')
      .scenarioOutline('numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter <a> in A field', function (a) { this.setValue('#a', a) })
      .and('User enter <b> in B field', function (b) { this.setValue('#b', b) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain <result>', function (result) { this.assert.containsText('#result', result) })
      .example('a', 'b', 'result')
      .example('1', '1', '2')
      .example('78', '22', '100')
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
})
