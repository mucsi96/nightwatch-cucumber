var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require('glob'),
    checkSyntaxError = require('syntax-error'),
    syntaxError = false,
    Cucumber,
    configuration,
    tempTestFolder = path.resolve(process.cwd(), 'temp-tests'),
    runtime,
    cucumber = {
        features: {}
    };

try {
  Cucumber = require('cucumber/lib/cucumber');
} catch (_) {
  // workaround when `npm link`'ed for development
  var prequire = require('parent-require');
  Cucumber = prequire('cucumber/lib/cucumber');
}

configuration = Cucumber.Cli.Configuration({
   snippets: true,
   useColors: true,
   format: ['summary']
}, []);

function getFeatureSources() {
    var featureSources = [];

    glob.sync("features/**/*.feature").forEach(function(file) {
        featureSources.push([path.resolve(process.cwd(), file), fs.readFileSync(file)]);
    });

    return featureSources;
}

function getSupportCodeInitializer() {
    return function() {
        var files = [],
            supportCodeHelper = this;

        glob.sync("step-definitions/**/*.js").forEach(function(file) {
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
    var formatter = configuration.getFormatters()[0];
    var colors = Cucumber.Util.Colors(true);

    if (!stepDefinitions || stepDefinitions.length == 0) {
        formatter.storeUndefinedStepResult({getStep: getStep});
        formatter.log(colors.pending('Undefined steps found!'));
        formatter.logUndefinedStepSnippets();
        return;
    }

    if (stepDefinitions.length > 1) {
        formatter.storeAmbiguousStepResult({getStep: getStep, getAmbiguousStepDefinitions: function() {
            return stepDefinitions;
        }});
        formatter.log(colors.ambiguous('Ambiguous steps found!'));
        formatter.logAmbiguousSteps();
        return;
    }

    return function (context, callback) {
        stepDefinitions[0].invoke(step, context, {getAttachments: function(){}}, 60000, callback);
    }
}

function getFeatureTags(feature) {
    return feature.getTags().map(function(tag) {
        return tag.getName().replace(/^@/, '');
    });
}

function discoverScenario(feature, scenario, steps) {
    var tags;

    if (!feature.discovered) {
        feature.discovered = {};
        cucumber.features[feature.getName()] = feature.discovered;

        tags = getFeatureTags(feature);

        if (tags.length) {
            feature.discovered['@tags'] = tags;
        }
    }

    feature.discovered[scenario.getName()] = function(browser) {
        steps.forEach(function(step) {
            step(browser, function(result) {
                if (result.getStatus() === Cucumber.Status.FAILED) {
                    console.log(result.getFailureException());
                }
            })
        });
        browser.end();
    };
}

function createTestFile(feature) {
    var testFileSource = 'module.exports = require("nightwatch-cucumber").features["' + feature.getName() + '"];';

    fs.writeFileSync(path.resolve(tempTestFolder, feature.getName().replace(/\W+/g, '') + '.js'), testFileSource);
}

function init() {
    rimraf.sync(tempTestFolder);
    fs.mkdirSync(tempTestFolder);
    runtime = Cucumber(getFeatureSources(), getSupportCodeInitializer());

    if (syntaxError) {
        cucumber = {};
        return;
    }

    runtime.getFeatures().getFeatures().asyncForEach(function(feature, nextFeature) {
        createTestFile(feature);
        feature.instructVisitorToVisitScenarios({
            visitScenario: function(scenario, nextScenario) {
                var steps = [];
                scenario.getSteps().forEach(function(step) {
                    var stepExecutor = getStepExecutor(step);
                    if (stepExecutor) {
                        steps.push(stepExecutor);
                    }
                });
                discoverScenario(feature, scenario, steps);
                nextScenario();
            }
        }, nextFeature);
    }, function() {});
}

init();

module.exports = cucumber;
