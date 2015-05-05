var fs = require('fs'),
    path = require('path'),
    glob = require("glob"),
    Cucumber = require('cucumber/lib/cucumber'),
    options = JSON.parse(fs.readFileSync('nightwatch.json', 'utf-8')),
    Selenium = require('nightwatch/lib/runner/selenium'),
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

runtime.attachListener(Cucumber.Listener.ProgressFormatter({}));
Selenium.startServer(options, function(error, child, error_out) {
    if (error) {
        console.error('There was an error while starting the Selenium server:' +error_out);
        return;
    }

    runtime.start(function() {
        Selenium.stopServer();
    });
});

