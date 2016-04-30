'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const mkdirp = require('mkdirp')
const tmp = require('tmp')
const co = require('co')
const checkSyntaxError = require('syntax-error')
const Cucumber = require.main.require('cucumber/lib/cucumber')
const CucumberAPI = require('./cucumber-api')
const tempTestFolder = tmp.dirSync({ unsafeCleanup: true })
const tempLogFile = tmp.fileSync({ unsafeCleanup: true })
let syntaxError = false
let runtime
let currentStep
let client
let cucumber

tmp.setGracefulCleanup()

function bootstrap (options) {
  let done = false

  const configurationArgs = [options.featureFiles]
  const configuration = Cucumber.Cli.Configuration({
    source: true,
    snippets: true,
    colors: true,
    format: ['pretty', 'json:' + tempLogFile.name]
  }, configurationArgs)

  cucumber = new CucumberAPI(configuration)
  runtime = Cucumber(getFeatureSources(options), getSupportCodeInitializer(options))

  if (syntaxError) {
    return
  }

  runtime.getFeatures().getFeatures().asyncForEach(function (feature, nextFeature) {
    var backgroundSteps = []

    createTestFile(feature, options)

    if (feature.hasBackground()) {
      feature.getBackground().getSteps().forEach(function (step) {
        step.execute = getStepExecutor(step)
        if (step.execute) backgroundSteps.push(step)
      })
    }

    feature.instructVisitorToVisitScenarios({
      visitScenario: function (scenario, nextScenario) {
        var steps = []
        scenario.getSteps().forEach(function (step) {
          step.execute = getStepExecutor(step)
          if (step.execute) steps.push(step)
        })
        discoverScenario(feature, scenario, backgroundSteps.concat(steps), options)
        nextScenario()
      }
    }, nextFeature)
  }, function () {
    done = true
  })

  while (!done) {}

  patchNighwatchTestSuite()
  patchNighwatchTestCase()
  patchNighwatchAsyncTree()
  patchNighwatchReporter()

  return tempTestFolder.name
}

bootstrap.features = {}

function patchNighwatchTestSuite () {
  var TestSuite = require.main.require('nightwatch/lib/runner/testsuite')
  var origSetupClient = TestSuite.prototype.setupClient

  TestSuite.prototype.setupClient = function () {
    var result = origSetupClient.call(this)
    client = this.client.get()
    return result
  }
}

function patchNighwatchTestCase () {
  var TestCase = require.main.require('nightwatch/lib/runner/testcase')
  var origRun = TestCase.prototype.run

  TestCase.prototype.run = function () {
    return origRun.call(this)
      .then((testResults) => {
        return co(function * () {
          yield cucumber.logScenarioResult()
          return testResults
        })
      })
  }
}

function patchNighwatchAsyncTree () {
  var AsyncTree = require.main.require('nightwatch/lib/core/queue').instance()
  var origRunCommand = AsyncTree.runCommand
  var origAppend = AsyncTree.append

  AsyncTree.runCommand = function (node, done) {
    return origRunCommand.call(this, node, function () {
      return co(function * () {
        if (node.step && node.step.lastNode === node) {
          yield * cucumber.logStep(node.step, client.results.lastError && client.results.lastError.message + client.results.lastError.stack)
        }
      }).then(done).catch(done)
    })
  }

  AsyncTree.append = function (nodeName, command, context, args, stackTrace) {
    var result = origAppend.call(this, nodeName, command, context, args, stackTrace)
    var node = this.currentNode.children[this.currentNode.children.length - 1]

    node.step = currentStep
    if (node.parent.step) node.step = node.parent.step
    if (node.step) node.step.lastNode = node

    return result
  }
}

function patchNighwatchReporter () {
  var Reporter = require.main.require('nightwatch/lib/runner/reporter')
  var origSave = Reporter.prototype.save

  Reporter.prototype.save = function () {
    const self = this
    return co(function * () {
      yield cucumber.logFeaturesResult()
      yield cucumber.logAfterFeatures(runtime.getFeatures().getFeatures())
      try {
        const json = fs.readFileSync(tempLogFile.name, 'utf8')

        if (!json) return

        self.globalResults.cucumber = JSON.parse(json)
      } catch (err) {
        console.error('Cannot read cucumber json formatter output form ' + tempLogFile.name)
        console.error(err)
      }
    }).then(origSave.bind(this)).catch(function (err) { throw err })
  }
}

function getFeatureSources (options) {
  var featureSources = []

  glob.sync(options.featureFiles + '/**/*.feature').forEach(function (file) {
    featureSources.push([path.resolve(process.cwd(), file), fs.readFileSync(file)])
  })

  return featureSources
}

function getSupportCodeInitializer (options) {
  return function () {
    var files = []
    var supportCodeHelper = this

    glob.sync(options.stepDefinitions + '/**/*.js').forEach(function (file) {
      files.push(path.resolve(process.cwd(), file))
    })

    files.forEach(function (file) {
      var initializer
      var src = fs.readFileSync(file)
      var err = checkSyntaxError(src, file)

      if (err) {
        console.error(err)
        syntaxError = true
        return
      }

      initializer = require(file)

      if (typeof (initializer) === 'function') {
        initializer.call(supportCodeHelper)
      }
    })
  }
}

function getStepExecutor (step) {
  step.stepDefinitions = runtime.getSupportCodeLibrary().lookupStepDefinitionsByName(step.getName())

  return function (context, callback) {
    if (!step.stepDefinitions || !step.stepDefinitions.length) {
      return co(function * () {
        yield * cucumber.logUndefinedStep(step)
      }).then(callback).catch((e) => console.error(e.stack))
    }
    if (step.stepDefinitions.length > 1) {
      return co(function * () {
        yield * cucumber.logAmbiguousStep(step)
      }).then(callback).catch((e) => console.error(e.stack))
    }
    step.stepDefinitions[0].invoke(step, context, {getAttachments: function () {}}, 60000, callback)
  }
}

function getFeatureTags (feature) {
  return feature.getTags().map(function (tag) {
    return tag.getName().replace(/^@/, '')
  })
}

function discoverScenario (feature, scenario, steps, options) {
  var tags
  var scenarioName
  var example

  if (!feature.discovered) {
    feature.discovered = {
      before: function (browser, done) {
        return co(function * () {
          yield * cucumber.logBeforeFeature(feature)
          if (feature.hasBackground()) yield * cucumber.logBackground(feature.getBackground())
        }).then(done).catch(done)
      },
      after: function (browser) {
        if (options.closeSession === 'afterFeature') {
          browser.end()
        }
      },
      beforeEach: function (browser, done) {
        return co(function * () {
          const currentScenarion = feature.discovered.scenarios.shift()
          yield * cucumber.logBeforeScenario(currentScenarion)
          if (feature.hasBackground()) yield * cucumber.logBackground(feature.getBackground())
        }).then(function () {
          if (options.beforeScenario) options.beforeScenario(browser, done)
          else done()
        }).catch(done)
      },
      afterEach: function (browser, done) {
        if (options.afterScenario) options.afterScenario(browser, done)
        else done()
      }
    }

    bootstrap.features[feature.getName()] = feature.discovered

    feature.discovered.scenarios = []

    tags = getFeatureTags(feature)

    if (tags.length) {
      feature.discovered['@tags'] = tags
    }
  }

  feature.discovered.scenarios.push(scenario)

  if (scenario.getScenarioOutlineLine()) {
    if (!feature.discovered.firstOutlineRow) {
      feature.discovered.firstOutlineRow = scenario.getLine()
      example = 1
    } else {
      example = 1 + scenario.getLine() - feature.discovered.firstOutlineRow
    }
  }

  if (example) {
    scenarioName = scenario.getName() + ' #' + example
  } else {
    scenarioName = scenario.getName()
  }

  feature.discovered[scenarioName] = function (browser) {
    steps.forEach(function (step) {
      currentStep = step
      if (options.beforeStep) options.beforeStep(browser)
      step.execute(browser, function (result) {
        if (result && result.getStatus() === Cucumber.Status.FAILED) {
          console.error(result.getFailureException())
        }
      })
      currentStep = null
      if (options.afterStep) options.afterStep(browser)
    })

    if (options.closeSession === 'afterScenario') {
      browser.end()
    }
  }
}

function createTestFile (feature, options) {
  var selfPath = __filename.split(path.sep).join('/')
  var testFileSource = 'module.exports = require("' + selfPath + '").features["' + feature.getName() + '"]'
  var testFilePath = path.join(tempTestFolder.name, path.relative(options.featureFiles, feature.getUri())).replace(/\.[^/.]+$/, '.js')

  mkdirp.sync(path.dirname(testFilePath))
  fs.writeFileSync(testFilePath, testFileSource)
}

module.exports = bootstrap
