Feature: Dashboard Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Dashboard Page" is open without connecting a wallet
    Then Dashboard page is open when wallet of the user is not connected

  @ignore
  Scenario: Dashboard page showing correct wallet balances for account with no streams
    Given "Dashboard Page" is open with a mocked connection to "staticBalanceAccount" on "polygon"
    And User connects their wallet to the dashboard
    And Correct "mainnet" wallet balances are shown for the "staticBalanceAccount"
    And User changes the visible networks to "testnet"
    Then Correct "testnet" wallet balances are shown for the "staticBalanceAccount"

  Scenario: Enabling and disabling specific networks
    Given "Dashboard Page" is open with a mocked connection to "staticBalanceAccount" on "polygon"
    And User connects their wallet to the dashboard
    And User waits for balances to load
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
    And User closes the network selection dropdown
    Then No Super Token balance screen is shown
    And User clicks on the no balance wrap button
    Then Wrap/Unwrap page is open and the wrap container is visible
    And User clicks on the "dashboard" navigation button
    And User changes the visible networks to "testnet"
    And User opens the network selection dropdown
    And User waits for balances to load
    And User clicks on the "ropsten" toggle
    Then "ropsten" balances are not visible

  @ignore
  Scenario: Flow values ,cancel buttons and wrong network warning for an account with ongoing streams
    Given "Dashboard Page" is open with a mocked connection to "ongoingStreamAccount" on "polygon"
    And User connects their wallet to the dashboard
    And User waits for balances to load
    And User clicks on "polygon" "MATICx" row
    And "polygon" "MATICx" flow rates are shown with the correct values
    Then "polygon" streams are shown with the correct values
    And User clicks on the first visible cancel button
    Then The cancel stream popup button is visible
    And User clicks away from the cancel stream button
    Then The cancel stream button is not visible
    And User clicks on "gnosis" "xDAIx" row
    And Cancel button is disabled on all streams on "gnosis"
    And User hovers on the first "gnosis" stream cancel button
    Then A tooltip asking user to switch to "gnosis" is shown

  @ignore
  Scenario: Changing token stream table pages and amount of results shown
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "accountWithLotsOfData"
    And User clicks on "gnosis" "xDAIx" row
    And User changes the amount of rows shown to "10"
    Then "10" streams with "xDAIx" are shown
    And User changes the amount of rows shown to "25"
    Then "25" streams with "xDAIx" are shown
    And User switches to the next page for the "xDAIx" token and new results are shown

  @ignore
  Scenario: View mode warnings in dashboard page
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "ongoingStreamAccount"
    And User waits for balances to load
    And User clicks on "polygon" "MATICx" row
    And Cancel button is disabled on all streams on "polygon"
    And User hovers on the first "polygon" stream cancel button
    #TODO: Currently not handled by the UI , but we should show something like that
    #Then A tooltip asking user to stop using view mode is shown