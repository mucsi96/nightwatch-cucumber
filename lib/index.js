'use strict'

const assign = require('lodash.assign')
const peerUtils = require('./peer-utils')

let runner

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
    '^0.9.13': notTested.bind(null, '0.8.0 - 0.9.12'),
    '0.8.0 - 0.9.12': supported,
    other: notSuppoted.bind(null, '0.8.0 - 0.9.12'),
    notFound: notFound
  })
  peerUtils.checkDependency('cucumber', {
    '^2.0.1': notTested.bind(null, '2.0.0 - 2.0.0'),
    '2.0.0 - 2.0.0': supported,
    other: notSuppoted.bind(null, '2.0.0 - 2.0.0'),
    notFound: notFound
  })

  const options = assign({
    cucumberArgs: [
      '--require', 'features/step_definitions',
      '--format', 'pretty',
      '--format', 'json:reports/cucumber.json',
      'features'
    ]
  }, providedOptions)

  const Runner = require('./runner')
  runner = new Runner()
  runner.run(options)
}

Object.defineProperty(module.exports, 'client', {
  get: () => {
    return runner.nightwatchApi.getClientApi()
  }
})
