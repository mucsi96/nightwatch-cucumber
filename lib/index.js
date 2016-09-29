'use strict'

const _ = require('lodash')
const peerUtils = require('./peer-utils')
const Runner = require('./runner')

module.exports = function (providedOptions) {
  if (this && this.World) return // Cucumber is running this file twice. We need only the first run

  let ok = 0

  const notTested = function (supportedVersions, packageName, version) {
    console.log(packageName + ' ' + version + ' is not tested with nightwatch-cucumber. You may notice some issues. Please contact the package maintainer to add support for this version. Supported version are ' + supportedVersions)
    ok++
  }

  const supported = function (packageName, version) {
    ok++
  }
  const notSuppoted = function (supportedVersions, packageName, version) {
    console.error(packageName + ' ' + version + ' is not suppoted by nightwatch-cucumber. Please contact the package maintainer to add support for this version. Supported version are ' + supportedVersions)
  }
  const notFound = function (packageName) {
    console.error(packageName + ' was not found. It is needed by nightwatch-cucumber :( Try to install it with "npm install ' + packageName + '"')
  }

  peerUtils.checkDependency('nightwatch', {
    '^0.9.9': notTested.bind(null, '0.8.0 - 0.9.8'),
    '0.8.0 - 0.9.8': supported,
    other: notSuppoted.bind(null, '0.8.0 - 0.9.8'),
    notFound: notFound
  })
  peerUtils.checkDependency('cucumber', {
    '^1.3.1': notTested.bind(null, '1.2.0 - 1.3.0'),
    '1.2.0 - 1.3.0': supported,
    other: notSuppoted.bind(null, '1.2.0 - 1.3.0'),
    notFound: notFound
  })

  if (ok < 2) return console.log('\n\n\n')

  const options = _.assign({
    featureFiles: ['features'],
    stepDefinitions: ['features/step_definitions'],
    supportFiles: [],
    jsonReport: 'reports/cucumber.json',
    htmlReport: 'reports/cucumber.html',
    openReport: false,
    stepTimeout: 30000
  }, providedOptions)

  new Runner().run(options)
}
