'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const mkdirp = require('mkdirp')
const tmp = require('tmp')
const co = require('co')
const checkSyntaxError = require('syntax-error')
const Cucumber = require.main.require('cucumber/lib/cucumber')
const tempTestFolder = tmp.dirSync({ unsafeCleanup: true })
const tempLogFile = tmp.fileSync({ unsafeCleanup: true })
const featuresResult = Cucumber.Runtime.FeaturesResult()
let formatters
let configuration
let syntaxError = false
let scenarioResult
let runtime
let currentStep
let client
let prevTime

tmp.setGracefulCleanup()

function bootstrap (options) {
  let done = false

  var configurationArgs = [options.featureFiles]
  configuration = Cucumber.Cli.Configuration({
    source: true,
    snippets: true,
    colors: true,
    format: ['pretty', 'json:' + tempLogFile.name]
  }, configurationArgs)

  formatters = configuration.getFormatters()
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
          yield logScenarioResult()
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
          var lastResult = client.results.tests.length && client.results.tests[client.results.tests.length - 1]
          var failure = lastResult && lastResult.failure
          yield logStepResult(node.step, failure ? Cucumber.Status.FAILED : Cucumber.Status.PASSED)
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
      yield logFeaturesResult()
      yield logAfterFeatures(runtime.getFeatures().getFeatures())
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

function * broadcastEvent (event) {
  const jobs = formatters.map((formatter) => {
    return new Promise((resolve) => {
      formatter.hear(event, function () {
        return resolve()
      })
    })
  })

  yield jobs
}

function * logAfterFeatures (features) {
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_EVENT_NAME, { features: features })
  yield * broadcastEvent(event.replicateAsPostEvent())
}

function * logFeaturesResult () {
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_RESULT_EVENT_NAME, { featuresResult: featuresResult })
  yield * broadcastEvent(event)
}

function * logBeforeFeature (feature) {
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURE_EVENT_NAME, { feature: feature })
  yield * broadcastEvent(event.replicateAsPreEvent())
  prevTime = time()
}

function * logBackground (background) {
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.BACKGROUND_EVENT_NAME, { background: background })
  yield * broadcastEvent(event.replicateAsPreEvent())
}

function * logBeforeScenario (scenario) {
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, { scenario: scenario })
  scenarioResult = Cucumber.Runtime.ScenarioResult(scenario)
  yield * broadcastEvent(event.replicateAsPreEvent())
}

function * logScenarioResult () {
  featuresResult.witnessScenarioResult(scenarioResult)
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_RESULT_EVENT_NAME, { scenarioResult: scenarioResult })
  yield * broadcastEvent(event)
}

function * logStepResult (step, status) {
  const stepResult = Cucumber.Runtime.StepResult({
    step: step,
    stepDefinition: step.stepDefinitions[0],
    ambiguousStepDefinitions: step.stepDefinitions,
    duration: durationInNanoseconds(prevTime),
    status: status,
    failureException: '',
    attachments: []
  })
  scenarioResult.witnessStepResult(stepResult)
  featuresResult.witnessStepResult(stepResult)
  const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, { stepResult: stepResult })
  yield * broadcastEvent(event)
  prevTime = time()
}

function time () {
  if (typeof process !== 'undefined' && process.hrtime) {
    return process.hrtime()
  } else {
    return new Date().getTime()
  }
}

function durationInNanoseconds (start) {
  if (typeof process !== 'undefined' && process.hrtime) {
    const duration = process.hrtime(start)
    return duration[0] * 1e9 + duration[1]
  } else {
    return (new Date().getTime() - start) * 1e6
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
        yield * logStepResult(step, Cucumber.Status.UNDEFINED)
      }).then(callback).catch((e) => console.error(e.stack))
    }
    if (step.stepDefinitions.length > 1) {
      return co(function * () {
        yield * logStepResult(step, Cucumber.Status.AMBIGUOUS)
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
          yield * logBeforeFeature(feature)
          if (feature.hasBackground()) yield * logBackground(feature.getBackground())
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
          yield * logBeforeScenario(currentScenarion)
          if (feature.hasBackground()) yield * logBackground(feature.getBackground())
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
