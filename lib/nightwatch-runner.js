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
const createCucumberHTMLReport = require('./cucumber-html-report')
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
  const jsonLogPath = path.relative('', tempLogFile.name)
  const configuration = Cucumber.Cli.Configuration({
    source: true,
    snippets: true,
    colors: true,
    format: ['pretty', 'json:' + jsonLogPath]
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

  // eslint-disable-next-line no-unmodified-loop-condition
  while (!done) {}

  patchNighwatchTestSuite()
  patchNighwatchTestCase()
  patchNighwatchAsyncTree()
  patchNighwatchReporter(options)

  return tempTestFolder.name
}

bootstrap.features = {}

function patchNighwatchTestSuite () {
  const TestSuite = require.main.require('nightwatch/lib/runner/testsuite')
  const origSetupClient = TestSuite.prototype.setupClient

  TestSuite.prototype.setupClient = function () {
    const result = origSetupClient.call(this)
    client = this.client.get()
    patchNighwatch()
    return result
  }
}

function patchNighwatch () {
  const origSaveScreenshotToFile = client.saveScreenshotToFile

  client.saveScreenshotToFile = function (fileName, content, done) {
    return origSaveScreenshotToFile.call(this, fileName, content, function () {
      return co(function * () {
        yield * cucumber.addAttachment(content, 'image/png')
      }).then(done).catch(done)
    })
  }
}

function patchNighwatchTestCase () {
  const TestCase = require.main.require('nightwatch/lib/runner/testcase')
  const origRun = TestCase.prototype.run

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
        const lastResult = client.results.tests && client.results.tests[client.results.tests.length - 1]
        if (node.step && (node.step.lastNode === node || lastResult && lastResult.failure)) {
          if (!lastResult || !lastResult.failure) {
            yield * cucumber.logPassedStep(node.step)
          } else {
            yield * cucumber.logFailedStep(node.step, lastResult.message + '\n' + lastResult.stacktrace, client.terminated)
          }
        }
      }).then(done).catch(done)
    })
  }

  AsyncTree.append = function (nodeName, command, context, args, stackTrace) {
    var result = origAppend.call(this, nodeName, command, context, args, stackTrace)
    var node = this.currentNode.children[this.currentNode.children.length - 1]

    if (!node.parent.step) {
      if (currentStep) {
        node.step = currentStep
        node.step.lastNode = node
      }
    } else {
      node.step = node.parent.step
      if (node.parent.step.lastNode === node.parent) {
        node.step.lastNode = node
      }
    }

    return result
  }
}

function patchNighwatchReporter (options) {
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

      if (options.htmlReport) {
        createCucumberHTMLReport(options.htmlReport, self.globalResults.cucumber)
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
          const currentScenarion = feature['@remainingScenarios'].shift()
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

    feature['@remainingScenarios'] = []
    feature.discovered['@tags'] = getFeatureTags(feature)
  }

  feature['@remainingScenarios'].push(scenario)

  let example

  if (scenario.getScenarioOutlineLine()) {
    if (!feature.discovered.firstOutlineRow) {
      feature.discovered.firstOutlineRow = scenario.getLine()
      example = 1
    } else {
      example = 1 + scenario.getLine() - feature.discovered.firstOutlineRow
    }
  }

  let scenarioName

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
