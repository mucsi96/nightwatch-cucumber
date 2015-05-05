var api = require('nightwatch/lib/core/api');

//console.log(api.init());

module.exports = function() {
    this.When(/^I open Google's fr search page$/, function(callback) {
        console.log('I open Google`s fr search page');
        callback();
    });

    this.Then(/^the title is Google$/, function(cb){
        console.log('the title is Google');
        cb();
    });

    this.Then(/^the search form exists$/, function(cb){
        console.log('the search form exists');
        cb();
    });
};
