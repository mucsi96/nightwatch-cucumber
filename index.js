var fs = require('fs');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');
var tmp = require('tmp');
var checkSyntaxError = require('syntax-error');
var syntaxError = false;
var Cucumber = require.main.require('cucumber/lib/cucumber');
var configuration = Cucumber.Cli.Configuration({
   snippets: true,
   useColors: true,
   format: ['summary']
}, []);
var tempTestFolder = tmp.dirSync({ unsafeCleanup: true });
var cucumber = {
    path: tempTestFolder.name,
    features: {}
};
var runtime;

tmp.setGracefulCleanup();

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
    var selfPath = __filename.split(path.sep).join('/');
    var testFileSource = 'module.exports = require("' + selfPath + '").features["' + feature.getName() + '"];';
    var testFilePath = path.join(tempTestFolder.name, path.relative('features', feature.getUri())).replace(/\.[^/.]+$/, '.js');

    mkdirp.sync(path.dirname(testFilePath));
    fs.writeFileSync(testFilePath, testFileSource);
}

function init() {
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
