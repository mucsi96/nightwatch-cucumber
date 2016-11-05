'use strict'

const path = require('path')
const assign = require('lodash.assign')
const cloneDeep = require('lodash.clonedeep')
const mkdirp = require('mkdirp')
const builder = require('junit-report-builder')

function writeReport (options, featureOutput) {
  // copy data
  const features = cloneDeep(featureOutput)
  // loop over features
  features.forEach(function (feature) {
    // create new feature
    const suite = builder
                    .testSuite()
                    .name(options.suiteNamePrefix + feature.name)

    // quit here if feature is empty
    if (!feature.elements) { return }
    // loop over scenarios
    feature.elements.forEach(function (scenario) {
      let result = false
      const messages = []
      // loop over steps
      scenario.steps.forEach(function (step) {
        // quit if steps are empty
        if (step.result) {
          // on failure
          if (step.result.status === 'failed') {
            result = 'failure'
            messages.push('Failed Step: ' + step.keyword + step.name +
              '\nMessage: ' + step.result.error_message +
              '\nWhere: ' + step.match.location)
          }
          // on undefined
          // only output skipped if no error occurred in scenario
          if (step.result.status === 'undefined') {
            if (!result) { result = 'skipped' }
          }
        }
      })

      const testCase = suite.testCase()
        .className(options.classNamePrefix + feature.name)
        .name(options.scenarioNamePrefix + scenario.name)

      // create scenario output
      switch (result) {
        // if at least one step was skipped and no failures occurred
        case 'skipped':
          // mark as skipped
          testCase
            .skipped()
          break
        // if at least one step failed
        case 'failure':
          // mark as failure and output failure messages
          testCase
            .failure(messages.join('\n\n'))
          break
        // if a scenario runs without any failed or skipped steps
        default:
          // successful tests are already handled
      }
    })
  })

  // persistent data
  builder.writeTo(options.output)
}

function generateReport (junitOptions, featureOutput) {
  const options = assign({
    classNamePrefix: 'Feature: ',
    suiteNamePrefix: 'Feature: ',
    scenarioNamePrefix: 'Scenario: '
  }, junitOptions)

  mkdirp.sync(path.dirname(options.output))
  writeReport(options, featureOutput)
}

module.exports = generateReport
