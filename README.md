![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber.png)

# nightwatch-cucumber

[Cucumber.js](https://github.com/cucumber/cucumber-js) plugin for [Nightwatch.js](http://nightwatchjs.org/). This enables to use a BDD-style approach for cross-browser testing:
- Describe user stories in Cucumber
- Map them to HTML/DOM operations in Nightwatch.js
- Run using either local Selenium driver or cloud based WebDriver services such as SauceLabs or BrowserStack

## Installation

```
$ npm install nightwatch-cucumber
```
If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

Add the following line to Nightwatch.js configuration file.
```
globals_path: 'node_modules/nightwatch-cucumber'
```

## Demo Test
Currently feature files are located in `features` folder.

```
# features/google.feature

Feature: Google Search

Scenario: Searching Google

    Given I open Google's search page
    Then the title is "Google"
    And the Google search form exists
```

Step definitions files are located in `step-definitions` folder.

All step definitions will run with `this` set to Nightwatch.js client or browser object

```
// step-definitions/google.js

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

};
```

## Running tests

If you have installed `nightwatch` with `-g` (global) option you can run the tests by executing
```
nightwatch
```

In other case you can run the tests by executing
```
node_modules/.bin/nightwatch
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/demotestoutput.png)

## Features

### Feature Tags
You can selectively run features based on tags. [More details ](http://nightwatchjs.org/guide#test-tags)
```
# google.feature

@google @search
Feature: Google Search

Scenario: Searching Google

    Given I open Google's search page
    Then the title is "Google"
    And the Google search form exists
```
```
$ node nightwatch.js --tag google
```
You can also skip features based on tags
```
node nightwatch.js --skiptags google
```

### Page Objects

Add the following line to Nightwatch.js configuration file.

```
page_objects_path: 'page-objects'
```

Nightwatch reads the page objects from the folder (or folders) specified in the page_objects_path configuration property. [More details](http://nightwatchjs.org/guide#page-objects)

```
//page-objects/yahoo.js

module.exports = {
    url: 'http://yahoo.com',
    elements: {
        body: 'body',
        searchBar: 'input[name="p"]'
    }
};
```

Now we can use page objects from step definitions

```
//step-definitions/yahoo.js

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
```
