Feature: Dashboard Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Dashboard Page" is open without connecting a wallet
    Then Dashboard page is open when wallet of the user is not connected

  @broken @skip
  Scenario: Dashboard page showing correct wallet balances for account with no streams
    Given "Dashboard Page" is open with "staticBalanceAccount" connected on "polygon"
    And User connects their wallet to the dashboard
    And Correct "mainnet" wallet balances are shown for the "staticBalanceAccount"
    And User changes the visible networks to "testnet"
    Then Correct "testnet" wallet balances are shown for the "staticBalanceAccount"

  Scenario: Enabling and disabling specific networks
    Given "Dashboard Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the network selection dropdown
    And User clicks on the "gnosis" toggle
    Then "gnosis" balances are not visible
    And User clicks on the "polygon" toggle
    Then "polygon" balances are not visible
    And User clicks on the "optimism" toggle
    Then "optimism" balances are not visible
    And User clicks on the "arbitrum-one" toggle
    Then "arbitrum-one" balances are not visible
    #This should be updated to show "no networks selected message" instead of no balances
    And User closes the dropdown
    Then No Super Token balance screen is shown
    And User clicks on the no balance wrap button
    Then Wrap/Unwrap page is open and the wrap container is visible
    And User clicks on the "dashboard" navigation button
    And User changes the visible networks to "testnet"
    And User opens the network selection dropdown
    And User clicks on the "polygon-mumbai" toggle
    Then "polygon-mumbai" balances are not visible

  Scenario: Flow values ,cancel buttons and wrong network warning for an account with ongoing streams
    Given "Dashboard Page" is open with "ongoingStreamAccount" connected on "gnosis"
    And User clicks on "gnosis" "xDAIx" row
    And "gnosis" "xDAIx" flow rates are shown with the correct values
    Then "gnosis" streams are shown with the correct values in dashboard page
    And Cancel and Edit buttons are visible
    And User clicks on "optimism" "DAIx" row
    And Cancel button is disabled on all streams on "optimism"
    And User hovers on the first "optimism" stream cancel button
    Then A tooltip asking user to switch to "optimism" is shown

  Scenario: Changing token stream table pages and amount of results shown
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "accountWithLotsOfData"
    And User clicks on "gnosis" "xDAIx" row
    And User changes the amount of rows shown to "10"
    Then "10" streams with "xDAIx" are shown
    And User changes the amount of rows shown to "25"
    Then "25" streams with "xDAIx" are shown
    And User switches to the next page for the "xDAIx" token and new results are shown

  Scenario: View mode warnings in dashboard page
    Given "Dashboard Page" is open using view mode to look at "ongoingStreamAccount"
    And User waits for balances to load
    And User clicks on "polygon" "MATICx" row
    Then There are no cancel or modify buttons in the last stream row

  Scenario: Testnet faucet message in the dashboard page for user with no super tokens
    Given "Dashboard Page" is open with "NewRandomWallet" connected on "polygon-mumbai"
    Then Dashboard page faucet message is shown
    And User opens the faucet view from the dashboard page
    Then Faucet view is visible

  Scenario: Testnet faucet message not shown for users with tokens
    Given "Dashboard Page" is open with "john" connected on "polygon-mumbai"
    Then Dashboard page faucet message does not exist
