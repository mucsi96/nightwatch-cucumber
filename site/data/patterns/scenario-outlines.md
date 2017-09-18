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
