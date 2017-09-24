/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Utility features', () => {
  it('should be able to run together with plain Nightwatch tests', () => {
    return testCaseFactory
      .create('include-plain-nightwatch-tests', { includePlainNightwatchTests: true })
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
        result.output.should.contain('OK. 4  total assertions passed.')
      })
  })

  it('should handle paralell tests', () => {
    return testCaseFactory
      .create('paralell-test', { paralell: true })
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

  it('should be able to run using Gulp build tool', () => {
    return testCaseFactory
      .create('gulp-build-test', { gulp: true })
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
        result.output.should.contain('Finished \'default\' after')
      })
  })

  it('should be able to run using Grunt build tool', () => {
    return testCaseFactory
      .create('grunt-build-test', { grunt: true })
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
        result.output.should.contain('Running "nightwatch:default" (nightwatch) task')
      })
  })

  it('should be able to run using programmatical API', () => {
    return testCaseFactory
      .create('run-programmatical-test', { programmatical: true })
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

  it('should work together with babel', () => {
    return testCaseFactory
      .create('babel-example', { babel: true })
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', `async () => {
        await client.init()
        await client.setValue('#a', 4)
        await client.setValue('#b', 5)
        await client.click('#add')
      }`)
      .then('The result should contain 9', `async () => {
        await client.assert.containsText('#result', 9)
      }`)
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 1})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 2})
      })
  })

  it('should enable the usage of client in page object custom commands', () => {
    return testCaseFactory
      .create('client-in-page-object-custom-commands-test')
      .pageObject('shared', `module.exports = {
        url: 'http://yahoo.com',
        elements: {
          body: 'body',
          a: '#a',
          b: '#b',
          add: '#add',
          result: '#result'
        }
      }`)
      .pageObject('calculator', `const { client } = require('../../../lib/index')
      const shared = client.page.shared()
      const commands = {
        setA: function (value) {
          return shared.setValue('@a', value)
        },
        setB: function (value) {
          return shared.setValue('@b', value)
        },
        pressAdd: function () {
          return shared.click('@add')
        },
        checkResult: function (expectedResult) {
          return shared.assert.containsText('@result', expectedResult)
        }
      }
      module.exports = {
        url: 'http://yahoo.com',
        elements: {
          body: 'body',
          searchBar: 'input[name="p"]'
        },
        commands: [commands]
      }`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.page.calculator().setA(4))
      .and('User enter 5 in B field', () => client.page.calculator().setB(5))
      .when('User press Add button', () => client.page.calculator().pressAdd())
      .then('The result should contain 9', () => client.page.calculator().checkResult(9))
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 1})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
      })
  })
})
