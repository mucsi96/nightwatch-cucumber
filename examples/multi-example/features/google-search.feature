Feature: Google Search

Scenario: Searching Google

  Given I open Google`s search page
  Then the title is "Google"
  And the Google search form exists

Scenario: Searching Google again

  Given I open Google`s search page
  Then the title is "Google"
  And the Google search form exists
