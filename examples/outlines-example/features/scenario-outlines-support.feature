Feature: Scenario outlines support

Scenario Outline: Searching Google

  Given I open Google`s search page
  When I search for <expression>
  Then the search result should contain <result>

  Examples:
    | expression | result |
    | 36/6       | 6      |
    | 500+120    | 620    |
