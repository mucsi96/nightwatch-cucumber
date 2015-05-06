var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require("glob"),
    Cucumber = require('cucumber/lib/cucumber'),
    options = JSON.parse(fs.readFileSync('nightwatch.json', 'utf-8')),
    Selenium = require('nightwatch/lib/runner/selenium'),
    tempTestFolder = path.resolve(process.cwd(), 'temp-tests'),
    runtime;

function getFeatureSources() {
    var featureSources = [];

    glob.sync("features/**/*.feature").forEach(function(file) {
        featureSources.push([path.resolve(process.cwd(), file), fs.readFileSync(file)]);
    });

    return featureSources;
}

function getSupportFiles() {
    var files = [];

    glob.sync("step-definitions/**/*.js").forEach(function(file) {
        files.push(path.resolve(process.cwd(), file));
    });

    return files;
}

runtime = Cucumber.Runtime({
    getFeatureSources: getFeatureSources,
    getAstFilter: function() {
        return {
            isElementEnrolled: function(element) {
                return true;
            }
        }
    },
    getSupportCodeLibrary: function() {
        return Cucumber.Cli.SupportCodeLoader(getSupportFiles()).getSupportCodeLibrary();
    }
});

function getStepExecutor(step) {
    var stepDefinition = runtime.getSupportCodeLibrary().lookupStepDefinitionByName(step.getName());
    return function (context, callback) {
        stepDefinition.invoke(step, context, {getAttachments: function(){}}, {id:1}, callback);
    }
}

var cucumber = {
    features: {}
};

function discoverStep(feature, scenario, step) {
    if (!feature.discovered) {
        feature.discovered = {};
        cucumber.features[feature.getName().replace(/\W+/g, '')] = feature.discovered);
    }

    if (!scenario.discovered) {
        scenario.discovered = {
            steps: []
        };
        feature.discovered[scenario.getName().replace(/\W+/g, '')] = scenario.discovered;
    }

    scenario.discovered.steps.push({
        name: step.getName(),
        fn: getStepExecutor(step)
    });
}

rimraf(tempTestFolder);
fs.mkdirSync(tempTestFolder);

function createTestFile(feature) {
    var name = feature.getName().replace(/\W+/g, '');

    fs.writeFileSync(path.resolve(tempTestFolder, name + '.js'), 'var cucumber = require("../globals/cucumber.js"); module.exports = cucumber.features["' + name + '"];')
}

var features = runtime.getFeatures().getFeatures();
features.forEach(function(feature, next) {

    feature.instructVisitorToVisitScenarios({
        visitScenario: function(scenario) {
            scenario.getSteps().forEach(function(step, next) {
                discoverStep(feature, scenario, step);
                next();
            }, next);
        }
    });
}, function() {});


module.exports = cucumber;
/*runtime.attachListener(Cucumber.Listener.ProgressFormatter({}));
Selenium.startServer(options, function(error, child, error_out) {
    if (error) {
        console.error('There was an error while starting the Selenium server:' +error_out);
        return;
    }

    runtime.start(function() {
        Selenium.stopServer();
    });
});*/
