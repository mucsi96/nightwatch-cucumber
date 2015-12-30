module.exports = function() {

    this.Given(/^I open Yahoo's search page$/, function() {
        this
            .url('http://yahoo.com')
            .waitForElementVisible('body', 1000);
    });

    this.Then(/^the Yahoo search form exists$/, function() {
        this.assert.visible('input[name="p"]');
    });

};
