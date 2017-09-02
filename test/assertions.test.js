/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('Assertion features', () => {
  it('should handle nightwatch assert.ok', () => {
    let sum

    return testCaseFactory
      .create('assert-ok-test')
      .feature('addition')
      .scenario('small numbers')
      .prependStepDefinition('let sum')
      .given('User is on the simple calculator page', () => client.init())
      .when('I add "2" and "3"', (num1, num2) => {
        sum = num1 + num2
      })
      .then('I will get "6"', (result) => {
        return client.assert.ok(result === sum)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 2, failed: 1})
      })
  })

  it('should handle nightwatch verify.ok', () => {
    let sum

    return testCaseFactory
      .create('verify-ok-test')
      .feature('addition')
      .scenario('small numbers')
      .prependStepDefinition('let sum')
      .given('User is on the simple calculator page', () => client.init())
      .when('I add "2" and "3"', (num1, num2) => {
        sum = num1 + num2
      })
      .then('I will get "6"', (result) => {
        return client.verify.ok(result === sum)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 2, failed: 1})
      })
  })

  it('should handle nightwatch expect.to.be.true', () => {
    let sum

    return testCaseFactory
      .create('expect-to-be-true-test')
      .feature('addition')
      .scenario('small numbers')
      .prependStepDefinition('let sum')
      .given('User is on the simple calculator page', () => client.init())
      .when('I add "2" and "3"', (num1, num2) => {
        sum = num1 + num2
      })
      .then('I will get "6"', (result) => {
        return client.expect(result === sum).to.be.true
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 2, failed: 1})
      })
  })

  it('should handle nightwatch expect.element', () => {
    return testCaseFactory
      .create('expect-element-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 10', () => client.expect.element('#result').text.to.equal('10'))
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 4, failed: 1})
      })
  })

  it('should handle nightwatch page object expect.element failure', () => {
    return testCaseFactory
      .create('page-expect-element-failure-test')
      .pageObject('calculator', `module.exports = {
  elements: {
    result: '#result'
  }
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 10', () => {
        const calculator = client.page.calculator()
        return calculator.expect.element('@result').text.to.contain(10)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 4, failed: 1})
      })
  })

  it('should handle nightwatch page object expect.element success', () => {
    return testCaseFactory
      .create('page-expect-element-success-test')
      .pageObject('calculator', `module.exports = {
  elements: {
    result: '#result'
  }
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 9', () => {
        const calculator = client.page.calculator()
        return calculator.expect.element('@result').text.to.contain(9)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 1})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle nightwatch nested page object expect.element', () => {
    return testCaseFactory
      .create('nested-page-object-expect-element-test')
      .pageObject('parent/child/calculator', `module.exports = {
  elements: {
    result: '#result'
  }
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 10', () => {
        const calculator = client.page.parent.child.calculator()
        return calculator.expect.element('@result').text.to.contain(10)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 4, failed: 1})
      })
  })

  it('should handle nightwatch page object nested sections expect.element', () => {
    return testCaseFactory
      .create('page-object-nested-sections-expect-element-test')
      .pageObject('calculator', `module.exports = {
  sections: {
    parent: {
      selector: 'body',
      sections: {
        child: {
          selector: 'h3',
          elements: {
            result: '#result'
          }
        }
      }
    }
  }
}`)
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 10', () => {
        const calculator = client.page.calculator()
        const childSection = calculator.section.parent.section.child
        return childSection.expect.element('@result').text.to.contain(10)
      })
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.failed
        result.features[0].result.scenarioCounts.should.deep.equal({failed: 1})
        result.features[0].scenarios[0].result.status.should.be.failed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 4, failed: 1})
      })
  })
})
