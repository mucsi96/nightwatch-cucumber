Feature: Yahoo Search

Scenario: Searching Yahoo

  Given I open Yahoo`s search page
  Then the title is "Yahoo"
  And the Yahoo search form exists
