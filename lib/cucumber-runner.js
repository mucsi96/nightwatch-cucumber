var path = require('path');
var objectAssign = require('object-assign');
var nightwatch = require.main.require('nightwatch');
var client;

function World() {
    objectAssign(this, client.api);
}

function bootstrap(options) {
    var cliRunner;
    var clientManager;

    if (this.BeforeFeatures && this.AfterFeatures) {
        this.BeforeFeatures(function(event, done) {
            cliRunner = nightwatch.CliRunner(process.argv);
            cliRunner.setup();
            cliRunner.startSelenium(done);
        });

        this.AfterFeatures(function(event, done) {
            cliRunner.stopSelenium(done);
        });
    }

    if (this.BeforeFeature && this.AfterFeature) {
        this.BeforeFeature(function (event, done) {
            clientManager = nightwatch.initClient(cliRunner.test_settings);
            client = clientManager.get();
            clientManager.endSessionOnFail();
            done();
        });

        this.AfterFeature(function (event, done) {
            clientManager.terminated();
            clientManager.clearGlobalResult();
            clientManager.checkQueue();
            clientManager.restartQueue();
            clientManager.resetQueue();
            client.api.end();
            done();
        });
    }

    if (this.Before && this.After) {
        this.Before(function(event, done) {
            clientManager.clearGlobalResult();
            clientManager.terminated();
            done();
        });

        this.After(function(event, done) {
            clientManager.start(function() {
                clientManager.checkQueue();
                done();
            });
        });
    }

    this.World = World;
    return __filename;
}

module.exports = bootstrap;
