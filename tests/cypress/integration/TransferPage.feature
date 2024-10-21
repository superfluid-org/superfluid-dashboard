Feature: Transfer Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Transfer Page" is open without connecting a wallet
    And User fills all transfer inputs "without" a wallet connected
    Then Transfer button is enabled and asks user to Connect their wallet

  Scenario: Wrap button shown to a user who hasn't enough tokens to transfer
    Given "Transfer Page" is open with "staticBalanceAccount" connected on "polygon"
    And User fills all transfer inputs "with" a wallet connected
    Then Token balance is shown correctly in the transfer page with a wrap button next to it
    Then User clicks on the wrap button in the transfer page

    Given "Wrap Page" is open with "staticBalanceAccount" connected on "polygon"
