module.exports = function () {

    this.Given(/^I search house of cards$/, function (client) {

        client.url('https://google.co.uk');

    });

};
