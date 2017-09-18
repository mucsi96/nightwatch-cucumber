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
