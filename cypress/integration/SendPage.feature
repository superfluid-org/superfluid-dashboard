Feature: Send Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Send Page" is open without connecting a wallet
    And User fills all stream inputs
    And Stream ending on and amount per second is shown correctly
    And Stream preview is shown correctly
    And User accepts the risk warning
    Then Send button is enabled and asks user to Connect their wallet

  Scenario: Receiver dialog recents and ENS support
    Given "Send Page" is open with a mocked connection to "staticBalanceAccount" on "matic"
    And User opens the receiver dialog
    Then The recent receivers are shown on "matic"
    And User closes the receiver dialog
    Then The receiver dialog is not visible
    And User opens the receiver dialog
    Then And user selects the first recent receiver
    Then The receiver address is shown as the chosen receiver in the send stream page
    And User searches for "vijay.eth" as a receiver
    Then "0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac" is visible in the ENS recipient results
    And User selects the first ENS recipient result
    Then Chosen ENS receiver wallet address shows vijay.eth and 0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac
    And User clears the receiver field with the close button

  Scenario: Super token selection , balances and wrap buttons
    Given "Send" is open with a mocked connection to "staticBalanceAccount" on "matic"
    And User opens the token selection screen
    Then Super token balances are shown correctly for "staticBalanceAccount" on "matic"
    And All of the tokens shown have an animation around them
    And The user clicks on the "token" wrap button
    Then The user is redirected to the wrap page and "token" is selected
    And User selects "token" as the super token to use for the stream
    Then Token balance is shown correctly in the send stream page with a wrap button next to it
    And User clicks on the wrap button in the send stream page
    Then The user is redirected to the wrap page and "token" is selected
    And User clicks on the "send" navigation button
    And User opens the token selection screen
    And "token" does not have a wrap button next to the balance
    And User selects "token" as the super token to use for the stream
    Then Token balance is shown correctly in the send stream page without a wrap button next to it

    Scenario: Searching for a token in the token selection screen
      Given "Send" is open with a mocked connection to "staticBalanceAccount" on "matic"
        And User opens the token selection screen
        And User searches for "token" in the select token search field
        Then The "token" is only shown as a token search result
        And User searches for "token" in the select token search field
        Then The could not find any tokens message is shown

      Scenario: Changing stream time units
        Given "Send Page" is open without connecting a wallet
        And User fills all stream inputs
        And User changes the time unit to "minute"
        Then stream amounts per second and preview buffer values are shown correctly for a "minute" timeframe
        And User changes the time unit to "hour"
        Then stream amounts per second and preview buffer values are shown correctly for a "hour" timeframe
        And User changes the time unit to "day"
        Then stream amounts per second and preview buffer values are shown correctly for a "day" timeframe
        And User changes the time unit to "month"
        Then stream amounts per second and preview buffer values are shown correctly for a "month" timeframe
        And User changes the time unit to "second"
        Then stream amounts per second and preview buffer values are shown correctly for a "second" timeframe

      Scenario: Wrong network warnings in the send page


      Scenario: View mode warnings in send page