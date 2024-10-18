Feature: Transfer Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Transfer Page" is open without connecting a wallet
    And User fills all transfer inputs "without" a wallet connected
    Then Transfer button is enabled and asks user to Connect their wallet
