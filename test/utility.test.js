/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Utility features', () => {
  it('should be able to run together with plain Nightwatch tests', () => {
    return testCaseFactory
      .create('includePlainNightwatchTests', { includePlainNightwatchTests: true })
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
        result.output.should.contain('OK. 4  total assertions passed.')
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

  it('should handle hooks', () => {
    return testCaseFactory
      .create('hookTest', { hooks: true })
      .feature('addition')
      .scenario('small numbers')
      .given('Nothing', function () {})
      .when('Nothing')
      .then('Nothing')
      .scenario('big numbers')
      .given('Nothing')
      .when('Nothing')
      .then('Nothing')
      .feature('subtraction')
      .scenario('small numbers')
      .given('Nothing')
      .when('Nothing')
      .then('Nothing')
      .scenario('big numbers')
      .given('Nothing')
      .when('Nothing')
      .then('Nothing')
      .run()
      .then((result) => {
        result.ipcMessages.should.contain('<F<f<S<ss><ss><ss>S><S<ss><ss><ss>S>f><f<S<ss><ss><ss>S><S<ss><ss><ss>S>f>F>')
      })
  })
})
