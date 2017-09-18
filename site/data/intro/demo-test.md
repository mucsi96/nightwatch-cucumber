## Demo Test

By default feature files are located in `features` folder. You can change this using configuration object.

```gherkin
# features/google.feature

Feature: Google Search

Scenario: Searching Google

  Given I open Google's search page
  Then the title is "Google"
  And the Google search form exists
```

Step definitions files are located in `features/step_definitions` folder by default.

```javascript
// features/step_definitions/google.js

const {client} = require('nightwatch-cucumber');
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Given, Then, When}) => {
  Given(/^I open Google's search page$/, () => {
    return client
      .url('http://google.com')
      .waitForElementVisible('body', 1000);
  });

  Then(/^the title is "([^"]*)"$/, (title) => {
    return client.assert.title(title);
  });

  Then(/^the Google search form exists$/, () => {
    return client.assert.visible('input[name="q"]');
  });

});
```

For more examples check out the [example repository](https://github.com/mucsi96/nightwatch-cucumber-example) or the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)
