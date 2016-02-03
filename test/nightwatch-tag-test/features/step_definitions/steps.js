module.exports = function() {

    this.Given(/^I open Google's search page$/, function() {
        this
            .url('http://google.com')
            .waitForElementVisible('body', 1000);
    });

    this.Then(/^the title is "([^"]*)"$/, function(title) {
        this.assert.title(title);
    });

    this.Then(/^the Google search form exists$/, function() {
        this.assert.visible('input[name="q"]');
    });

    this.Given(/^I open Yahoo's search page$/, function() {
        var yahoo = this.page.yahoo();

        yahoo
            .navigate()
            .waitForElementVisible('@body', 1000);
    });

    this.Then(/^the Yahoo search form exists$/, function() {
        var yahoo = this.page.yahoo();

        yahoo.assert.visible('@searchBar');
    });

};
