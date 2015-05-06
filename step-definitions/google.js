module.exports = function() {

    this.Given(/^I open Google's fr search page$/, function(callback) {
        console.log('I open Google`s fr search page');
        console.log(this.greet);
        callback();
    });

    this.Then(/^the title is "([^"]*)"$/, function(arg1, callback) {
        console.log('the title is');
        callback();
    });

    this.Then(/^the search form exists$/, function(callback) {
        console.log('the search form exists');
        callback();
    });

};
