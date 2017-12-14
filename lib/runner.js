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

  getSourceFile (featureSource) {
    if (featureSource.startsWith('@')) {
      return featureSource.substr(1, featureSource.length - 1)
    }
    return featureSource
  }

  getFeatureFilesFromRerunFile (rerunFile) {
    const data = fs.readFileSync(this.getSourceFile(rerunFile))
    return data.toString()
      .split('\n')
      .map(featurePath => featurePath.trim().replace(/(:\d*)/g, ''))
      // filter empty paths
      .filter(featurePath => featurePath)
  }

  getFeatureDirectories () {
    return this.featureFiles
      .map(featureSource => {
        if (featureSource.startsWith('@')) {
          return this.getFeatureFilesFromRerunFile(featureSource)
            .map(featurePath => path.dirname(featurePath))
        } else if (fs.statSync(featureSource).isDirectory()) {
          return featureSource
        }
        return path.dirname(featureSource)
      })
      // flatten
      .reduce((paths, currentPaths) => paths.concat(currentPaths), [])
  }

  getFeatureFiles () {
    return this.featureFiles
      .map(featureSource => {
        if (featureSource.startsWith('@')) {
          return this.getFeatureFilesFromRerunFile(featureSource)
        } else if (fs.statSync(featureSource).isDirectory()) {
          return glob.sync(path.join(featureSource, '**/*.feature'))
        }
        return [featureSource]
      })
      // flatten
      .reduce((paths, currentPaths) => paths.concat(currentPaths), [])
      // make unique list
      .filter((featureFilePath, idx, paths) => paths.indexOf(featureFilePath === idx))
  }

  generateDummyTestModules () {
    this.getFeatureFiles().forEach((featureFile) => {
      const dummyTestModuleFile = this.featurePathToDummyPath(featureFile)
      mkdirp.sync(path.dirname(dummyTestModuleFile))
      fs.writeFileSync(dummyTestModuleFile, '')
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
    const lineNumberMatch = featureFile.match(/:(\d+)$/)
    let lineNumber
    if (lineNumberMatch) {
      lineNumber = parseInt(lineNumberMatch[1])
      featureFile = featureFile.replace(/:\d+$/, '')
    }
    try {
      fs.statSync(featureFile)
    } catch (err) {
      if (!featureFile.match(/\.feature$/)) featureFile += '.feature'
      try {
        fs.statSync(featureFile)
      } catch (err) {
        throw new Error(`Feature file or folder ${featureFile} was not found!`)
      }
    }

    const dummyPath = path.join(dummyTestModulesFolder, featureFile.replace(/\.feature$/, '.js'))

    this.originalFeaturePath[dummyPath] = lineNumber ? `${featureFile}:${lineNumber}` : featureFile

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

  areColorsEnabled () {
    const formatOptionsIndex = this.options.cucumberArgs.indexOf('--format-options')
    if (formatOptionsIndex < 0) return true
    const formatOptions = JSON.parse(this.options.cucumberArgs[formatOptionsIndex + 1])
    return typeof formatOptions.colorsEnabled === 'undefined' ? true : formatOptions.colorsEnabled
  }

  run (options) {
    const self = this
    this.options = options
    this.nightwatchApi = new NightwatchApi(options, this.areColorsEnabled())
    this.cucumberApi = new CucumberApi(options)
    this.jsonReport = this.cucumberApi.getJSONReportName(options.cucumberArgs)
    this.featureFiles = this.cucumberApi.getFeatureFiles(options.cucumberArgs)
    this.featureFiles
      .map(this.getSourceFile)
      .forEach((featureSource) => {
        try {
          fs.statSync(featureSource)
        } catch (err) {
          throw new Error(`Feature source ${featureSource} doesn't exists`)
        }
      })

    // enforce relative paths so path.join() works on Windows
    this.featureFiles = this.featureFiles.map((currentPath) => {
      return path.isAbsolute(currentPath) ? path.relative(process.cwd(), currentPath) : currentPath
    })

    const dummyPaths = this.getFeatureDirectories().map(srcPath => path.join(dummyTestModulesFolder, srcPath))

    this.generateDummyTestModules()

    this.cucumberApi.injectTimeoutHandler()
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
