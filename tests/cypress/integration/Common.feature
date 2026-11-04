Feature: Common element test cases

  Scenario: Switching between pages using navigation drawer
    Given "Dashboard page" is open without connecting a wallet
    And User clicks on the "dashboard" navigation button
    Then Dashboard page is open when wallet of the user is not connected
    And User clicks on the "wrap-unwrap" navigation button
    Then Wrap/Unwrap page is open and the wrap container is visible without a wallet connected
    And User clicks on the "send" navigation button
    Then Send page is open and the send container is visible

  Scenario: Making sure the ecosystem page href is correctly set for the navigation button
    Given "Dashboard page" is open without connecting a wallet
    Then Ecosystem page navigation button leads to an external site

  Scenario: Wallet connection status in the navigation drawer
    Given "Dashboard Page" is open with "ongoingStreamAccount" connected on "polygon"
    And User changes their network to "optimism"
    And The navigation drawer shows that "ongoingStreamAccount" is "Wrong network"
    And User changes their network to "polygon"
    And The navigation drawer shows that "ongoingStreamAccount" is "Connected"

  @skip
  Scenario: Using access code to see ethereum mainnet
    Given "Dashboard page" is open without connecting a wallet
    And User opens the dashboard network selection dropdown
    Then Ethereum mainnet is not available in the network selection dropdown
    And User closes the dropdown
    And User opens the access code menu
    And User types "AHR2_MAINNET" in the access code menu
    And User submits the access code
    Then Access code window is not visible
    And User opens the dashboard network selection dropdown
    And Ethereum mainnet is visible in the network selection dropdown

  @skip
  Scenario: Submitting wrong access codes
    Given "Dashboard page" is open without connecting a wallet
    And User opens the access code menu
    And User types "Testing" in the access code menu
    And User submits the access code
    Then Invalid Access Code error is shown
    And User closes the access code dialog
    And User opens the dashboard network selection dropdown

  # Scenario: Connect wallet button in faucet view
  #     Given "Dashboard page" is open without connecting a wallet
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     Then Connect wallet button is visible in the faucet menu
  # Scenario: Stop viewing an address button in faucet view
  #     Given "Dashboard page" is open without connecting a wallet
  #     And User uses view mode to look at "ongoingStreamAccount"
  #     And User waits for balances to load
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     Then The stop viewing as an address button is visible
  #     And User clicks on the stop viewing as an address button
  #     Then Connect wallet button is visible in the faucet menu
  # Scenario: Change network to Optimism Sepolia button in faucet view
  #     Given "Dashboard Page" is open with "john" connected on "sepolia"
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     Then Switch to Optimism Sepolia button is visible in the faucet menu
  #     And User clicks on the switch network to button
  #     And User closes the presentation dialog
  #     Then "Optimism Sepolia" is the selected network in the dashboard
  # Scenario: Claiming faucet tokens
  #     Given "Dashboard Page" is open with "NewRandomWallet" connected on "opsepolia"
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     And The new wallet address is visible in the faucet menu
  #     And User clicks the claim tokens button
  #     Then Successfully claimed tokens message is shown
  #     And User clicks on the go to dashboard page button
  #     And The transaction drawer shows a pending "Claim Tokens" transaction on "opsepolia"
  #     And The transaction drawer shows a succeeded "Claim Tokens" transaction on "opsepolia"
  #     Then The netflow and incomming/outgoing amounts in the dashboard page for "fDAIx" on "opsepolia" are "+1521/mo,-0/mo,+1521/mo"
  #     Then The netflow and incomming/outgoing amounts in the dashboard page for "fUSDCx" on "opsepolia" are "+1521/mo,-0/mo,+1521/mo"
  #     And User clicks on the "wrap-unwrap" navigation button
  #     Then "MATIC" is selected as the token to wrap and it has underlying balance of "0.1"
  #     And User sends back the remaining MATIC to the faucet
  # @mocked
  # Scenario: Something went wrong message in the faucet menu
  #     Given Faucet requests are mocked to an error state
  #     Given "Dashboard Page" is open with "john" connected on "opsepolia"
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     And User clicks the claim tokens button
  #     Then Something went wrong message is shown in the faucet menu
  # Scenario: Tokens already claimed buttons in the faucet menu
  #     Given "Dashboard Page" is open with "john" connected on "opsepolia"
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     And User clicks the claim tokens button
  #     Then You have already claimed tokens message is shown
  #     And User clicks on the wrap into super tokens button
  #     Then Wrap/Unwrap page is open and the wrap container is visible with a wallet connected
  #     And User opens the navigation more menu
  #     And User opens the faucet view from the navigation menu
  #     Then The claim token is disabled and shows Tokens claimed message

  Scenario: Using view mode from the Connect or Impersonate screen
    Given "Vesting page" is open without connecting a wallet
    And User uses view mode to look at "john"
    Then View mode chip shows "0x46Bd...27d2"

  Scenario: Close view mode from the Connect or Impersonate screen
    Given "Vesting page" is open without connecting a wallet
    And User clicks on the view mode button
    And User closes the dialog
    Then View mode dialog does not exist

  Scenario: Using view mode from the account modal
    Given "Address book page" is open with "alice" connected on "polygon"
    And User opens the connected account modal
    And User uses view mode to look at "john"
    Then View mode chip shows "0x46Bd...27d2"

  Scenario: Close view mode from the account modal
    Given "Address book page" is open with "alice" connected on "polygon"
    And User opens the connected account modal
    And User clicks on the view mode button
    And User closes the dialog
    Then View mode dialog does not exist

  Scenario: Closing the account modal
    Given "Address book page" is open with "alice" connected on "polygon"
    And User opens the connected account modal
    And User closes the dialog
    Then Connected account dialog does not exist

  Scenario: Disconnecting the users wallet from the account modal
    Given "Dashboard page" is open with "alice" connected on "polygon"
    And User disconnects their wallet from the dashboard
    Then Connected account dialog does not exist
    Then Dashboard page is open when wallet of the user is not connected

  Scenario: Copying wallet address from the account modal
    Given "Address book page" is open with "alice" connected on "polygon"
    And User opens the connected account modal
    And User clicks on the copy address button in the account modal
    Then The address is copied and the buttons text in the address modal changes to "Copied!" with a checkmark icon

  Scenario: Searching for an ens address and validating the image
    Given "Vesting page" is open without connecting a wallet
    And User clicks on the view mode button
    And User types "vijay.eth" into the address input
    And "vijay.eth" ENS entry in the address search results is shown
    And The avatar image for "vijay.eth" is shown loaded
    And User selects the first ENS recipient result
    Then View mode chip shows "vijay.eth"

  Scenario: Turning dark mode on
    Given "Vesting page" is open without connecting a wallet
    And User clicks on the dark mode button
    Then The dashboard theme is set to dark mode
    And User clicks on the light mode button
    Then The dashboard theme is set to light mode

  Scenario: ENS API error when fetching a receiver with domain
    Given "Vesting page" is open without connecting a wallet
    Given ENS api requests are blocked
    And User clicks on the view mode button
    And User types "elvijs.eth" into the address input
    Then An error is shown in the "ENS" receiver list

  Scenario: ENS API error when fetching a receiver with different domain
    Given "Vesting page" is open without connecting a wallet
    Given ENS api requests are blocked
    And User clicks on the view mode button
    And User types "vijay.eth" into the address input
    Then An error is shown in the "ENS" receiver list

  Scenario: Hovering on onboarding cards and connect wallet modal showing up if user is not connected
    Given "Dashboard page" is open without connecting a wallet
    And User hovers on the modify streams onboarding card
    And User clicks on the modify streams onboarding card
    Then Wallet connection modal is shown

  Scenario: Superfluid Runner link without a wallet connected
    Given "Dashboard page" is open without connecting a wallet
    Then The Superfluid Runner navigation link points to the game without an address

  Scenario: Superfluid Runner link with a wallet connected
    Given "Dashboard Page" is open with "john" connected on "polygon"
    Then The Superfluid Runner navigation link points to the game with "john" as the address
