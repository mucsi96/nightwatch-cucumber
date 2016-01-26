module.exports = function() {

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
