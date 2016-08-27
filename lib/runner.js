const glob = require('glob')
const path = require('path')
const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api-v2')

function run (options) {
  const nightwatch = new NightwatchApi(options)
  const expandedFeaturePaths = glob
    .sync(options.featureFiles + '/**/*.feature')
    .map((filename) => path.join(process.cwd(), filename))

  const cucumber = new CucumberApi(options)
  cucumber.hookUp()

  nightwatch.addTestFiles(expandedFeaturePaths)
  nightwatch.addTestModuleRunner(isFeatureFile, runFeatureFile.bind(this, cucumber, options))
  nightwatch.hookUp()
}

function * runFeatureFile (runner, options, featureFile) {
  yield * runner.run(featureFile)
}

function isFeatureFile (fileName) {
  return path.extname(fileName) === '.feature'
}

module.exports = run
