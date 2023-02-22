Feature: Send Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Send Page" is open without connecting a wallet
    And User fills all stream inputs "without" a wallet connected
    And Stream ending on and amount per second is shown correctly
    And Stream preview is shown correctly when user is not connected
    And User accepts the risk warning
    Then Send button is enabled and asks user to Connect their wallet

  Scenario: Receiver dialog recents and ENS support
    Given "Send Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the receiver dialog
    Then The recent receivers are shown on "polygon"
    And User closes the dialog
    Then The receiver dialog is not visible
    And User opens the receiver dialog
    Then And user selects the first recent receiver
    Then The receiver address is shown as the chosen receiver in the send stream page
    And User searches for "vijay.eth" as a receiver
    Then "0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac" is visible in the ENS recipient results
    And User selects the first ENS recipient result
    Then Chosen wallet address shows up as vijay.eth
    And User clears the receiver field with the close button

  @skip
  Scenario: Super token selection , balances and wrap buttons
    Given "Send Page" is open with "staticBalanceAccount" connected on "gnosis"
    And User connects their wallet to the dashboard
    And User changes their network to "polygon"
    And User opens the token selection screen
    Then Super token balances are shown correctly for "staticBalanceAccount" on "polygon"
    And All of the tokens shown have an animation around them
    And The user clicks on the "MATICx" wrap button
    Then The user is redirected to the wrap page and "MATICx" is selected
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User selects "MATICx" as the super token to use for the stream
    Then Token balance is shown correctly in the send stream page with a wrap button next to it
    And User clicks on the wrap button in the send stream page
    Then The user is redirected to the wrap page and "MATICx" is selected
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User opens the token selection screen
    And "RIC" does not have a wrap button next to the balance
    And User selects "RIC" from the super token list
    Then Token balance is shown correctly in the send stream page without a wrap button next to it

  Scenario: Searching for a token in the token selection screen
    Given "Send Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the token selection screen
    And User searches for "MATIC" in the select token search field
    Then The "MATIC" is only shown as a token search result
    And User clears the token search field
    And User searches for "matic" in the select token search field
    Then The "MATIC" is only shown as a token search result
    And User clears the token search field
    And User searches for "YOLO420" in the select token search field
    Then The could not find any tokens message is shown

  Scenario: View mode warnings in send page
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "ongoingStreamAccount"
    And User clicks on the "send" navigation button
    And User fills all stream inputs "without" a wallet connected
    And User accepts the risk warning
    Then The stop viewing as an address button is visible

  @workaround
  Scenario: Wrong network warnings in the send page
    Given "Send Page" is open with "ongoingStreamAccount" connected on "gnosis"
    And User fills all stream inputs "with" a wallet connected
    And User accepts the risk warning
    And Change network button is visible with a message asking user to switch to "gnosis"

   Scenario: Ethereum mainnet uses minimum deposit instead of 4 hours of flow
     Given Transactional account john is connected to the dashboard on ethereum
     And User clicks on the "send" navigation button
     And User fills all stream inputs "with" a wallet connected
     Then The start stream button is disabled
     And The preview buffer amount shown and warning sections shows 69 tokens are needed for the buffer

  @skip @MikkSaidHeWillTakeAlook
  Scenario: Tokens getting sorted by amount in the token selection screen
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "accountWithLotsOfData"
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User opens the token selection screen
    And User waits for token balances to load
    And User closes the dialog
    And User opens the token selection screen
    Then The tokens are sorted by amount in the token selection screen

  #TODO: Test cases that are broken/will get changed
   #Scenario: Searching for a recent receiver
   #Not working atm, create test case when fixed
  #Scenario: Changing time units in the send page
  #Rounding is kind of off atm, and there is no rounding solution for now,
  #There is a test case to check the previews, but will create the case with changing time units when it works precisely
