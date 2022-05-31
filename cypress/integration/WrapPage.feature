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

    Scenario: Token balances shown for a user with a connected wallet
      Given "Wrap Page" is open with a mocked connection to "staticBalanceAccount" on "matic"
      Then The native token balance is shown correctly on "matic"
      And User opens the token selection in the wrap page
      Then The underlying token balances in the wrap token dialog are shown correctly on "matic"
      And None of the tokens shown have got an animation around them
      And User chooses "token" to wrap
      Then The token values are updated correctly for "token" on wrap page
      And User switches to unwrap tab
      And User opens the token selection in the unwrap page
      Then The super token balances in the unwrap token dialog are shown correctly on "matic"
      And All tokens have an animation around them
      And User chooses "token" to unwrap
      Then The token values are updated correctly for "token" on unwrap page

      Scenario: Searching for a token in the token selection dialog and closing it
        Given "Wrap Page" is open with a mocked connection to "staticBalanceAccount" on "matic"
        And User opens the token selection in the wrap page
        And User searches for "token" in the token selection dialog
        Then The token selection dialog shows only "token"
        And User searches for "not existing token" in the token selection dialog
        Then The token selection dialog shows no results
        And User switches to unwrap tab
        And User opens the token selection in the unwrap page
        And User searches for "token" in the token selection dialog
        Then The token selection dialog shows only "token"
        And User searches for "not existing token" in the token selection dialog
        Then The token selection dialog shows no results
        And User closes the token selection dialog
        Then The token selection dialog is not visible

  Scenario: Wrong network warnings in the wrap page

  Scenario: View mode warnings in wrap page