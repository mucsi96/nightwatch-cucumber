/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Error handling', () => {
  it('should handle no test case', () => {
    return testCaseFactory
      .create('no-test-test', {
        noTests: true
      })
      .run()
      .then((result) => {
        result.should.have.ownProperty('features')
        result.output.should.contain('No tests defined!')
        result.exitCode.should.equal(1)
      })
  })

  it('should handle undefined steps', () => {
    return testCaseFactory
      .create('undefined-step-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
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
      .create('ambiguous-step-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
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
      .create('pending-step-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => 'pending')
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
      .create('failed-step-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 8', () => client.assert.containsText('#result', 8))
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 82 in A field', () => client.setValue('#a', 82))
      .and('User enter 11 in B field', () => client.setValue('#b', 11))
      .when('User press Add button')
      .then('The result should contain 93', () => client.assert.containsText('#result', 93))
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1, passed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({failed: 1, passed: 4})
      })
  })

  it('should handle JS error in step definition in a one step case', () => {
    return testCaseFactory
      .create('step-definition-js-error-simple-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.initte())
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
      .create('step-definition-js-error-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page. JS error included', () => client.initte())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .scenario('big numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 82 in A field', () => client.setValue('#a', 82))
      .and('User enter 11 in B field', () => client.setValue('#b', 11))
      .when('User press Add button')
      .then('The result should contain 93', () => client.assert.containsText('#result', 93))
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
      .create('skipped-step-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 8))
      .and('User enter 4 in A field')
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 1, failed: 1, passed: 4})
      })
  })

  it('should handle bad feature file format', () => {
    return testCaseFactory
      .create('bad-feature-file-format-test', {
        badFeatureFile: true
      })
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .run()
      .then((result) => {
        result.output.should.contain('Error: (1:1):')
        result.exitCode.should.equal(1)
      })
  })

  it('should handle errors in custom commands', () => {
    return testCaseFactory
      .create('custom-commands-test', {
        cucumberArgs: [
          '--format', 'summary',
          '--format', 'json:reports/cucumber.json',
          '--format-options', '{"colorsEnabled":false}'
        ]
      })
      .customCommand('testCommand', `module.exports.command = function () {
    var test = undefinedVar;
    return this;
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.testCommand())
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 3, failed: 1, passed: 1})
        result.output.should.contain('Error while running testCommand command: undefinedVar is not defined')
      })
  })

  it('should handle errors in page object custom commands', () => {
    return testCaseFactory
      .create('page-object-custom-commands-test', {
        cucumberArgs: [
          '--format', 'summary',
          '--format', 'json:reports/cucumber.json',
          '--format-options', '{"colorsEnabled":false}'
        ]
      })
      .pageObject('calculator', `const commands = {
        nonExistantElement: function () {
          return this.api.element('css selector', 'div.nonExistantClass', (result) => {
              if (result.error) {
                throw "Element with nonExistantClass not found";
              }
          });
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
      .and('User enter 4 in A field', () => client.page.calculator().nonExistantElement())
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => client.assert.containsText('#result', 9))
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({skipped: 3, failed: 1, passed: 1})
        result.output.should.contain('Element with nonExistantClass not found')
      })
  })
})
