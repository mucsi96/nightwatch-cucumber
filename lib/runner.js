const glob = require('glob')
const path = require('path')
const NightwatchApi = require('./nightwatch-api')

function run (options) {
  const nightwatch = new NightwatchApi(options)
  const expandedFeaturePaths = glob
    .sync(options.featureFiles + '/**/*.feature')
    .map((filename) => path.join(process.cwd(), filename))

  nightwatch.addTestFiles(expandedFeaturePaths)
  nightwatch.addTestModuleRunner(isFeatureFile, runFeatureFile)
  nightwatch.hookUp()
}

function * runFeatureFile (featureFile, options) {
  console.log('Feature file runner > ', featureFile)
}

function isFeatureFile (fileName) {
  return path.extname(fileName) === '.feature'
}

module.exports = run
