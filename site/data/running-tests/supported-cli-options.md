## Supported Nightwatch command line options

| Name             | Shortname | Supported          | Default              | Description                                                                                                  |
|:----------------:|:---------:|:------------------:|:--------------------:|:-------------------------------------------------------------------------------------------------------------|
| `--config`       | 	`-c`     | ✅ | ./nightwatch.conf.js | The location of the nightwatch.conf.js file - the configuration file which the Nightwatch uses and which also includes the Selenium WebDriver options. |
| `--output`       |	`-o`     | ⛔ |                      |	tests_output	The location where the JUnit XML reports will be saved. Use CucumberJS [`--format <TYPE[:PATH]>`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) instead |
| `--reporter`     | `-r`      | ⛔ | junit                |	Name of a predefined reporter (e.g. junit) or path to a custom reporter file to use. Use CucumberJS [`--format <TYPE[:PATH]>`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) instead |
| `--env`          |	`-e`     | ✅ |	default              |	Which testing environment to use - defined in nightwatch.conf.js |
| `--verbose`      |           | ✅ |                      | Shows extended selenium command logging during the session |
| `--version`      |	`-v`     | ✅ |                      |	Shows the version number |
| `--test`         |	`-t`     | ✅ |	                     |	Runs only the specified feature file. By default the runner will attempt to run all feature files. |
| `--testcase`     |           | ⛔ |	                    |	Used only together with --test. Runs the specified testcase from the current suite/module. |
| `--group`        | `-g`      | ✅ |                      |	Runs only the specified group of tests (subfolder). Tests are grouped by being placed in the same subfolder. |
| `--skipgroup`    | `-s`      | ✅ |                      |	Skip one or several (comma separated) group of tests. |
| `--filter`       | 	`-f`     | 🚧 |	                     |	Specify a filter (glob expression) as the file name format to use when loading the test files. |
| `--tag`          | `-a`      | ✅ |                      |	Filter test modules by tags. Only tests that have the specified tags will be loaded. |
| `--skiptags`     |           | ✅ |                      |	Skips tests that have the specified tag or tags (comma separated). |
| `--retries`      |           | 🚧 |                      | Retries failed or errored testcases up to the specified number of times. Retrying a testcase will also retry the beforeEach and afterEach hooks, if any. |
| `--suiteRetries` |           | ⛔ |                      |	Retries failed or errored testsuites (test modules) up to the specified number of times. Retrying a testsuite will also retry the before and after hooks (in addition to the global beforeEach and afterEach respectively), if any are defined on the testsuite. |
