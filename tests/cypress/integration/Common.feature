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
    And User changes their network to "optimism"
    And The navigation drawer shows that "ongoingStreamAccount" is "Wrong network"

  Scenario: Using access code to see ethereum mainnet
    Given "Dashboard page" is open without connecting a wallet
    And User opens the dashboard network selection dropdown
    Then Ethereum mainnet is not available in the network selection dropdown
    And User closes the dropdown
    And User opens the navigation more menu
    And User opens the access code menu
    And User types "724ZX_ENS" in the access code menu
    And User submits the access code
    Then Access code window is not visible
    And User opens the dashboard network selection dropdown
    And Ethereum mainnet is visible in the network selection dropdown

  Scenario: Submitting wrong access codes
    Given "Dashboard page" is open without connecting a wallet
    And User opens the navigation more menu
    And User opens the access code menu
    And User types "Testing" in the access code menu
    And User submits the access code
    Then Invalid Access Code error is shown
    And User closes the access code dialog
    And User opens the dashboard network selection dropdown
    Then Ethereum mainnet is not available in the network selection dropdown

  Scenario: Vesting schedule details page not available without vesting code
    Given "Vesting details page" is open without connecting a wallet
    Then 404 page is shown