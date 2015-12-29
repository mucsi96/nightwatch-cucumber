![alt-tag](https://raw.githubusercontent.com/mucsi96/nightwatch-cucumber/master/img/nightwatch-cucumber.png)

# nightwatch-cucumber

Demonstartion project for [Cucumber.js](https://github.com/cucumber/cucumber-js) and [Nightwatch.js](http://nightwatchjs.org/) integration. This demonstrates how to use a BDD-style approach for crossbrowser testing:
- Describe user stories in Cucumber
- Map them to HTML/DOM operations in Nightwatchjs
- Run using either local Selenium driver or cloud based webdriverJs services such as SauceLabs or BrowserStack

## Installation

```
$ git clone git@github.com:mucsi96/nightwatch-cucumber.git
$ cd nightwatch-cucumber
$ npm install
```

## Running

```
$ node nightwatch.js
```

## Sample feature file

```
Feature: Google Search

Scenario: Searching Google

    Given I open Google's search page
    Then the title is "Google"
    And the Google search form exists

Scenario: Searching Google again

    Given I open Google's search page
    Then the title is "Google"
    And the Google search form exists

```

## Sample step definition file
All step definitions will run with this set to Nightwatch.js client or browser object

```
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

## Features

### Feature Tags
You can selectively run features based on tags. [More details ](http://nightwatchjs.org/guide#test-tags)
```
// google.feature

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
