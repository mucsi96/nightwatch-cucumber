var objectAssign = require('object-assign')
var assert = require('assert')
var peerTest = require('./peer-test')
var closeSessionOptions = ['afterScenario', 'afterFeature', 'never']

module.exports = function (providedOptions) {
  if (this.World) return // Cucumber is running this file twice. We need only the first run

  var ok = 0

  var supported = function (packageName, version) {
    ok++
  }
  var notSuppoted = function (supportedVersions, packageName, version) {
    console.error(packageName + ' ' + version + ' is not suppoted. Please contact the package maintainer to add support for this version. Supported version are ' + supportedVersions)
  }
  var notFound = function (packageName) {
    console.error(packageName + ' was not found :( Try to install it with "npm install ' + packageName + '"')
  }

  peerTest('nightwatch', {
    '0.8.0 - 0.8.18': supported,
    other: notSuppoted.bind(null, '0.8.0 - 0.8.18'),
    notFound: notFound
  })
  peerTest('cucumber', {
    '0.9.0 - 0.9.5': supported,
    other: notSuppoted.bind(null, '0.9.0 - 0.9.5'),
    notFound: notFound
  })

  if (ok < 2) return console.log('\n\n\n')

  var options = objectAssign({
    runner: 'nightwatch',
    featureFiles: 'features',
    stepDefinitions: 'features/step_definitions',
    closeSession: 'afterFeature'
  }, providedOptions)

  assert(closeSessionOptions.indexOf(options.closeSession) !== -1, 'Bad configuration for nightwatch-cucumber. closeSession should be ' + closeSessionOptions.join(' or '))

  if (options.runner === 'cucumber') {
    return require('./cucumber-runner')(options)
  }

  return require('./nightwatch-runner')(options)
}
