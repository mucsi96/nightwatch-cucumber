const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const glob = require('glob')
const mkdirp = require('mkdirp')
const pify = require('pify')
const dummyTestModulesFolder = tmp.dirSync({ unsafeCleanup: true }).name
const NightwatchApi = require('./nightwatch-api')
const CucumberApi = require('./cucumber-api')

tmp.setGracefulCleanup()

module.exports = class Runner {
  constructor () {
    this.originalFeaturePath = {}
  }

  generateDummyTestModules () {
    this.featureFiles.forEach((featureSource) => {
      const featureFiles = glob.sync(path.join(featureSource, '**/*.feature'))

      featureFiles.forEach((featureFile) => {
        const dummyTestModuleFile = this.featurePathToDummyPath(featureFile)
        mkdirp.sync(path.dirname(dummyTestModuleFile))
        fs.writeFileSync(dummyTestModuleFile, '')
      })
    })
  }

  getTags (tags) {
    tags = tags || []

    if (typeof tags === 'string') {
      tags = tags.split(',')
    }

    if (Array.isArray(tags)) {
      return tags.map((tag) => `@${tag}`)
    } else {
      throw new Error(`Expected tags to be Array or String.`)
    }
  }

  featurePathToDummyPath (featureFile) {
    if (!featureFile.match(/\.feature$/)) featureFile += '.feature'

    const dummyPath = path.join(dummyTestModulesFolder, featureFile.replace(/\.feature$/, '.js'))

    this.originalFeaturePath[dummyPath] = featureFile

    return dummyPath
  }

  dummyPathToFeaturePath (dummyPath) {
    if (!dummyPath.match(/\.js$/)) dummyPath += '.js'

    return this.originalFeaturePath[dummyPath] || dummyPath
  }

  addIndexToFileName (fileName, index) {
    const cutIndex = fileName.lastIndexOf('.')
    const ext = fileName.slice(cutIndex)
    const rest = fileName.slice(0, cutIndex)
    return `${rest}-${index}${ext}`
  }

  * executeTestModules (dummyTestModules) {
    const featureFiles = dummyTestModules.map((dummyTestModule) => this.dummyPathToFeaturePath(dummyTestModule))

    if (this.nightwatchApi.isRunningInParallel()) {
      const workerIndex = this.nightwatchApi.getWorkerIndex()
      this.jsonReport = this.addIndexToFileName(this.jsonReport, workerIndex)
    }

    if (this.jsonReport) {
      yield pify(mkdirp)(path.dirname(this.jsonReport))
    }
    const cucumberArgs = this.cucumberApi.getAdjustedArgs({
      args: this.options.cucumberArgs,
      featureFiles,
      jsonReport: this.jsonReport,
      tags: this.getTags(this.nightwatchApi.nightwatchArgv.tag),
      skipTags: this.getTags(this.nightwatchApi.nightwatchArgv.skiptags)
    })
    return yield * this.cucumberApi.run(cucumberArgs)
  }

  run (options) {
    const self = this
    this.options = options
    this.nightwatchApi = new NightwatchApi(options)
    this.cucumberApi = new CucumberApi(options)
    this.jsonReport = this.cucumberApi.getJSONReportName(options.cucumberArgs)
    this.featureFiles = this.cucumberApi.getFeatureFiles(options.cucumberArgs)
    this.featureFiles.forEach((featureSource) => {
      try {
        fs.statSync(featureSource)
      } catch (err) {
        throw new Error(`Feature source ${featureSource} doesn't exists`)
      }
    })
    const dummyPaths = this.featureFiles.map((srcPath) => path.join(dummyTestModulesFolder, srcPath))

    this.generateDummyTestModules()

    this.cucumberApi.addAttachmentProvider(this.nightwatchApi.takeScreenshot.bind(this.nightwatchApi))

    this.nightwatchApi.addTestModulePaths(dummyPaths)
    this.nightwatchApi.addPathConverter(this.featurePathToDummyPath.bind(this), this.dummyPathToFeaturePath.bind(this))
    this.nightwatchApi.overrideOriginalStartTestWorkers()
    this.nightwatchApi.addTestRunner(this.executeTestModules.bind(this))
    this.nightwatchApi.addHookAfterChildProcesses(function * () {
      const reports = yield pify(glob)(self.addIndexToFileName(self.jsonReport, '*'))
      yield * self.cucumberApi.mergeCucumberJsonReports(reports, self.jsonReport)
    })
  }
}
