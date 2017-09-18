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
npm run e2e-test -- --tag google
```
or for more matches
```bash
npm run e2e-test -- --tag google --tag yahoo
```
You can also skip features based on tags
```bash
npm run e2e-test -- --skiptags google
```
or for skipping multiple tags
```bash
npm run e2e-test -- --skiptags google,yahoo
```
and all together :)
```bash
npm run e2e-test -- --tag google --tag yahoo --skiptags search,login
```
