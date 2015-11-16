var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require("glob"),
    Cucumber = require('cucumber/lib/cucumber'),
    CucumberSummaryFormatter = require('cucumber/lib/cucumber/listener/summary_formatter')({snippets: true}),
    tempTestFolder = path.resolve(process.cwd(), 'temp-tests'),
    runtime,
    cucumber = {
        features: {}
    };

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
            var initializer = require(file);

            if (typeof(initializer) === 'function')
                initializer.call(supportCodeHelper);
        });
    };
}

function getStepExecutor(step) {
    var stepDefinitions = runtime.getSupportCodeLibrary().lookupStepDefinitionsByName(step.getName());

    if (!stepDefinitions || stepDefinitions.length == 0) {
        CucumberSummaryFormatter.storeUndefinedStepResult(step);
        CucumberSummaryFormatter.log(Cucumber.Util.ConsoleColor.format('pending', 'Undefined steps found!\n'));
        return;
    }

    if (stepDefinitions.length > 1) {
        CucumberSummaryFormatter.storeUndefinedStepResult(step);
        CucumberSummaryFormatter.log(Cucumber.Util.ConsoleColor.format('pending', 'Ambiguous steps found!\n'));
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
    var testFileSource = 'module.exports = require(process.cwd() + "/globals/cucumber").features["' + feature.getName() + '"];';

    fs.writeFileSync(path.resolve(tempTestFolder, feature.getName().replace(/\W+/g, '') + '.js'), testFileSource);
}

rimraf.sync(tempTestFolder);
fs.mkdirSync(tempTestFolder);

runtime = Cucumber(getFeatureSources(), getSupportCodeInitializer());

runtime.getFeatures().getFeatures().forEach(function(feature) {
    createTestFile(feature);
    feature.instructVisitorToVisitScenarios({
        visitScenario: function(scenario) {
            var steps = [];
            scenario.getSteps().forEach(function(step) {
                var stepExecutor = getStepExecutor(step);

                if (stepExecutor) {
                    steps.push(stepExecutor);
                }
            });
            discoverScenario(feature, scenario, steps);
        }
    });
});

if (CucumberSummaryFormatter.getUndefinedStepLogBuffer()) {
    CucumberSummaryFormatter.logUndefinedStepSnippets();
}

module.exports = cucumber;
