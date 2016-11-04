'use strict'

const fs = require('fs')
const path = require('path')
const cloneDeep = require('lodash.clonedeep')
const template = require('lodash.template')
const mkdirp = require('mkdirp')

function setStats (suite) {
  var features = suite.features
  features.forEach(function (feature) {
    feature.passed = 0
    feature.failed = 0
    feature.notdefined = 0
    feature.skipped = 0

    if (!feature.elements) {
      return
    }

    feature.elements.forEach(function (element) {
      element.passed = 0
      element.failed = 0
      element.notdefined = 0
      element.skipped = 0

      element.steps.forEach(function (step) {
        if (step.embeddings !== undefined) {
          step.embeddings.forEach(function (embedding) {
            if (embedding.mime_type === 'image/png') {
              step.image = 'data:image/png;base64,' + embedding.data
            }
          })
        }

        if (!step.result) {
          return 0
        }
        if (step.result.status === 'passed') {
          return element.passed++
        }
        if (step.result.status === 'failed') {
          return element.failed++
        }
        if (step.result.status === 'undefined') {
          return element.notdefined++
        }

        element.skipped++
      })

      if (element.notdefined > 0) {
        suite.scenarios.notdefined++
        return feature.notdefined++
      }

      if (element.failed > 0) {
        suite.scenarios.failed++
        return feature.failed++
      }

      if (element.skipped > 0) {
        suite.scenarios.skipped++
        return feature.skipped++
      }

      if (element.passed > 0) {
        suite.scenarios.passed++
        return feature.passed++
      }
    })

    if (feature.failed > 0) {
      return suite.failed++
    }
    if (feature.passed > 0) {
      return suite.passed++
    }
  })

  suite.features = features

  return suite
}

function getResource (resourceName) {
  return fs.readFileSync(path.join(__dirname, '..', 'resources', resourceName), 'utf8')
}

function generateReport (htmlFilePath, featureOutput, logOutput) {
  mkdirp.sync(path.dirname(htmlFilePath))
  var suite = {
    features: cloneDeep(featureOutput),
    passed: 0,
    failed: 0,
    scenarios: {
      passed: 0,
      failed: 0,
      skipped: 0,
      notdefined: 0
    },
    logOutput: logOutput
  }

  suite = setStats(suite)

  fs.writeFileSync(
    htmlFilePath,
    template(getResource('index.tmpl'))({
      suite,
      time: new Date(),
      features: template(getResource('features.tmpl'))(suite),
      styles: getResource('style.css'),
      script: getResource('script.js'),
      piechart: getResource('piechart.js')
    })
  )
}

module.exports = generateReport
