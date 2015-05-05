var fs = require('fs'),
    path = require('path'),
    glob = require("glob"),
    Cucumber = require('cucumber/lib/cucumber'),
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
runtime.start(function() {
    console.log('done');
});
