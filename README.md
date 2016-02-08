![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber.png)

# nightwatch-cucumber

[![npm version](https://badge.fury.io/js/nightwatch-cucumber.svg)](https://badge.fury.io/js/nightwatch-cucumber)
[![Build Status](https://travis-ci.org/mucsi96/nightwatch-cucumber.svg?branch=master)](https://travis-ci.org/mucsi96/nightwatch-cucumber)
[![Code Climate](https://codeclimate.com/github/mucsi96/nightwatch-cucumber/badges/gpa.svg)](https://codeclimate.com/github/mucsi96/nightwatch-cucumber)
[![Dependencies](https://david-dm.org/mucsi96/nightwatch-cucumber.svg)](https://david-dm.org/mucsi96/nightwatch-cucumber)
[![Join the chat at https://gitter.im/mucsi96/nightwatch-cucumber](https://badges.gitter.im/mucsi96/nightwatch-cucumber.svg)](https://gitter.im/mucsi96/nightwatch-cucumber?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Issue Stats](http://issuestats.com/github/mucsi96/nightwatch-cucumber/badge/pr?style=flat)](http://issuestats.com/github/mucsi96/nightwatch-cucumber)
[![Issue Stats](http://issuestats.com/github/mucsi96/nightwatch-cucumber/badge/issue?style=flat)](http://issuestats.com/github/mucsi96/nightwatch-cucumber)

[![NPM](https://nodei.co/npm-dl/nightwatch-cucumber.png?months=1&height=3)](https://nodei.co/npm/nightwatch-cucumber/)

[Cucumber.js](https://github.com/cucumber/cucumber-js) plugin for [Nightwatch.js](http://nightwatchjs.org/). This enables to use a BDD-style approach for cross-browser testing:
- Describe user stories in Cucumber
- Map them to HTML/DOM operations in Nightwatch.js
- Run using either local Selenium driver or cloud based WebDriver services such as SauceLabs or BrowserStack

This plugin allows to run tests in two modes:
- Nightwatch.js as runner
- Cucumber.js as runner (work in progress)

## Installation (Nightwatch.js as runner)

### Step 1

First you need to have Nightwatch.js and Cucumber.js to be installed locally.

```
$ npm install nightwatch cucumber
```

If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

### Step 2

Install `nightwatch-cucumber`

```
$ npm install nightwatch-cucumber
```

### Step 3

In project root create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`.

### Step 4

Add `require('nightwatch-cucumber')({/* configuration */})` to `src_folders` in configuration file.
```
// nightwatch.conf.js

module.exports = {
    src_folders: [require('nightwatch-cucumber')({/* configuration */})],
    ...
};
```
For examples check out the [test folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/test) [More details](http://nightwatchjs.org/guide#settings-file)

## Installation (Cucumber.js as runner)

### Step 1

First you need to have Nightwatch.js and Cucumber.js to be installed locally.

```
$ npm install nightwatch cucumber
```

If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

### Step 2

Install `nightwatch-cucumber`

```
$ npm install nightwatch-cucumber
```

### Step 3

In project root create a configuration file for Cucumber.js. [More details](https://github.com/cucumber/cucumber-js#profiles)

```
// cucumber.js

var path = require('nightwatch-cucumber')({
    /* configuration */
    runner: 'cucumber'
});

module.exports = {
    default: '--require ' + path + ' --require features'
}
```
### Step 4

In project root create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`.
```
// nightwatch.conf.js

module.exports = {
    ...
};
```
For examples check out the [test folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/test) [More details](http://nightwatchjs.org/guide#settings-file).

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

Step definitions files are located in `features/step_definitions` folder by default.

All step definitions will run with `this` set to Nightwatch.js client or browser object

```
// features/step_definitions/google.js

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

For more examples check out the [test folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/test)

## Running tests (Nightwatch.js as runner)

If you have installed `nightwatch` with `-g` (global) option you can run the tests by executing
```
nightwatch
```

In other case you can run the tests by executing
```
node_modules/.bin/nightwatch
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-output.png)

## Running tests (Cucumber.js as runner)

If you have installed `cucumber` with `-g` (global) option you can run the tests by executing
```
cucumberjs
```

In other case you can run the tests by executing
```
node_modules/.bin/cucumberjs
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/cucumber-output.png)

## Features (Nightwatch.js as runner)

### Hooks

#### Before/after all features and before/after each feature
These hooks can be provided using Nightwatch external globals. External globals file is specified in the `globals_path` property of `nightwatch.conf.js`. [More details](http://nightwatchjs.org/guide#external-globals)

```
// nightwatch.conf.js

module.exports = {
    src_folders: [require('nightwatch-cucumber')({/* configuration */})],
    globals_path: 'globals-module.js',
    ...
};
```

```
// globals-module.js

module.exports = {
    before : function(cb) {
        console.log('Runs before all features');
        cb();
    },

    beforeEach : function(browser, cb) {
        console.log('Runs before each feature');
        cb();
    },

    after : function(cb) {
        console.log('Runs after all features');
        cb();
    },

    afterEach : function(browser, cb) {
        console.log('Runs after each feature');
        cb();
    }
};

```

#### Before/after each scenario and before/after each step
These hooks can be provided using configuration object.

```
// nightwatch.conf.js

module.exports = {
    src_folders: [require('nightwatch-cucumber')({
        beforeScenario: function(browser, cb) {
            console.log('Runs before each scenario');
            cb();
        },
        beforeStep: function(browser) {
            console.log('Runs before each step');
        },
        afterScenario: function(browser, cb) {
            console.log('Runs after each scenario');
            cb();
        },
        afterStep: function(browser) {
            console.log('Runs after each step');
        }
    })],
    ...
};
```

### Feature Groups
You can selectively run features based on groups. To group features together just place them in the same sub-folder. The folder name is the name of the group.
You can use Nightwatch CLI `--group`, `--skipgroup` flags. [More details ](http://nightwatchjs.org/guide#test-groups)

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

### Feature background
You can use feature background to avoid copying and pasting of steps. The background runs before each scenario after beforeScenario hooks.

```
Feature: Feature background example

Background:
    Given there are 10 cucumbers

Scenario: eating

    When I eat 3 cucumbers
    Then I should have 7 cucumbers

Scenario: adding

    When I add 1 cucumbers
    Then I should have 11 cucumbers
```

### Scenario Outlines
You can use scenario outlines to avoid copying and pasting of scenarios.

```
Scenario Outline: eating
  Given there are <start> cucumbers
  When I eat <eat> cucumbers
  Then I should have <left> cucumbers

  Examples:
    | start | eat | left |
    |  12   |  5  |  7   |
    |  20   |  5  |  15  |
```

### Page Objects
For making you tests more readable and maintainable you can use the Page Object pattern. Nightwatch reads the page objects from the folder (or folders) specified in the `page_objects_path` configuration property. [More details](http://nightwatchjs.org/guide#page-objects). Add the following line to Nightwatch.js configuration file.

```
// nightwatch.conf.js

module.exports = {
    src_folders: [require('nightwatch-cucumber')({/* configuration */})],
    page_objects_path: 'page-objects',
    ...
};
```

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

### Closing Selenium session

This plugin provides three ways of closing Selenium sessions. This enables reuse of session and prevents browser restarts. This can be controlled in configuration using `closeSession` property. Possible values are:
- `afterScenario`
- `afterFeature` default
- `never`

# Configuration (Nightwatch.js as runner)

The default configuration object is.
```
{
    runner: 'nightwatch',
    featureFiles: 'features',
    stepDefinitions: 'features/step_definitions',
    closeSession: 'afterFeature'
}
```

Options could be overwritten in the following way.
```
// nightwatch.conf.js

module.exports = {
    src_folders: [require('nightwatch-cucumber')({
        runner: 'cucumber'
    })],
    ...
};
```

# Change Log
## 1.3.1 (February 8, 2016)
Features:
  - Readme improved

## 1.3.0 (February 6, 2016)
Features:
  - Hooks support added
  - Feature background support added
  - Add feature name to output (Nightwatch.js as runner)

## 1.2.0 (February 6, 2016)
Features:
  - Scenario outlines support added

Bugfixes:
  - Fix undefined/ambiguous step handling

## 1.1.0 (January 28, 2016)
Features:
  - Keep browser instance open
  - Add TravisCI tests

## 1.0.2 (January 27, 2016)
Features:
  - Add Cucumber.js as runner support


## 0.6.7 (January 18, 2016)
Bugfixes:
  - Fix path issue on Windows systems

## 0.6.6 (January 17, 2016)
Features:
  - Use require.main.require instead of parent-require for requiring nightwatch

## 0.6.5 (January 17, 2016)
Features:
  - don't create temp-tests folder

## 0.6.3 (January 16, 2016)
Features:
  - added support for grouping features by placing them in same sub-folder
