var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require("glob"),
    Cucumber = require('cucumber/lib/cucumber'),
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
    var stepDefinition = runtime.getSupportCodeLibrary().lookupStepDefinitionByName(step.getName());
    return function (context, callback) {
        stepDefinition.invoke(step, context, {getAttachments: function(){}}, {id:1}, callback);
    }
}

function discoverScenario(feature, scenario, steps) {
    if (!feature.discovered) {
        feature.discovered = {};
        cucumber.features[feature.getName()] = feature.discovered;
    }

    feature.discovered[scenario.getName()] = function(browser) {
        steps.forEach(function(step) {
            step(browser, function(result) {
                if (result.isFailed()) {
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

runtime.getFeatures().getFeatures().forEach(function(feature, next) {
    createTestFile(feature);
    feature.instructVisitorToVisitScenarios({
        visitScenario: function(scenario) {
            var steps = [];
            scenario.getSteps().forEach(function(step, next) {
                steps.push(getStepExecutor(step));
                next();
            }, function() {
                discoverScenario(feature, scenario, steps);
            });
        }
    });
}, function() {});

module.exports = cucumber;
