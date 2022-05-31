Feature: Dashboard Page test cases

#  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
#    Given "Dashboard Page" is open without connecting a wallet
#    Then Dashboard page is open when users wallet is not connected

#  Scenario: Dashboard page showing correct wallet balances for account with no streams
#    Given "Dashboard Page" is open with a mocked connection to "staticBalanceAccount" on "matic"
#    And User connects their wallet to the dashboard
#    And Correct "mainnet" wallet balances are shown for the "staticBalanceAccount"
#    And User changes the visible networks to "testnet"
#    Then Correct "testnet" wallet balances are shown for the "staticBalanceAccount"

#  Scenario: Enabling and disabling specific networks
#    Given "Dashboard Page" is open with a mocked connection to "staticBalanceAccount" on "matic"
#    And User connects their wallet to the dashboard
#    And User waits for balances to load
#    And User opens the network selection dropdown
#    And User clicks on the "xdai" toggle
#    Then "xdai" balances are not visible
#    And User clicks on the "matic" toggle
#    Then "matic" balances are not visible
#    And User clicks on the "optimism-mainnet" toggle
#    Then "optimism-mainnet" balances are not visible
#    And User clicks on the "arbitrum-one" toggle
#    Then "arbitrum-one" balances are not visible
#    #This should be updated to show "no networks selected message" instead of no balances
#    And User closes the network selection dropdown
#    Then No Super Token balance screen is shown
#    And User clicks on the no balance wrap button
#    Then Wrap/Unwrap page is open and the wrap container is visible
#    And User clicks on the "dashboard" navigation button
#    And User changes the visible networks to "testnet"
#    And User opens the network selection dropdown
#    And User waits for balances to load
#    And User clicks on the "ropsten" toggle
#    Then "ropsten" balances are not visible

  Scenario: Flow values ,cancel buttons and wrong network warning for an account with ongoing streams
    Given "Dashboard Page" is open with a mocked connection to "ongoingStreamsAccount" on "matic"
    And User connects their wallet to the dashboard
    And User waits for balances to load
    And User clicks on "matic" "MATICx" row
    And "matic" "MATICx" flow rates are shown with the correct values
    Then "matic" streams are shown with the correct values
    And User clicks on the first visible cancel button
    Then The cancel stream popup button is visible
    And User clicks away from the cancel stream button
    Then The cancel stream button is not visible
    And User clicks on "xdai" "xDAIx" row
    And Cancel button is disabled on all streams on "xdai"
    And User hovers on the first "xdai" stream cancel button
    Then A tooltip asking user to switch to "xdai" is shown


#    Scenario: Changing token stream table pages and amount of results shown
#      Given "Dashboard Page" is open with a mocked connection to "ongoingStreamAccount" on "matic"
#      And User connects their wallet to the dashboard
#      And User clicks on "token" row
#      And User changes the amount of rows shown to "10"
#      Then "10" streams with "token" are shown
#      And User changes the amount of rows shown to "25"
#      Then "25" streams with "token" are shown
#      And User switches to the next page
#      Then The streams table is showing the next page of results and the footer is showing the correct result amounts

  Scenario: View mode warnings in send page