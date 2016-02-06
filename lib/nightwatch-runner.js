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
var formatter = configuration.getFormatters()[0];
var colors = Cucumber.Util.Colors(true);
var tempTestFolder = tmp.dirSync({ unsafeCleanup: true });
var runtime;
var wereUndefinedSteps = false;
var wereAmbiguousStep = false;

tmp.setGracefulCleanup();

function bootstrap(options) {
    var done = false;

    runtime = Cucumber(getFeatureSources(options), getSupportCodeInitializer(options));

    if (syntaxError) {
        cucumber = {};
        return;
    }

    runtime.getFeatures().getFeatures().asyncForEach(function(feature, nextFeature) {
        createTestFile(feature, options);
        feature.instructVisitorToVisitScenarios({
            visitScenario: function(scenario, nextScenario) {
                var steps = [];
                scenario.getSteps().forEach(function(step) {
                    var stepExecutor = getStepExecutor(step);
                    if (stepExecutor) {
                        steps.push(stepExecutor);
                    }
                });
                discoverScenario(feature, scenario, steps, options);
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
    return tempTestFolder.name;
}

bootstrap.features = {};

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

    if (!stepDefinitions || stepDefinitions.length == 0) {
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

    return function (context, callback) {
        stepDefinitions[0].invoke(step, context, {getAttachments: function(){}}, 60000, callback);
    }
}

function getFeatureTags(feature) {
    return feature.getTags().map(function(tag) {
        return tag.getName().replace(/^@/, '');
    });
}

function discoverScenario(feature, scenario, steps, options) {
    var tags;

    if (!feature.discovered) {
        feature.discovered = {
            after: function(browser) {
                if (options.closeSession === 'afterFeature') {
                    browser.end();
                }
            }
        };
        bootstrap.features[feature.getName()] = feature.discovered;

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
