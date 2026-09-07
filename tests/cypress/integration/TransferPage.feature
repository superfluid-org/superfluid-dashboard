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

  # Load-bearing and otherwise invisible: `john` (0x46Bdc58eDF8837841A1eBb944e0cb53afCf627d2)
  # must hold NO TDLx on polygon -- that empty balance is the whole point of this scenario.
  # Do not fund it when topping up the test wallets; use a different token if you need to.
  # The token is named explicitly rather than taken off the top of the balance-sorted list
  # (as the scenario above does): picking the best-funded token made this test depend on that
  # balance staying under 1, and a funding run that pushed it to exactly 1 turned it green-
  # to-red. A zero balance is an invariant someone can keep; a magic amount is not.
  # TDLx is spelled out instead of going through rejectedCaseTokens.json's TokenThree alias
  # because this scenario pins polygon while the fixture resolves against the matrix network.
  Scenario: Error message is shown to a user who doesn't have enough tokens to transfer
    Given "Transfer Page" is open with "john" connected on "polygon"
    And User fills all transfer inputs with "TDLx" and amount "1"
    Then The selected token balance in the transfer page is zero
    And Validate "You don't have enough balance for the transfer." error
