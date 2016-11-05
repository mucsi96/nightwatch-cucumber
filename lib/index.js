'use strict'

const fs = require('fs')
const assign = require('lodash.assign')
const peerUtils = require('./peer-utils')
const Runner = require('./runner')

module.exports = function (providedOptions) {
  const notTested = function (supportedVersions, packageName, version) {
    console.log(packageName + ' ' + version + ' is not tested with nightwatch-cucumber. You may notice some issues. Please contact the package maintainer to add support for this version. Supported version are ' + supportedVersions)
  }

  const supported = function () {}

  const notSuppoted = function (supportedVersions, packageName, version) {
    throw new Error(packageName + ' ' + version + ' is not suppoted by nightwatch-cucumber. Please contact the package maintainer to add support for this version. Supported version are ' + supportedVersions)
  }
  const notFound = function (packageName) {
    throw new Error(packageName + ' was not found. It is needed by nightwatch-cucumber :( Try to install it with "npm install ' + packageName + '"')
  }

  peerUtils.checkDependency('nightwatch', {
    '^0.9.9': notTested.bind(null, '0.8.0 - 0.9.8'),
    '0.8.0 - 0.9.8': supported,
    other: notSuppoted.bind(null, '0.8.0 - 0.9.8'),
    notFound: notFound
  })
  peerUtils.checkDependency('cucumber', {
    '^1.3.2': notTested.bind(null, '1.2.0 - 1.3.1'),
    '1.2.0 - 1.3.1': supported,
    other: notSuppoted.bind(null, '1.2.0 - 1.3.1'),
    notFound: notFound
  })

  const options = assign({
    featureFiles: ['features'],
    stepDefinitions: ['features/step_definitions'],
    supportFiles: [],
    jsonReport: 'reports/cucumber.json',
    htmlReport: 'reports/cucumber.html',
    openReport: false,
    stepTimeout: 30000,
    nightwatchClientAsParameter: false
  }, providedOptions)

  options.featureFiles.forEach((featureSource) => {
    try {
      fs.statSync(featureSource)
    } catch (err) {
      throw new Error(`Feature source ${featureSource} doesn't exists`)
    }
  })

  if (!options.nightwatchClientAsParameter) {
    console.error('Providing Nightwatch client as scope for step definitions is deprecated. More details: https://github.com/mucsi96/nightwatch-cucumber#nightwatch-client-as-parameter')
  }

  new Runner().run(options)
}
