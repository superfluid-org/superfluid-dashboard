Feature: Wrap page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Wrap Page" is open without connecting a wallet
    And The upgrade button is disabled
    And User inputs "1" into the wrap field
    Then The upgrade button is enabled and asks user to connect a wallet
    And User switches to unwrap tab
    And The downgrade button is disabled
    And User inputs "1" into the unwrap field
    Then The downgrade button is enabled and asks user to connect a wallet
    And User switches to wrap tab
    Then Wrap/Unwrap page is open and the wrap container is visible

