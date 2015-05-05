var fs = require('fs'),
    ClientManager = require('nightwatch/lib/runner/clientmanager'),
    client,
    browser;

var options = JSON.parse(fs.readFileSync('nightwatch.json', 'utf-8'));

client = new ClientManager();
client.on('error', function(err) {
    console.error(err.message);
});
client.init(options);
browser = client.api();

module.exports = function() {
    this.Given(/^I open Google's fr search page$/, function(cb) {
        browser
            .url('http://www.google.com')
            .waitForElementVisible('body', 1000);

        cb();
    });

    this.Then(/^the title is "(.*)"$/, function(title, cb) {
        browser
            .assert.title(title)
            .end();

        cb();
    });

    this.Then(/^the search form exists$/, function(cb) {
        //console.log('the search form exists');
        client.once('complete', function(results, errors) {
            var failure;

            results.tests.forEach(function(result) {
                if (result.failure) {
                    failure = result.failure + result.stacktrace;
                }
            });

            if (failure) {
                cb(failure);
            } else {
                cb();
            }

        }).start();
    });
};
