var fs = require('fs');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');
var tmp = require('tmp');
var events = require('events');
var checkSyntaxError = require('syntax-error');
var syntaxError = false;
var Cucumber = require.main.require('cucumber/lib/cucumber');
var configuration;
var formatter;
var colors = Cucumber.Util.Colors(true);
var tempTestFolder = tmp.dirSync({ unsafeCleanup: true });
var runtime;
var wereUndefinedSteps = false;
var wereAmbiguousStep = false;
var currentStep;

tmp.setGracefulCleanup();

function bootstrap(options) {
    var done = false;

    var configurationArgs = [options.featureFiles]
    configuration = Cucumber.Cli.Configuration({
       source: true,
       snippets: true,
       colors: true,
       format: ['pretty']
    }, configurationArgs);

    formatter = configuration.getFormatters()[0];

    runtime = Cucumber(getFeatureSources(options), getSupportCodeInitializer(options));

    if (syntaxError) {
        cucumber = {};
        return;
    }

    runtime.getFeatures().getFeatures().asyncForEach(function(feature, nextFeature) {
        var backgroundSteps = [];

        createTestFile(feature, options);

        if (feature.hasBackground()) {
            feature.getBackground().getSteps().forEach(function(step) {
                var stepExecutor = getStepExecutor(step);
                if (stepExecutor) {
                    backgroundSteps.push(stepExecutor);
                }
            });
        }

        feature.instructVisitorToVisitScenarios({
            visitScenario: function(scenario, nextScenario) {
                var steps = [];
                scenario.getSteps().forEach(function(step) {
                    step.execute = getStepExecutor(step);
                    if (step.execute) {
                        steps.push(step);
                    }
                });
                discoverScenario(feature, scenario, backgroundSteps.concat(steps), options);
                nextScenario();
            }
        }, nextFeature);
    }, function() {
        if (wereUndefinedSteps) {
            formatter.log(colors.pending('Undefined steps found!'));
            formatter.logUndefinedStepSnippets();
        }

        if (wereAmbiguousStep) {
            formatter.log(colors.ambiguous('Ambiguous steps found!'));
            formatter.logAmbiguousSteps();
        }

        done = true;
    });

    while(!done){}

    // var TestCase = require.main.require('nightwatch/lib/runner/testcase');
    // var orig_TestCase_run = TestCase.prototype.run;

    // TestCase.prototype.run = function() {
    //   this.suite.client.once('complete', function(results, errors) {
    //     console.log(results);
    //   });
    //   return orig_TestCase_run.call(this);
    // };

    var AsyncTree = require.main.require('nightwatch/lib/core/queue').instance();
    var orig_AsyncTree_runCommand = AsyncTree.runCommand;

    AsyncTree.runCommand = function(node, done) {
      return orig_AsyncTree_runCommand.call(this, node, function() {
        if (node.step && node.step.lastNode === node) logStepResult(node.step);
        done();
      });
    }

    var orig_AsyncTree_append = AsyncTree.append;
    AsyncTree.append = function(nodeName, command, context, args, stackTrace) {
      var result = orig_AsyncTree_append.call(this, nodeName, command, context, args, stackTrace);
      var node = this.currentNode.children[this.currentNode.children.length - 1];

      node.step = currentStep;

      if (node.parent.step) {
        node.step = node.parent.step;
      }

      if (node.step) node.step.lastNode = node;

      return result;
    };

    return tempTestFolder.name;
}

bootstrap.features = {};

function logStepResult(step, error) {
  var stepResult = Cucumber.Runtime.StepResult({
    step: step,
    stepDefinition: step.stepDefinition,
    duration: 0,
    status: (error ? Cucumber.Status.FAILED : Cucumber.Status.PASSED)
  });
  var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, { stepResult: stepResult });
  formatter.hear(event, function() {});
}

function getFeatureSources(options) {
    var featureSources = [];

    glob.sync(options.featureFiles + '/**/*.feature').forEach(function(file) {
        featureSources.push([path.resolve(process.cwd(), file), fs.readFileSync(file)]);
    });

    return featureSources;
}

function getSupportCodeInitializer(options) {
    return function() {
        var files = [],
            supportCodeHelper = this;

        glob.sync(options.stepDefinitions + '/**/*.js').forEach(function(file) {
            files.push(path.resolve(process.cwd(), file));
        });

        files.forEach(function(file) {
            var initializer,
                src = fs.readFileSync(file),
                err = checkSyntaxError(src, file);

            if (err) {
                console.error(err);
                syntaxError = true;
                return;
            }

            initializer = require(file);

            if (typeof(initializer) === 'function')
                initializer.call(supportCodeHelper);
        });
    };
}

function getStepExecutor(step) {
    var stepDefinitions = runtime.getSupportCodeLibrary().lookupStepDefinitionsByName(step.getName());
    var getStep = function() { return step; };

    if (!stepDefinitions || !stepDefinitions.length) {
        formatter.storeUndefinedStepResult({getStep: getStep});
        wereUndefinedSteps = true;
        return;
    }

    if (stepDefinitions.length > 1) {
        formatter.storeAmbiguousStepResult({
            getStep: getStep,
            getAmbiguousStepDefinitions: function() {
                return stepDefinitions;
            }
        });
        wereAmbiguousStep = true;
        return;
    }

    step.stepDefinition = stepDefinitions[0];

    return function (context, callback) {
        stepDefinitions[0].invoke(step, context, {getAttachments: function(){}}, 60000, callback);
    };
}

function getFeatureTags(feature) {
    return feature.getTags().map(function(tag) {
        return tag.getName().replace(/^@/, '');
    });
}

function discoverScenario(feature, scenario, steps, options) {
    var tags;
    var scenarioName;
    var example;

    if (!feature.discovered) {
        feature.discovered = {
            before: function() {
                formatter.log('Feature: ' + colors.passed(feature.getName() + '\n'));
            },
            after: function(browser) {
                if (options.closeSession === 'afterFeature') {
                    browser.end();
                }
            },
            beforeEach: options.beforeScenario,
            afterEach: options.afterScenario
        };

        bootstrap.features[feature.getName()] = feature.discovered;

        tags = getFeatureTags(feature);

        if (tags.length) {
            feature.discovered['@tags'] = tags;
        }
    }

    if (scenario.getScenarioOutlineLine()) {
        if (!feature.discovered.firstOutlineRow) {
            feature.discovered.firstOutlineRow = scenario.getLine();
            example = 1;
        } else {
            example = 1 + scenario.getLine() - feature.discovered.firstOutlineRow;
        }
    }

    if (example) {
        scenarioName = scenario.getName() + ' #' + example;
    } else {
        scenarioName = scenario.getName();
    }

    feature.discovered[scenarioName] = function(browser) {
        var event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, { scenario: scenario });
        formatter.hear(event.replicateAsPreEvent(), function() {});

        steps.forEach(function(step) {
            if (options.beforeStep) options.beforeStep(browser);
            currentStep = step;
            step.execute(browser, function() {});
            currentStep = null;
            if (options.afterStep) options.afterStep(browser);
        });


        if (options.closeSession === 'afterScenario') {
            browser.end();
        }
    };
}

function createTestFile(feature, options) {
    var selfPath = __filename.split(path.sep).join('/');
    var testFileSource = 'module.exports = require("' + selfPath + '").features["' + feature.getName() + '"];';
    var testFilePath = path.join(tempTestFolder.name, path.relative(options.featureFiles, feature.getUri())).replace(/\.[^/.]+$/, '.js');

    mkdirp.sync(path.dirname(testFilePath));
    fs.writeFileSync(testFilePath, testFileSource);
}

module.exports = bootstrap;
