![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber.png)

# nightwatch-cucumber

[![npm version](https://badge.fury.io/js/nightwatch-cucumber.svg)](https://badge.fury.io/js/nightwatch-cucumber)
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
- Cucumber.js as runner

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

Create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`. [More details](http://nightwatchjs.org/guide#settings-file)

### Step 4

Add `require('nightwatch-cucumber').path` to `src_folders` in configuration file.

```
...
src_folders: [require('nightwatch-cucumber').path],
...
```

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

Create a configuration file for Cucumber.js. [More details](https://github.com/cucumber/cucumber-js#profiles)

```
// cucumber.js

var path = require('nightwatch-cucumber')({
    runner: 'cucumber'
});

module.exports = {
    default: '--require ' + path + ' --require features'
}
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
cucumber
```

In other case you can run the tests by executing
```
node_modules/.bin/cucumber
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/cucumber-output.png)

## Features (Nightwatch.js as runner)

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

# Configuration (Nightwatch.js as runner)

The default configuration object is.
```
{
    runner: 'nightwatch',
    featureFiles: 'features/**/*.feature',
    stepDefinitions: 'features/step_definitions/**/*.js'
}
```

Options could be overwritten in the following way.
```
require('nightwatch-cucumber')({
    runner: 'cucumber'
})
```

# Change Log

## 1.0.0 (January 27, 2016)

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
