/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('BDD handling', () => {
  it('should handle simple tests', () => {
    return testCaseFactory
      .create('simple-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
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
      .create('multi-feature-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('subtraction')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter 9 in A field', () => client.setValue('#a', 9))
      .and('User enter 3 in B field', () => client.setValue('#b', 3))
      .when('User press Subtract button', () => client.click('#subtract'))
      .then('The result should contain 6', () => client.assert.containsText('#result', 6))
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Subtract button')
      .then('The result should contain -1', () => client.assert.containsText('#result', -1))
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

  it('should handle background steps', () => {
    return testCaseFactory
      .create('background-step-test')
      .feature('addition')
      .background()
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .scenario('small numbers')
      .given('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .scenario('big numbers')
      .and('User enter 6 in B field', () => client.setValue('#b', 6))
      .when('User press Add button')
      .then('The result should contain 10', () => client.assert.containsText('#result', 10))
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

  it('should handle scenario outlines', () => {
    return testCaseFactory
      .create('scenario-outline-test')
      .feature('addition')
      .scenarioOutline('numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter <a> in A field', (a) => client.setValue('#a', a))
      .and('User enter <b> in B field', (b) => client.setValue('#b', b))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain <result>', (result) => client.assert.containsText('#result', result))
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
})
