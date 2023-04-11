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
    Given Dashboard is open with a mocked connection to "ongoingStreamAccount" on "polygon"
    And User connects their wallet to the dashboard
    And User changes their network to "optimism"
    And The navigation drawer shows that "ongoingStreamAccount" is "Wrong network"
    And User changes their network to "polygon"
    And The navigation drawer shows that "ongoingStreamAccount" is "Connected"

  @skip #No more access code, but if we bring it back we have the steps
  Scenario: Using access code to see ethereum mainnet
    Given "Dashboard page" is open without connecting a wallet
    And User opens the dashboard network selection dropdown
    Then Ethereum mainnet is not available in the network selection dropdown
    And User closes the dropdown
    And User opens the navigation more menu
    And User opens the access code menu
    And User types "AHR2_MAINNET" in the access code menu
    And User submits the access code
    Then Access code window is not visible
    And User opens the dashboard network selection dropdown
    And Ethereum mainnet is visible in the network selection dropdown

  @skip #No more access code, but if we bring it back we have the steps
  Scenario: Submitting wrong access codes
    Given "Dashboard page" is open without connecting a wallet
    And User opens the navigation more menu
    And User opens the access code menu
    And User types "Testing" in the access code menu
    And User submits the access code
    Then Invalid Access Code error is shown
    And User closes the access code dialog
    And User opens the dashboard network selection dropdown

  Scenario: No new notifications message
    Given "Settings Page" is open with "alice" connected on "ethereum"
    And User opens the notifications modal
    Then No "new" notifications message is shown
    And User switches to the "archive" notification tab
    Then No "archive" notifications message is shown

  Scenario: You are not subscribed to notifications message
    Given "Settings Page" is open with "bob" connected on "ethereum"
    And User opens the notifications modal
    Then You are not subscribed to notifications message is shown
    And User switches to the "archive" notification tab
    Then You are not subscribed to notifications message is shown

  Scenario: Connect wallet buttons visible in the notification modal
    Given "Settings page" is open without connecting a wallet
    And User opens the notifications modal
    Then Connect wallet button is visible in the notification modal

  @only @mocked
  Scenario Outline: Receiving opening and archiving a notification
    Given Notifications requests are mocked to "<notification>"
    Given "Settings Page" is open with "alice" connected on "ethereum"
    Then Notification toast is visible for "<notification>"
    And Notification badge shows "1" new notification
    And User opens the notifications modal
    Then New "<notification>" notification is shown
    And User closes the notification modal
    And User opens the notifications modal
    Then Notification badge shows "0" new notification
    Then Read "<notification>" notification is shown
    And User archives the last notification
    Then No "new" notifications message is shown
    And User switches to the "archive" notification tab
    Then  Archived "<notification>" notification is shown
    Examples:
      | notification            |
      | Liquidated              |
      | Liquidation Risk        |
      | Urgent Liquidation Risk |
      | Outdated Format         |

  @mocked
  Scenario: Wrap buttons in liquidation warning messages
    Given Notifications requests are mocked to "Liquidation Risk"
    Given "Settings Page" is open with "alice" connected on "polygon"
    And User opens the notifications modal
    Then Wrap button is visible in the notifications modal
    And User clicks on the wrap button in the notifications modal
    Then "TDL" is selected as the token to wrap

  @mocked
  Scenario: Notifications automatically archived if older than a month
    Given Notifications requests are mocked to "Old notification"
    Given "Settings Page" is open with "alice" connected on "goerli"
    And User opens the notifications modal
    Then No "new" notifications message is shown
    And User switches to the "archive" notification tab
    And Archived "Old notification" notification is shown
    And No wrap button is visible in the notifications modal
