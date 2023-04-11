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

  Scenario: Connect wallet button in faucet view
    Given "Dashboard page" is open without connecting a wallet
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    Then Connect wallet button is visible in the faucet menu

  Scenario: Stop viewing an address button in faucet view
    Given "Dashboard page" is open without connecting a wallet
    And User uses view mode to look at "ongoingStreamAccount"
    And User waits for balances to load
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    Then The stop viewing as an address button is visible
    And User clicks on the stop viewing as an address button
    Then Connect wallet button is visible in the faucet menu

  Scenario: Change network to Mumbai button in faucet view
    Given "Dashboard Page" is open with "john" connected on "goerli"
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    Then Switch to Mumbai button is visible in the faucet menu
    And User clicks on the switch network to button
    And User closes the presentation dialog
    Then "Polygon Mumbai" is the selected network in the dashboard

  Scenario: Claiming faucet tokens
    Given "Dashboard Page" is open with "NewRandomWallet" connected on "polygon-mumbai"
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    And The new wallet address is visible in the faucet menu
    And User clicks the claim tokens button
    Then Successfully claimed tokens message is shown
    And User clicks on the go to dashboard page button
    And The transaction drawer shows a pending "Claim Tokens" transaction on "polygon-mumbai"
    And The transaction drawer shows a succeeded "Claim Tokens" transaction on "polygon-mumbai"
    Then The netflow and incomming/outgoing amounts in the dashboard page for "fDAIx" on "polygon-mumbai" are "+1521/mo,-0/mo,+1521/mo"
    Then The netflow and incomming/outgoing amounts in the dashboard page for "fUSDCx" on "polygon-mumbai" are "+1521/mo,-0/mo,+1521/mo"
    And User clicks on the "wrap-unwrap" navigation button
    Then "MATIC" is selected as the token to wrap and it has underlying balance of "0.1"
    And User sends back the remaining MATIC to the faucet

  @mocked
  Scenario: Something went wrong message in the faucet menu
    Given Faucet requests are mocked to an error state
    Given "Dashboard Page" is open with "john" connected on "polygon-mumbai"
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    And User clicks the claim tokens button
    Then Something went wrong message is shown in the faucet menu

  Scenario: Tokens already claimed buttons in the faucet menu
    Given "Dashboard Page" is open with "john" connected on "polygon-mumbai"
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    And User clicks the claim tokens button
    Then You have already claimed tokens message is shown
    And User clicks on the wrap into super tokens button
    Then Wrap/Unwrap page is open and the wrap container is visible
    And User opens the navigation more menu
    And User opens the faucet view from the navigation menu
    Then The claim token is disabled and shows Tokens claimed message