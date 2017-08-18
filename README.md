# nightwatch-cucumber [![nightwatch-cucumber](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-logo.png)](https://github.com/mucsi96/nightwatch-cucumber)

[![npm version](https://badge.fury.io/js/nightwatch-cucumber.svg)](https://badge.fury.io/js/nightwatch-cucumber)
[![Build Status](https://travis-ci.org/mucsi96/nightwatch-cucumber.svg?branch=master)](https://travis-ci.org/mucsi96/nightwatch-cucumber)
[![All Contributors](https://img.shields.io/badge/all_contributors-22-orange.svg?style=flat-square)](#contributors)
[![Coverage Status](https://coveralls.io/repos/github/mucsi96/nightwatch-cucumber/badge.svg?branch=master)](https://coveralls.io/github/mucsi96/nightwatch-cucumber?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/mucsi96/nightwatch-cucumber.svg)](https://greenkeeper.io/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependency Status](https://dependencyci.com/github/mucsi96/nightwatch-cucumber/badge)](https://dependencyci.com/github/mucsi96/nightwatch-cucumber)
[![Twitter Follow](https://img.shields.io/twitter/follow/mucsi96.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/mucsi96)
[Ask question](https://stackoverflow.com/questions/tagged/nightwatch.js+cucumber)

This module enables to use a BDD-style approach for cross-browser testing:
- Describe user stories in [Cucumber](https://cucumber.io/) using [Gherkin syntax](https://cucumber.io/docs/reference)
- Map them to browser operations and assertions in [Nightwatch.js](http://nightwatchjs.org/)
- Run using either real browser, headless browser or cloud based [WebDriver](https://www.w3.org/TR/webdriver/) services such as [SauceLabs](https://saucelabs.com/) or [BrowserStack](https://www.browserstack.com/)

## New Release 7.0.0

Please note that a lot of new syntax changes are introduced. For all changes please read the ([readme diff](https://github.com/mucsi96/nightwatch-cucumber/compare/v6.1.1...v7.0.2#diff-04c6e90faac2675aa89e2176d2eec7d8 )).

#### Breaking Changes

* latest cucumber 2 support
* promised based external nightwatch client
* html report generation now can be done using external package ([cucumber-html-reporter](https://github.com/gkushang/cucumber-html-reporter))
* junit reporting generation now can be done using external package ([cucumber-junit](https://github.com/stjohnjohnson/cucumber-junit))
* almost all configuration options removed in favour of `cucumberArgs` which brings the package closes to Cucumber.js
* Node.js version < 6 is dropped.

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
```js
// nightwatch.conf.js

module.exports = {
  ...
}
```

### Step 4

Require `nightwatch-cucumber` at the top of the configuration file.
```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* other configuration options */
})

module.exports = {
  ...
}
```
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

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

```js
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

For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

## Running tests

You can run the test by executing

```
node_modules/.bin/nightwatch
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-output.png)

## Features

### Babel support

You can write tests using latest ECMAScript features using [Babel](https://babeljs.io/). Using `async` function is especially useful.
For that you need install `babel-core`, setup `.babelrc` and add Babel as compiler
```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: ['--compiler', 'js:babel-core/register', '--require', 'features/step_definitions', 'features']
})
...
```

```js
// features/step_definitions/google.js

import { client } from 'nightwatch-cucumber';
import { defineSupportCode } from 'cucumber';

defineSupportCode(({ Given, Then, When }) => {
  Given(/^I open Google's search page$/, async () => {
    await client.url('http://google.com')
    await client.waitForElementVisible('body', 1000);
  });

  Then(/^the title is "([^"]*)"$/, async (title) => {
    await client.assert.title(title);
  });

  Then(/^the Google search form exists$/, async () => {
    await client.assert.visible('input[name="q"]');
  });

});
```

For complete working example check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples/babel-example)



### Passing additional CLI options for Cucumber.js.

For that you can use the `cucumberArgs` configuration property. For available Cucumber.js CLI options see the [Cucumber.js docs](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md)

```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'hooks.js',
    '--require', 'features/step_definitions',
    '--format', 'progress',
    '--format', 'json:reports/cucumber.json',
    '--format-options', '{"colorsEnabled":false}',
    'features'
  ]
})

module.exports = {
  ...
}
```

### Step definition handling
Step definitons which uses Nightwatch client should return the result of api call as it returns a Promise. Please note that this behaviour is different from plain Nightwatch client API.

### Error handling

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-error-handling-output.png)

### Screenshots

You can enable screenshot generation on step failure using following Nightwatch configuration

```js
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

You can create HTML reports using [cucumber-html-reporter](https://www.npmjs.com/package/cucumber-html-reporter)
As input you need to provide a Cucumber JSON report generated by this package.

![alt-tag](https://raw.githubusercontent.com/gkushang/cucumber-html-reporter/master/samples/html_report_snapshots/cucumber_report_bootstrap_snapshot.png)

### JUnit XML reports

You can create JUnit XML reports using [cucumber-junit](https://github.com/stjohnjohnson/cucumber-junit)
As input you need to provide a Cucumber JSON report generated by this package.

### Grunt support

For running test using [Grunt](http://gruntjs.com/) task runner you can use the following `Gruntfile.js` as template. [More details](http://nightwatchjs.org/guide#using-grunt)

```js
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

```js
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

```js
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

```gherkin
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

```gherkin
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
For making your tests more readable and maintainable you can use the Page Object pattern. Nightwatch reads the page objects from the folder (or folders) specified in the `page_objects_path` configuration property. [More details](http://nightwatchjs.org/guide#page-objects). Add the following line to Nightwatch.js configuration file.

```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* configuration */
})

module.exports = {
  page_objects_path: 'page-objects',
  ...
}
```

```js
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

```js
//step-definitions/yahoo.js

const {client} = require('nightwatch-cucumber');
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Given, Then, When}) => {
  Given(/^I open Yahoo's search page$/, () => {
    const yahoo = client.page.yahoo();

    return yahoo
      .navigate()
      .waitForElementVisible('@body', 1000);
  });

  Then(/^the Yahoo search form exists$/, () => {
    const yahoo = client.page.yahoo();

    return yahoo.assert.visible('@searchBar');
  });

});
```

### Feature Groups

You can selectively run features based on groups. To group features together just place them in the same sub-folder. The folder name is the name of the group.
You can use Nightwatch CLI `--group`, `--skipgroup` flags. [More details ](http://nightwatchjs.org/guide#test-groups)

### Feature and Scenario Tags

You can selectively run features and scenarios based on tags. [More details ](http://nightwatchjs.org/guide#test-tags)
```gherkin
# google.feature

@google
Feature: Google Search

@search
Scenario: Searching Google

  Given I open Google's search page
  Then the title is "Google"
  And the Google search form exists
```
```
$ node nightwatch.js --tag google
```
or for more matches
```
$ node nightwatch.js --tag google --tag yahoo
```
You can also skip features based on tags
```
node nightwatch.js --skiptags google
```
or for skipping multiple tags
```
node nightwatch.js --skiptags google,yahoo
```
and all together :)
```
node nightwatch.js --tag google --tag yahoo --skiptags search,login
```

### Parallel execution

For speeding up the execution of tests you can run them parallely. Here is an example Nightwatch configuration file. [More details](http://nightwatchjs.org/guide#via-workers).

```js
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
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'event-handlers.js'
    '--require', 'features/step_definitions',
    '--format', 'pretty',
    '--format', 'json:reports/cucumber.json',
    'features'
  ]
})

module.exports = {
  ...
}
```

```js
// event-handlers.js
const {client} = require('nightwatch-cucumber');
const {defineSupportCode} = require('cucumber');

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', function (features) {
    return client.click('.my-button');
  });

  registerHandler('BeforeFeatures', function (features, callback) {
    setTimeout(function() {
      callback();
    }, 1000);
  });
}

```

### Hooks

Hooks can be provided using Cucumber.js support files. Support files are specified using `supportFiles` configuration option.
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'hooks.js',
    '--require', 'features/step_definitions',
    '--format', 'pretty',
    '--format', 'json:reports/cucumber.json',
    'features'
  ]
})

module.exports = {
  ...
}
```

```js
// hooks.js
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Before, After}) => {
  Before((scenario, callback) => {
    console.log('Before start');
    setTimeout(() => {
      console.log('Before end');
      callback();
    }, 1000);
  });

  After((scenario, callback) => {
    console.log('After start');
    setTimeout(() => {
      console.log('After end');
      callback();
    }, 1000);
  });
})
```

## Configuration
The default configuration object is.
```js
{
  cucumberArgs: [
    '--require', 'features/step_definitions',
    '--format', 'pretty',
    '--format', 'json:reports/cucumber.json',
    'features'
  ]
}
```

Default configuration could be overwritten in the following way.
```js
// nightwatch.conf.js

require('nightwatch-cucumber')({
    cucumberArgs: [
      '--require', 'step_definitions',
      '--format', 'pretty',
      '--format', 'json:reports/cucumber.json',
      'features'
    ]
})

module.exports = {
  ...
}
```

## Timeouts

You can use `setDefaultTimeout` function in support code to set default timeout for steps.
By default, timeout is 5 seconds. You can find more details in Cucumber.js [docs](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/timeouts.md)

```js
const {defineSupportCode} = require('cucumber')

defineSupportCode(({setDefaultTimeout}) => {
  setDefaultTimeout(30 * 1000)
})
```

## Language

You can use different language in feature files. For setting the language you need to add language comment at the top of the feature file.

```gherkin
#language: pt

Funcionalidade: Pesquisa Google

Cenário: Pesquisando no Google

   Dado que eu abrir a página de pesquisa do Google
   Em seguida, o título é "Google"
   E o formulário de busca Google existe
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/3163392?v=3" width="100px;"/><br /><sub>Igor Muchychka</sub>](https://twitter.com/mucsi96)<br /> | [<img src="https://avatars.githubusercontent.com/u/1280498?v=3" width="100px;"/><br /><sub>Igor Zalutski</sub>](izalutski.consulting)<br /> | [<img src="https://avatars.githubusercontent.com/u/1054526?v=3" width="100px;"/><br /><sub>Daniele Campogiani</sub>](http://danielecampogiani.com)<br /> | [<img src="https://avatars.githubusercontent.com/u/15341713?v=3" width="100px;"/><br /><sub>Simranjeet Singh</sub>](https://github.com/RSsimranjeetsingh)<br /> | [<img src="https://avatars.githubusercontent.com/u/371601?v=3" width="100px;"/><br /><sub>Shashi Shekhar Singh</sub>](http://blog.singhshashi.in)<br /> | [<img src="https://avatars.githubusercontent.com/u/2847338?v=3" width="100px;"/><br /><sub>jbblanchet</sub>](https://github.com/jbblanchet)<br /> | [<img src="https://avatars.githubusercontent.com/u/2108652?v=3" width="100px;"/><br /><sub>Vincent Spiewak</sub>](https://github.com/vspiewak)<br /> |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars.githubusercontent.com/u/7160445?v=3" width="100px;"/><br /><sub>Fabio Quinzi</sub>](http://fabioquinzi.com)<br /> | [<img src="https://avatars.githubusercontent.com/u/7831710?v=3" width="100px;"/><br /><sub>Jeffrey Effendy</sub>](https://github.com/jeffrey-effendy)<br /> | [<img src="https://avatars.githubusercontent.com/u/1711610?v=3" width="100px;"/><br /><sub>Lawrence</sub>](http://ldabiralai.me)<br /> | [<img src="https://avatars.githubusercontent.com/u/1260402?v=3" width="100px;"/><br /><sub>Domenico Gemoli</sub>](http://domenicogemoli.com)<br /> | [<img src="https://avatars.githubusercontent.com/u/8973021?v=3" width="100px;"/><br /><sub>Klokov Anton</sub>](https://github.com/klokovas)<br /> | [<img src="https://avatars.githubusercontent.com/u/2287663?v=3" width="100px;"/><br /><sub>Arnaud gueras</sub>](https://github.com/arnogues)<br /> | [<img src="https://avatars.githubusercontent.com/u/2906107?v=3" width="100px;"/><br /><sub>Lukas Eipert</sub>](http://leipert.io)<br /> |
| [<img src="https://avatars.githubusercontent.com/u/4364107?v=3" width="100px;"/><br /><sub>Paulo</sub>](http://madrov.com)<br /> | [<img src="https://avatars.githubusercontent.com/u/6282473?v=3" width="100px;"/><br /><sub>Tylor Steinberger</sub>](https://github.com/TylorS)<br /> | [<img src="https://avatars.githubusercontent.com/u/1476974?v=3" width="100px;"/><br /><sub>Eric Chan</sub>](https://github.com/kinyat)<br /> | [<img src="https://avatars.githubusercontent.com/u/1476502?v=3" width="100px;"/><br /><sub>Mykolas</sub>](http://www.myk.lt)<br /> | [<img src="https://avatars.githubusercontent.com/u/5993909?v=3" width="100px;"/><br /><sub>Jon Wallsten</sub>](https://github.com/JonWallsten)<br /> | [<img src="https://avatars2.githubusercontent.com/u/6979207?v=3" width="100px;"/><br /><sub>Julien Viala</sub>](https://github.com/mr-wildcard)<br /> | [<img src="https://avatars3.githubusercontent.com/u/2751776?v=3" width="100px;"/><br /><sub>dmerc</sub>](https://github.com/dmerc)<br /> |
| [<img src="https://avatars1.githubusercontent.com/u/6475033?v=4" width="100px;"/><br /><sub>Millenium</sub>](https://github.com/erikmellum)<br /> |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Change log

See [releases](https://github.com/mucsi96/nightwatch-cucumber/releases)

## License

This software is released under the terms of the
[MIT license](https://github.com/mucsi96/nightwatch-cucumber/blob/master/LICENSE).

## Other projects

* https://github.com/nightwatchjs/nightwatch
* https://github.com/cucumber/cucumber-js
* https://github.com/gkushang/cucumber-html-reporter
* https://github.com/stjohnjohnson/cucumber-junit
