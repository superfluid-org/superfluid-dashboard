Feature: Transfer Page test cases

  Scenario: Connect Wallet button is shown to a user who doesn't have their wallet connected
    Given "Transfer Page" is open without connecting a wallet
    And User fills all transfer inputs "without" a wallet connected
    Then Transfer button is enabled and asks user to Connect their wallet

  Scenario: Searching for a token in the token selection screen
    Given "Transfer Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the token selection screen
    And User searches for "POL" in the select token search field
    Then The "POL" is only shown as a token search result
    And User clears the token search field
    And User searches for "POL" in the select token search field
    Then The "POL" is only shown as a token search result
    And User clears the token search field
    And User searches for "YOLO420" in the select token search field
    Then The could not find any tokens message is shown

  Scenario: Wrong network warnings in the transfer page
    Given "Transfer Page" is open with "staticBalanceAccount" connected on "polygon"
    And User changes their network to "gnosis"
    And Change network button is visible with a message asking user to switch to "gnosis"

  Scenario: Error message is shown to a user who is trying to send a transfer to himself
    Given "Transfer Page" is open with "staticBalanceAccount" connected on "polygon"
    And User fills all transfer inputs "with" a wallet connected
    Then Validate "You can't send to yourself." error

  Scenario: Error message is shown to a user who doesn't have enough tokens to transfer
    Given "Transfer Page" is open with "john" connected on "polygon"
    And User fills all transfer inputs "with" a wallet connected
    Then Validate "You don't have enough balance for the transfer." error
