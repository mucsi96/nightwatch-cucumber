var fs = require('fs')
var path = require('path')
var glob = require('glob')
var mkdirp = require('mkdirp')
var tmp = require('tmp')
var checkSyntaxError = require('syntax-error')
var syntaxError = false
var Cucumber = require.main.require('cucumber/lib/cucumber')
var configuration
var formatters
var tempTestFolder = tmp.dirSync({ unsafeCleanup: true })
var tempLogFile = tmp.fileSync({ unsafeCleanup: true })
var featuresResult = Cucumber.Runtime.FeaturesResult()
var scenarioResult
var runtime
var currentStep
var client
var prevTime

tmp.setGracefulCleanup()

function bootstrap (options) {
  var done = false

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
      .then(function (testResults) {
        logScenarioResult()
        return testResults
      })
  }

  TestCase.prototype.run = origRun
}

function patchNighwatchAsyncTree () {
  var AsyncTree = require.main.require('nightwatch/lib/core/queue').instance()
  var origRunCommand = AsyncTree.runCommand
  var origAppend = AsyncTree.append

  AsyncTree.runCommand = function (node, done) {
    return origRunCommand.call(this, node, function () {
      if (node.step && node.step.lastNode === node) {
        var lastResult = client.results.tests.length && client.results.tests[client.results.tests.length - 1]
        var failure = lastResult && lastResult.failure
        logStepResult(node.step, failure ? Cucumber.Status.FAILED : Cucumber.Status.PASSED)
      }
      done()
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
  var origGlobalReporter = Reporter.prototype.globalReporter

  Reporter.prototype.globalReporter = function (globals) {
    logFeaturesResult()
    logAfterFeatures(runtime.getFeatures().getFeatures())
    this.globalResults.cucumber = JSON.parse(fs.readFileSync(tempLogFile.name, 'utf8'))
    return origGlobalReporter.call(this, globals)
  }
}

function broadcastEvent (event) {
  formatters.forEach(function (formatter) {
    formatter.hear(event, function () {})
  })
}

function logAfterFeatures (features) {
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_EVENT_NAME, { features: features })
  broadcastEvent(event.replicateAsPostEvent())
}

function logFeaturesResult () {
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_RESULT_EVENT_NAME, { featuresResult: featuresResult })
  broadcastEvent(event)
}

function logBeforeFeature (feature) {
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURE_EVENT_NAME, { feature: feature })
  broadcastEvent(event.replicateAsPreEvent())
  prevTime = time()
}

function logBackground (background) {
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.BACKGROUND_EVENT_NAME, { background: background })
  broadcastEvent(event.replicateAsPreEvent())
}

function logBeforeScenario (scenario) {
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, { scenario: scenario })
  scenarioResult = Cucumber.Runtime.ScenarioResult(scenario)
  broadcastEvent(event.replicateAsPreEvent())
}

function logScenarioResult () {
  featuresResult.witnessScenarioResult(scenarioResult)
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_RESULT_EVENT_NAME, { scenarioResult: scenarioResult })
  broadcastEvent(event)
}

function logStepResult (step, status) {
  var stepResult = Cucumber.Runtime.StepResult({
    step: step,
    stepDefinition: step.stepDefinitions[0],
    duration: durationInNanoseconds(prevTime),
    status: status,
    failureException: '',
    attachments: []
  })
  scenarioResult.witnessStepResult(stepResult)
  featuresResult.witnessStepResult(stepResult)
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, { stepResult: stepResult })
  broadcastEvent(event)
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
    var duration = process.hrtime(start)
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
    if (!step.stepDefinitions || !step.stepDefinitions.length) return logStepResult(step, Cucumber.Status.UNDEFINED)
    if (step.stepDefinitions.length > 1) return logStepResult(step, Cucumber.Status.AMBIGUOUS)
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
      before: function () {
        logBeforeFeature(feature)
        if (feature.hasBackground()) logBackground(feature.getBackground())
      },
      after: function (browser) {
        if (options.closeSession === 'afterFeature') {
          browser.end()
        }
      },
      beforeEach: options.beforeScenario,
      afterEach: options.afterScenario
    }

    bootstrap.features[feature.getName()] = feature.discovered

    tags = getFeatureTags(feature)

    if (tags.length) {
      feature.discovered['@tags'] = tags
    }
  }

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
    logBeforeScenario(scenario)

    steps.forEach(function (step) {
      currentStep = step
      if (options.beforeStep) options.beforeStep(browser)
      step.execute(browser, function (result) {
        if (result.getStatus() === Cucumber.Status.FAILED) {
          console.log(result.getFailureException())
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
