/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Assertion features', () => {
  it('should enable the usage of client in page object custom commands', () => {
    return testCaseFactory
      .create('client-in-page-object-custom-commands-test')
      .pageObject('calculator', `
      const commands = {
        setA: function (value) {
          return this.setValue('@a', value)
        },
        setB: function (value) {
          return this.setValue('@b', value)
        },
        pressAdd: function () {
          this.api.pause(1000)
          return this.click('@add')
        },
        checkResult: function (expectedResult) {
          return this.assert.containsText('@result', expectedResult)
        }
      }
      module.exports = {
        url: 'http://yahoo.com',
        elements: {
          body: 'body',
          a: '#a',
          b: '#b',
          add: '#add',
          result: '#result',
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

  it('should enable the usage of shared client in page object custom commands', () => {
    return testCaseFactory
      .create('shared-client-in-page-object-custom-commands-test')
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

  it('should enable the usage of client in sub page object custom commands', () => {
    return testCaseFactory
      .create('client-in-sub-page-object-custom-commands-test')
      .pageObject('shared/core', `module.exports = {
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
      const shared = client.page.shared.core()
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
