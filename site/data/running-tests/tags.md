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
