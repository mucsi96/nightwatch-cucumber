/* global client */
/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')
const path = require('path')
const { JSDOM } = require('jsdom')
const cucumberHtmlReporter = require('cucumber-html-reporter')

describe('Reporting features', () => {
  it('should work together with cucumber-html-reporter', () => {
    return testCaseFactory
      .create('cucumber-html-report-test')
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
        createHTMLReport(result.testCasePath)
        return getCucumberHtmlReportWindow(result.testCasePath)
      })
      .then((dom) => {
        dom.window.document.querySelector('.navbar-header .label-success').textContent.should.equal('Passed: 2')
        dom.window.document.querySelector('.navbar-header .label-danger').textContent.should.equal('Failed: 0')
      })
  })

  it('should attach screenshots for failing scenarios', () => {
    return testCaseFactory
      .create('screenshot-attachement-test', { screenshots: true })
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', () => client.init())
      .and('User enter 4 in A field', () => client.setValue('#a', 4))
      .and('User enter 5 in B field', () => client.setValue('#b', 5))
      .when('User press Add button', () => client.click('#add'))
      .then('The result should contain 8', () => client.assert.containsText('#result', 8))
      .run()
      .then((result) => {
        createHTMLReport(result.testCasePath)
        return getCucumberHtmlReportWindow(result.testCasePath)
      })
      .then((dom) => {
        const feature = dom.window.document.querySelector('[href$="#collapseFeaturenightwatch_cucumber0"]')
        const featureMatch = feature.textContent.match(/^\s*(.*?):(.*?)\s*.*\s*$/)
        featureMatch.should.not.to.be.null
        featureMatch[1].should.equal('Feature')
        featureMatch[2].should.equal('addition')
        feature.querySelector('.label-danger').textContent.should.equal('1')

        const scenario = dom.window.document.querySelector('[href$="#collapseScenarionightwatch_cucumber0_0"]')
        const scenarioMatch = scenario.textContent.match(/^\s*(.*?):(.*?)\s*.*\s*.*\s*$/)
        scenarioMatch.should.not.to.be.null
        scenarioMatch[1].should.equal('Scenario')
        scenarioMatch[2].should.equal('small numbers')
        scenario.querySelector('.label-success').textContent.should.equal('4')
        scenario.querySelector('.label-danger').textContent.should.equal('1')

        const screenshot = dom.window.document.querySelector('#collapseScenarionightwatch_cucumber0_0 img.screenshot')
        screenshot.src.startsWith('data:image/png;base64,iVBOR').should.equal(true)
      })
  })
})

function createHTMLReport (testCasePath) {
  cucumberHtmlReporter.generate({
    theme: 'bootstrap',
    jsonFile: path.join(testCasePath, 'reports', 'cucumber.json'),
    output: path.join(testCasePath, 'reports', 'cucumber.html')
  })
}

function getCucumberHtmlReportWindow (testCasePath) {
  return JSDOM.fromFile(path.join(testCasePath, 'reports', 'cucumber.html'))
}
