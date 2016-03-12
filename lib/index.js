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
  var notSuppoted = function (packageName, version) {
    console.error(packageName + ' ' + version + ' is not suppoted :( Try to install a newer version')
  }
  var notFound = function (packageName) {
    console.error(packageName + ' was not found :( Try to install it with "npm install ' + packageName + '"')
  }

  peerTest('nightwatch', {
    '^0.8.0': supported,
    other: notSuppoted,
    notFound: notFound
  })
  peerTest('cucumber', {
    '^0.9.0': supported,
    other: notSuppoted,
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
