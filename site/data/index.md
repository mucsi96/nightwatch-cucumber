# Getting Started

### Step 1

First you need to have Nightwatch.js and Cucumber.js to be installed locally.

```bash
$ npm install --save-dev nightwatch cucumber
```

or shorter

```bash
$ npm i -D nightwatch cucumber
```

If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

### Step 2

Install `nightwatch-cucumber`

```bash
$ npm install --save-dev nightwatch-cucumber
```

or shorter

```bash
$ npm i -D nightwatch-cucumber
```

### Step 3

In project root create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`. [More details](http://nightwatchjs.org/guide#settings-file) You don't need to specify `src_folders`.
```javascript
// nightwatch.conf.js

module.exports = {
  ...
}
```

### Step 4

Require `nightwatch-cucumber` at the top of the configuration file.
```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* other configuration options */
})

module.exports = {
  ...
}
```
For more examples check out the [example repository](https://github.com/mucsi96/nightwatch-cucumber-example) or the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

# Demo Test

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

# Running tests

You can run the test by executing

```bash
node_modules/.bin/nightwatch
```

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-output.png)

# Features

## Supported Nightwatch command line options

| Name             | Shortname | Supported          | Default              | Description                                                                                                  |
|:----------------:|:---------:|:------------------:|:--------------------:|:-------------------------------------------------------------------------------------------------------------|
| `--config`       | 	`-c`     | ✅ | ./nightwatch.conf.js | The location of the nightwatch.conf.js file - the configuration file which the Nightwatch uses and which also includes the Selenium WebDriver options. |
| `--output`       |	`-o`     | ⛔ |                      |	tests_output	The location where the JUnit XML reports will be saved. Use CucumberJS [`--format <TYPE[:PATH]>`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) instead |
| `--reporter`     | `-r`      | ⛔ | junit                |	Name of a predefined reporter (e.g. junit) or path to a custom reporter file to use. Use CucumberJS [`--format <TYPE[:PATH]>`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) instead |
| `--env`          |	`-e`     | ✅ |	default              |	Which testing environment to use - defined in nightwatch.conf.js |
| `--verbose`      |           | ✅ |                      | Shows extended selenium command logging during the session |
| `--version`      |	`-v`     | ✅ |                      |	Shows the version number |
| `--test`         |	`-t`     | 🚧 |	                     |	Runs only the specified test suite/module. By default the runner will attempt to run all tests in the src_folders settings folder(s) and their subfolders. |
| `--testcase`     |           | 🚧 |	                     |	Used only together with --test. Runs the specified testcase from the current suite/module. |
| `--group`        | `-g`      | ✅ |                      |	Runs only the specified group of tests (subfolder). Tests are grouped by being placed in the same subfolder. |
| `--skipgroup`    | `-s`      | ✅ |                      |	Skip one or several (comma separated) group of tests. |
| `--filter`       | 	`-f`     | 🚧 |	                     |	Specify a filter (glob expression) as the file name format to use when loading the test files. |
| `--tag`          | `-a`      | ✅ |                      |	Filter test modules by tags. Only tests that have the specified tags will be loaded. |
| `--skiptags`     |           | ✅ |                      |	Skips tests that have the specified tag or tags (comma separated). |
| `--retries`      |           | 🚧 |                      | Retries failed or errored testcases up to the specified number of times. Retrying a testcase will also retry the beforeEach and afterEach hooks, if any. |
| `--suiteRetries` |           | ⛔ |                      |	Retries failed or errored testsuites (test modules) up to the specified number of times. Retrying a testsuite will also retry the before and after hooks (in addition to the global beforeEach and afterEach respectively), if any are defined on the testsuite. |

## Babel support

You can write tests using latest ECMAScript features using [Babel](https://babeljs.io/). Using `async` function is especially useful.
For that you need install `babel-core`, setup `.babelrc` and add Babel as compiler
```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: ['--compiler', 'js:babel-core/register', '--require', 'features/step_definitions', 'features']
})
...
```

```javascript
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



## Passing additional CLI options for Cucumber.js.

For that you can use the `cucumberArgs` configuration property. For available Cucumber.js CLI options see the [Cucumber.js docs](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md)

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'hooks.js',
    '--require', 'features/step_definitions',
    '--format', 'json:reports/cucumber.json',
    '--format-options', '{"colorsEnabled":false}',
    'features'
  ]
})

module.exports = {
  ...
}
```

## Step definition handling
Step definitons which uses Nightwatch client should return the result of api call as it returns a Promise. Please note that this behaviour is different from plain Nightwatch client API.

## Error handling

![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber-error-handling-output.png)

## Screenshots

You can enable screenshot generation on step failure using following Nightwatch configuration

```javascript
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

## HTML reports

You can create HTML reports using [cucumber-html-reporter](https://www.npmjs.com/package/cucumber-html-reporter)
As input you need to provide a Cucumber JSON report generated by this package. You have to run the report generation in a separate NodeJs process. For example if you are using NPM scripts and you execute the end-to-end test using `npm test` then hookup the HTML report generation under `posttest` NPM script. An example `package.json` could be the following.

```json
{
  ...
  "test": "nightwatch",
  "posttest": "node create-html-report.js",
  ...
}
```

![alt-tag](https://raw.githubusercontent.com/gkushang/cucumber-html-reporter/master/samples/html_report_snapshots/cucumber_report_bootstrap_snapshot.png)

## JUnit XML reports

You can create JUnit XML reports using [cucumber-junit](https://github.com/stjohnjohnson/cucumber-junit)
As input you need to provide a Cucumber JSON report generated by this package.

## Grunt support

For running test using [Grunt](http://gruntjs.com/) task runner you can use the following `Gruntfile.js` as template. [More details](http://nightwatchjs.org/guide#using-grunt)

```javascript
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

## Gulp support

For running test using [Gulp](http://gulpjs.com/) task runner you can use the following `gulpfile.js` as template. [More details](https://github.com/tatsuyafw/gulp-nightwatch)

```javascript
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

## Programmatical execution

You can execute tests using the following programmatical API

```javascript
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

## Feature background
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

## Scenario Outlines

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

## Page Objects
For making your tests more readable and maintainable you can use the Page Object pattern. Nightwatch reads the page objects from the folder (or folders) specified in the `page_objects_path` configuration property. [More details](http://nightwatchjs.org/guide#page-objects). Add the following line to Nightwatch.js configuration file.

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* configuration */
})

module.exports = {
  page_objects_path: 'page-objects',
  ...
}
```

```javascript
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

```javascript
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

## Feature Groups

You can selectively run features based on groups. To group features together just place them in the same sub-folder. The folder name is the name of the group.
You can use Nightwatch CLI `--group`, `--skipgroup` flags. [More details ](http://nightwatchjs.org/guide#test-groups)

## Feature and Scenario Tags

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
```bash
$ node nightwatch.js --tag google
```
or for more matches
```bash
$ node nightwatch.js --tag google --tag yahoo
```
You can also skip features based on tags
```bash
node nightwatch.js --skiptags google
```
or for skipping multiple tags
```bash
node nightwatch.js --skiptags google,yahoo
```
and all together :)
```bash
node nightwatch.js --tag google --tag yahoo --skiptags search,login
```

## Parallel execution

For speeding up the execution of tests you can run them parallely. Here is an example Nightwatch configuration file. [More details](http://nightwatchjs.org/guide#via-workers).

```javascript
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

## Hooks

Hooks can be provided using Cucumber.js support files. Support files are specified using `supportFiles` configuration option.
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```javascript
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

```javascript
// hooks.js
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Before, After}) => {
  Before(() => new Promise(resolve => {
    console.log('Before start');
    setTimeout(() => {
      console.log('Before end');
      resolve();
    }, 1000);
  }));

  After(() => new Promise(resolve => {
    console.log('After start');
    setTimeout(() => {
      console.log('After end');
      resolve();
    }, 1000);
  }));
})
```

# Configuration
The default configuration object is.
```javascript
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
```javascript
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

# Timeouts

The Cucumber timeouts are disabled entirely. So for timeouts you can use only Nightwatch [`request_timeout_options`](http://nightwatchjs.org/gettingstarted/#full-list-of-settings).

# Language

You can use different language in feature files. For setting the language you need to add language comment at the top of the feature file.

```gherkin
#language: pt

Funcionalidade: Pesquisa Google

Cenário: Pesquisando no Google

   Dado que eu abrir a página de pesquisa do Google
   Em seguida, o título é "Google"
   E o formulário de busca Google existe
```

# Contributors

Contributions of any kind welcome! Thanks goes to these wonderful people:

[[contributors]]

# Change log

See [releases](https://github.com/mucsi96/nightwatch-cucumber/releases)

# License

This software is released under the terms of the
[MIT license](https://github.com/mucsi96/nightwatch-cucumber/blob/master/LICENSE).

# Related projects

* [NightwatchJS](https://github.com/nightwatchjs/nightwatch)
* [CucumberJS](https://github.com/cucumber/cucumber-js)
* [cucumber-html-reporter](https://github.com/gkushang/cucumber-html-reporter)
* [cucumber-junit](https://github.com/stjohnjohnson/cucumber-junit)

[[toc]]
