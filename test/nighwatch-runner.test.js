/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Nightwatch runner', () => {
  it('should handle simple tests', () => {
    return testCaseFactory
      .create('simpleTest')
      .feature('addition')
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
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle multi feature tests', () => {
    return testCaseFactory
      .create('multiFeatureTest')
      .feature('addition')
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
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].result.status.should.be.passed
        result.features[1].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[1].scenarios[0].result.status.should.be.passed
        result.features[1].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].scenarios[1].result.status.should.be.passed
        result.features[1].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
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
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
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

  it.skip('should handle JS error in step definition', () => {
    return testCaseFactory
      .create('stepDefinitionJSErrorTest')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.initte() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 8) })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, passed: 4})
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

  it('should handle background steps', () => {
    return testCaseFactory
      .create('backgroundStepTest')
      .feature('addition')
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
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle test groups', () => {
    return testCaseFactory
      .create('testGroupTest')
      .group('positive')
      .feature('positive addition')
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
      .feature('negative addition')
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
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].result.status.should.be.passed
        result.features[1].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[1].scenarios[0].result.status.should.be.passed
        result.features[1].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].scenarios[1].result.status.should.be.passed
        result.features[1].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle test group filtering', () => {
    return testCaseFactory
      .create('testGroupFilteringTest')
      .group('positive')
      .feature('positive addition')
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
      .feature('negative addition')
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
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle test group skipping', () => {
    return testCaseFactory
      .create('testGroupSkippingTest')
      .group('positive')
      .feature('positive addition')
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
      .feature('negative addition')
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
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle scenario outlines', () => {
    return testCaseFactory
      .create('scenarioOutlineTest')
      .feature('addition')
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
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle page objects', () => {
    return testCaseFactory
      .create('pageObjectTest')
      .pageObject('calculator', `module.exports = {
  elements: {
    numberA: '#a',
    numberB: '#b',
    addButton: '#add',
    result: '#result'
  }
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.page.calculator().setValue('@numberA', 4) })
      .and('User enter 5 in B field', function () { this.page.calculator().setValue('@numberB', 5) })
      .when('User press Add button', function () { this.page.calculator().click('@addButton') })
      .then('The result should contain 9', function () { this.page.calculator().assert.containsText('@result', 9) })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 1})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle paralell tests', () => {
    return testCaseFactory
      .create('paralellTest', { paralell: true })
      .feature('addition')
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
      .then((result) => {
        result.output.should.contain('OK. 4  total assertions passed.')
      })
  })

  it('should handle feature tag filtering', () => {
    return testCaseFactory
      .create('featureTagFilteringTest')
      .feature('positive addition', ['positive', 'addition'])
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
      .feature('negative addition', ['negative', 'addition'])
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
      .run('nightwatch', ['--tag', 'negative'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle feature tag skipping', () => {
    return testCaseFactory
      .create('featureTagSkippingTest')
      .feature('positive addition', ['positive', 'addition'])
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
      .feature('negative addition', ['negative', 'addition'])
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
      .run('nightwatch', ['--skiptags', 'positive'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })
})
