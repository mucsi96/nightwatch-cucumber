var path = require('path');
var objectAssign = require('object-assign');
var nightwatch = require.main.require('nightwatch');
var CliRunner = require.main.require('nightwatch/lib/runner/cli/clirunner');
var ClientManager = require.main.require('nightwatch/lib/runner/clientmanager');
var client;

function World() {
    objectAssign(this, client.api);
}

function bootstrap(options) {
    var runner = new CliRunner(process.argv);

    if (this.BeforeFeatures && this.AfterFeatures) {
        this.BeforeFeatures(function(event, done) {
            runner.init();
            var clientManager = new ClientManager();
            client = clientManager.init(runner.test_settings).get();
            runner.startSelenium(done);
        });

        this.AfterFeatures(function(event, done) {
            runner.stopSelenium(done);
        });
    }

    if (this.Before && this.After) {
        this.Before(function (event, done) {
            client.on('selenium:session_create', function() {
                done();
            });
            client.start();
        });

        this.After(function (event, done) {
            client.api.end(function() {
                done();
            });
        });
    }

    this.World = World;
    return __filename.split(path.sep).join('/');
}

module.exports = bootstrap;
