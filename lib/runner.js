'use strict'

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
    this.options.featureFiles.forEach((featureSource) => {
      const featureFiles = glob.sync(path.join(featureSource, '**/*.feature'))

      featureFiles.forEach((featureFile) => {
        const dummyTestModuleFile = this.featurePathToDummyPath(featureFile)
        mkdirp.sync(path.dirname(dummyTestModuleFile))
        fs.writeFileSync(dummyTestModuleFile, '')
      })
    })
  }

  getTags (nightwatchArgv) {
    let result = nightwatchArgv.tag || []

    if (typeof result === 'string') {
      result = [result]
    }

    return result.map((tag) => `@${tag}`)
  }

  getSkipTags (nightwatchArgv) {
    let result = nightwatchArgv.skiptags || []

    if (typeof result === 'string') {
      result = [result]
    }

    return result.map((tag) => `~@${tag}`)
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
    this.options.featureFiles = dummyTestModules.map((dummyTestModule) => this.dummyPathToFeaturePath(dummyTestModule))
    this.options.tags = this.getTags(this.nightwatchApi.nightwatchArgv).concat(this.getSkipTags(this.nightwatchApi.nightwatchArgv))

    if (this.nightwatchApi.isRunningInParallel()) {
      const workerIndex = this.nightwatchApi.getWorkerIndex()
      this.options.jsonReport = this.addIndexToFileName(this.options.jsonReport, workerIndex)
    }

    const success = yield * this.cucumberApi.run(this.options.jsonReport)

    if (!this.nightwatchApi.isRunningInParallel()) {
      yield * this.cucumberApi.createCucumberHtmlReport(this.options)
      yield * this.cucumberApi.createCucumberJunitReport(this.options)
    }

    return success
  }

  run (options) {
    const self = this
    this.options = options
    this.nightwatchApi = new NightwatchApi(options)
    this.cucumberApi = new CucumberApi(options)
    const dummyPaths = this.options.featureFiles.map((srcPath) => path.join(dummyTestModulesFolder, srcPath))

    this.generateDummyTestModules()

    this.cucumberApi.addWorldProvider(this.nightwatchApi.getClientApi.bind(this.nightwatchApi))
    this.cucumberApi.addStepDefinitionRunner(this.nightwatchApi.executeInNightwatchContext.bind(this.nightwatchApi))
    this.cucumberApi.addAttachmentProvider(this.nightwatchApi.takeScreenshot.bind(this.nightwatchApi))

    this.nightwatchApi.addTestModulePaths(dummyPaths)
    this.nightwatchApi.addPathConverter(this.featurePathToDummyPath.bind(this), this.dummyPathToFeaturePath.bind(this))
    this.nightwatchApi.addTestRunner(this.executeTestModules.bind(this))
    this.nightwatchApi.addHookAfterChildProcesses(function * () {
      const reports = yield pify(glob)(self.addIndexToFileName(self.options.jsonReport, '*'))
      yield * self.cucumberApi.mergeCucumberJsonReports(reports, self.options.jsonReport)
      yield * self.cucumberApi.createCucumberHtmlReport()
      yield * self.cucumberApi.createCucumberJunitReport()
    })
  }
}
