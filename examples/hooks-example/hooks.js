const {defineSupportCode} = require('cucumber')
const {client} = require('nightwatch-cucumber')

defineSupportCode(({Before, After}) => {
  Before(function (scenario, callback) {
    console.log('Before start');
    setTimeout(function() {
      console.log('Before end');
      callback();
    }, 1000);
  });

  After(function (scenario, callback) {
    console.log('After start');
    setTimeout(function() {
      console.log('After end');
      callback();
    }, 1000);
  });

  Before(function (scenario) {
    return client.init();
  });

  After(function (scenario) {
    return client.click('input[name="q"]');
  });

  After('@sometag', function (scenario) {
    return client.click('buttons');
  });
}
