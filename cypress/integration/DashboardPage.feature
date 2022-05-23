Feature: Dashboard Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Dashboard Page" is open without connecting a wallet
    Then Dashboard page is open when users wallet is not connected
