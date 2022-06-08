Feature: Common element test cases

  Scenario: Switching between pages using navigation drawer
    Given "Dashboard page" is open without connecting a wallet
    And User clicks on the "dashboard" navigation button
    Then Dashboard page is open when wallet of the user is not connected
    And User clicks on the "wrap-unwrap" navigation button
    Then Wrap/Unwrap page is open and the wrap container is visible
    And User clicks on the "send" navigation button
    Then Send page is open and the send container is visible

  Scenario: Wallet connection status in the navigation drawer
    Given "Dashboard Page" is open with a mocked connection to "ongoingStreamAccount" on "polygon"
    And The navigation drawer shows connect wallet button
    And User connects their wallet to the dashboard
    And The navigation drawer shows that "ongoingStreamAccount" is "Connected"
    And User changes their network to "optimism-mainnet"
    And The navigation drawer shows that "ongoingStreamAccount" is "Wrong network"
