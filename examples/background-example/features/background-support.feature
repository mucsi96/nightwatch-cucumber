Feature: Background support

Background:
    Given I open Google`s search page

Scenario: Addition

  When I search for "500+120"
  Then the search result should contain "620"

Scenario: Division

  When I search for "36/6"
  Then the search result should contain "6"
