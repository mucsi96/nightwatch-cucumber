# nightwatch-cucumber [![nightwatch-cucumber](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-logo.png)](https://github.com/mucsi96/nightwatch-cucumber)

[![npm version](https://badge.fury.io/js/nightwatch-cucumber.svg)](https://badge.fury.io/js/nightwatch-cucumber)
[![Build Status](https://travis-ci.org/mucsi96/nightwatch-cucumber.svg?branch=master)](https://travis-ci.org/mucsi96/nightwatch-cucumber)
[![Coverage Status](https://coveralls.io/repos/github/mucsi96/nightwatch-cucumber/badge.svg?branch=master)](https://coveralls.io/github/mucsi96/nightwatch-cucumber?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![dependencies Status](https://david-dm.org/mucsi96/nightwatch-cucumber/status.svg)](https://david-dm.org/mucsi96/nightwatch-cucumber)
[![devDependencies Status](https://david-dm.org/mucsi96/nightwatch-cucumber/dev-status.svg)](https://david-dm.org/mucsi96/nightwatch-cucumber?type=dev)
[![Twitter Follow](https://img.shields.io/twitter/follow/mucsi96.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/mucsi96)
[Ask question](https://groups.google.com/d/forum/nightwatch-cucumber)

[![NPM](https://nodei.co/npm-dl/nightwatch-cucumber.png?months=8)](https://nodei.co/npm/nightwatch-cucumber/)

This module enables to use a BDD-style approach for cross-browser testing:
- Describe user stories in [Cucumber](https://cucumber.io/) using [Gherkin syntax](https://cucumber.io/docs/reference)
- Map them to browser operations and assertions in [Nightwatch.js](http://nightwatchjs.org/)
- Run using either real browser, headless browser or cloud based [WebDriver](https://www.w3.org/TR/webdriver/) services such as [SauceLabs](https://saucelabs.com/) or [BrowserStack](https://www.browserstack.com/)

## Installation

### Step 1

First you need to have Nightwatch.js and Cucumber.js to be installed locally.

```
$ npm install --save-dev nightwatch cucumber
```

or shorter

```
$ npm i -D nightwatch cucumber
```

you can also install nightwatch globally

```
$ npm i -g nightwatch
```

If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

### Step 2

Install `nightwatch-cucumber`

```
$ npm install --save-dev nightwatch-cucumber
```

or shorter

```
$ npm i -D nightwatch-cucumber
```

### Step 3

In project root create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`. [More details](http://nightwatchjs.org/guide#settings-file) You don't need to specify `src_folders`.
```
// nightwatch.conf.js

module.exports = {
  ...
}
```

### Step 4

Require `nightwatch-cucumber` at the top of the configuration file.
```
// nightwatch.conf.js

require('nightwatch-cucumber')({
  nightwatchClientAsParameter: true,
  /* other configuration options */
})

module.exports = {
  ...
}
```
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

## Demo Test

By default feature files are located in `features` folder. You can change this using configuration object.

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

  this.Given(/^I open Google's search page$/, (client) => {
    client
      .url('http://google.com')
      .waitForElementVisible('body', 1000)
  })

  this.Then(/^the title is "([^"]*)"$/, (client, title) => {
    client.assert.title(title)
  })

  this.Then(/^the Google search form exists$/, (client) => {
    client.assert.visible('input[name="q"]')
  })

}
```

For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

## Running tests

You can run the test by executing

```
node_modules/.bin/nightwatch
```

or if you installed Nightwatch globally you can run test by executing

```
nightwatch
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-output.png)

## Features

### Step definition handling
In step definitions the Nightwatch api will be available as `this`. Step definitons which uses Nightwatch api should be synchronous! Please avoid using asynchronous (callback based, returning Promise, generators or async functions) steps or hooks with Nightwatch API as this will cause errors.

### Error handling

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-error-handling-output.png)

### Screenshots

You can enable screenshot generation on step failure using following Nightwatch configuration

```
module.exports = {
  test_settings: {
    default: {
      screenshots : {
        enabled : true,
        on_failure : true,
        path: 'screenshots/default'
      },
      ...
    }
  },
  ...
}
```

### HTML reports

HTML report generation is enabled by default. It's default location is `reports/cucumber.html`. You can disable or change this using configuration object.

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/cucumber-html-report.png)

Using the `openReport` option it is possible to make the report automatically open once test run finished.

### JUnit XML reports / Continuous Integration (CI)

JUnit XML report format is a standard offering across testing frameworks and Continuous Integration (CI) servers.
Using these reports the CI server can offer trend data over time to help determine the stability of your test suite.
Below you can see an example configuration for enabling JUnit XML report generation.

```
require('nightwatch-cucumber')({
  junitReport: {
    output: 'reports/junit.xml'
  },
  ...
})

module.exports = {
  ...
}
```

### Grunt support

For running test using [Grunt](http://gruntjs.com/) task runner you can use the following `Gruntfile.js` as template. [More details](http://nightwatchjs.org/guide#using-grunt)

```
// Gruntfile.js
const nightwatch = require('nightwatch')

module.exports = (grunt) => {
  grunt.initConfig({
    nightwatch: {
      'default': {
        argv: {}
      }
    }
  })

  nightwatch.initGrunt(grunt)

  grunt.registerTask('default', ['nightwatch'])
}
```

### Gulp support

For running test using [Gulp](http://gulpjs.com/) task runner you can use the following `gulpfile.js` as template. [More details](https://github.com/tatsuyafw/gulp-nightwatch)

```
// gulpfile.js
const gulp = require('gulp')
const nightwatch = require('gulp-nightwatch')

gulp.task('default', () => {
  return gulp.src('')
    .pipe(nightwatch({
      configFile: 'nightwatch.conf.js'
    }))
})
```

### Programmatical execution

You can execute tests using the following programmatical API

```
const nightwatch = require('nightwatch')

nightwatch.runner({
  _: [], // Run single feature file
  config: 'nightwatch.conf.js',
  env: 'default',
  filter: '',
  tag: ''
}, () => {
  console.log('done');
})
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

require('nightwatch-cucumber')({
  /* configuration */
})

module.exports = {
  page_objects_path: 'page-objects',
  ...
}
```

```
//page-objects/yahoo.js

module.exports = {
  url: 'http://yahoo.com',
  elements: {
    body: 'body',
    searchBar: 'input[name="p"]'
  }
}
```

Now we can use page objects from step definitions

```
//step-definitions/yahoo.js

module.exports = function() {

  this.Given(/^I open Yahoo's search page$/, function() {
    var yahoo = this.page.yahoo()

    yahoo
      .navigate()
      .waitForElementVisible('@body', 1000)
  })

  this.Then(/^the Yahoo search form exists$/, function() {
    var yahoo = this.page.yahoo()

    yahoo.assert.visible('@searchBar')
  })

}
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

### Scenario Tags

You can selectively run scenarios based on tags.
```
# google.feature

Feature: Google Search

@google @search
Scenario: Searching Google

  Given I open Google's search page
  Then the title is "Google"
  And the Google search form exists
```
```
$ node nightwatch.js --tag google
```
You can also skip scenarios based on tags
```
node nightwatch.js --skiptags google
```

### Parallel execution

For speeding up the execution of tests you can run them parallely. Here is an example Nightwatch configuration file. [More details](http://nightwatchjs.org/guide#via-workers).

```
// nightwatch.conf.js

require('nightwatch-cucumber')({
  ...
})

module.exports = {
  "test_workers": true,
  ...
}
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-parallel-test-output.png)

### Event Handlers

Event handlers can be provided using Cucumber.js support files. Support files are specified using `supportFiles` configuration option.
In that case Nightwatch API will be disabled.
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```
// nightwatch.conf.js

require('nightwatch-cucumber')({
  supportFiles: ['event-handlers.js']
})

module.exports = {
  ...
}
```

```
// event-handlers.js

module.exports = function () {
  this.registerHandler('BeforeFeatures', function (features) {
    // No callback provided. Nightwatch API is available here!
    this.click('.my-button');
  });

  this.registerHandler('BeforeFeatures', function (features, callback) {
    // Callback provided. Nightwatch API is disabled here!
    setTimeout(function() {
      callback();
    }, 1000);
  });
}

```

### Hooks

Hooks can be provided using Cucumber.js support files. Support files are specified using `supportFiles` configuration option.
Hooks can be defined without callback. In that case Nightwatch api will be available using `this`. Or can be defined with callback.
In that case Nightwatch API will be disabled.
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```
// nightwatch.conf.js

require('nightwatch-cucumber')({
  supportFiles: ['hooks.js']
})

module.exports = {
  ...
}
```

```
// hooks.js

module.exports = function () {
  this.Before(function (scenario, callback) {
    console.log('Before start');
    setTimeout(function() {
      console.log('Before end');
      callback();
    }, 1000);
  });

  this.After(function (scenario, callback) {
    console.log('After start');
    setTimeout(function() {
      console.log('After end');
      callback();
    }, 1000);
  });
}
```

## Configuration
The default configuration object is.
```
{
  featureFiles: ['features'],
  stepDefinitions: ['features/step_definitions'],
  supportFiles: [],
  jsonReport: 'reports/cucumber.json',
  htmlReport: 'reports/cucumber.html',
  openReport: false,
  stepTimeout: 30000,
  nightwatchClientAsParameter: false
}
```

Default configuration could be overwritten in the following way.
```
// nightwatch.conf.js

require('nightwatch-cucumber')({
  stepDefinitions: ['step_definitions']
})

module.exports = {
  ...
}
```

## Nightwatch client as parameter

Providing Nightwatch client as scope for step definitions is deprecated. The support could be removed in next version.
Please set `nightwatchClientAsParameter` configuration option to `true`. And use `client` as first argument of step definition functions.

```
this.Given(/^I open Google's search page$/, (client) => {
  client
    .url('http://google.com')
    .waitForElementVisible('body', 1000)
})

this.Then(/^the title is "([^"]*)"$/, (client, title) => {
  client.assert.title(title)
})
```

## Timeouts

You can use `stepTimeout` option to set timeout for steps.
By default, timeout is 30 seconds.

## Language

You can use different language in feature files. For setting the language you need to add language comment at the top of the feature file.

```
#language: pt

Funcionalidade: Pesquisa Google

Cenário: Pesquisando no Google

   Dado que eu abrir a página de pesquisa do Google
   Em seguida, o título é "Google"
   E o formulário de busca Google existe
```

# Contribute

Anyone and everyone is welcome to contribute.

# Authors

[Igor Muchychka (@mucsi96)](https://github.com/mucsi96)

Thanks for assistance and contributions:

[Igor Zalutski (@ZIJ)](https://github.com/ZIJ),
[Daniele Campogiani (@dcampogiani)](https://github.com/dcampogiani),
[Simranjeet Singh (@RSsimranjeetsingh)](https://github.com/RSsimranjeetsingh),
[Shashi Shekhar Singh (@singhshashi)](https://github.com/singhshashi),
Alex Murphy,
Ben Grabham,
[Jean-Baptiste Blanchet (@jbblanchet)](https://github.com/jbblanchet),
[Vincent Spiewak (@vspiewak)](https://github.com/vspiewak),
[Fabio Quinzi (@FabioQ)](https://github.com/FabioQ),
[Alfredo Moretta (@Alfredo81)](https://github.com/Alfredo81),
[Jeffrey Effendy (@jeffrey-effendy)](https://github.com/jeffrey-effendy)
[Lawrence (@ldabiralai)](https://github.com/ldabiralai)
[Domenico Gemoli (@aberonni)](https://github.com/aberonni)
[Klokov Anton (@klokovas)](https://github.com/klokovas)
[Arnaud gueras (@arnogues)](https://github.com/arnogues)
[Lukas Eipert (@leipert)](https://github.com/leipert)


# Change log

See [releases](https://github.com/mucsi96/nightwatch-cucumber/releases)

# License

This software is released under the terms of the
[MIT license](https://github.com/mucsi96/nightwatch-cucumber/blob/master/LICENSE).

# Other projects

* https://github.com/nightwatchjs/nightwatch
* https://github.com/cucumber/cucumber-js
