Feature: Ecosystem page tests

  Scenario: Ecosystem page showing all the awesome projects
    Given "Ecosystem Page" is open without connecting a wallet
    Then Projects that are "built on superfluid" are shown
    And Projects that are "have integrated superfluid" are shown
    And Projects that are "supporting super tokens" are shown
    And Add an app button is visible