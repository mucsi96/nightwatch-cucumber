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
    this.When(/^I open Google's fr search page$/, function(cb) {
        browser
            .url('http://www.google.com')
            .waitForElementVisible('body', 1000)
            .end();

        client.once('complete', function() {
            cb();
        }).start();
    });

    this.Then(/^the title is Google$/, function(cb) {
        browser
            .assert.title("Google")
            .end();

        client.once('complete', function() {
            cb();
        }).start();
    });

    this.Then(/^the search form exists$/, function(cb) {
        //console.log('the search form exists');
        cb();
    });
};
