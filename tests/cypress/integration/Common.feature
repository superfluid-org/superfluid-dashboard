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
        Given Dashboard is open with a mocked connection to "ongoingStreamAccount" on "polygon"
        And User connects their wallet to the dashboard
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
        And User opens the navigation more menu
        And User opens the access code menu
        And User types "AHR2_MAINNET" in the access code menu
        And User submits the access code
        Then Access code window is not visible
        And User opens the dashboard network selection dropdown
        And Ethereum mainnet is visible in the network selection dropdown

    @skip
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

    Scenario: Change network to Avalanche Fuji button in faucet view
        Given "Dashboard Page" is open with "john" connected on "sepolia"
        And User opens the navigation more menu
        And User opens the faucet view from the navigation menu
        Then Switch to Avalanche Fuji button is visible in the faucet menu
        And User clicks on the switch network to button
        And User closes the presentation dialog
        Then "Avalanche Fuji" is the selected network in the dashboard

    Scenario: Claiming faucet tokens
        Given "Dashboard Page" is open with "NewRandomWallet" connected on "avalanche-fuji"
        And User opens the navigation more menu
        And User opens the faucet view from the navigation menu
        And The new wallet address is visible in the faucet menu
        And User clicks the claim tokens button
        Then Successfully claimed tokens message is shown
        And User clicks on the go to dashboard page button
        And The transaction drawer shows a pending "Claim Tokens" transaction on "avalanche-fuji"
        And The transaction drawer shows a succeeded "Claim Tokens" transaction on "avalanche-fuji"
        Then The netflow and incomming/outgoing amounts in the dashboard page for "fDAIx" on "avalanche-fuji" are "+1521/mo,-0/mo,+1521/mo"
        Then The netflow and incomming/outgoing amounts in the dashboard page for "fUSDCx" on "avalanche-fuji" are "+1521/mo,-0/mo,+1521/mo"
        And User clicks on the "wrap-unwrap" navigation button
        Then "MATIC" is selected as the token to wrap and it has underlying balance of "0.1"
        And User sends back the remaining MATIC to the faucet

    @mocked
    Scenario: Something went wrong message in the faucet menu
        Given Faucet requests are mocked to an error state

        Given "Dashboard Page" is open with "john" connected on "avalanche-fuji"
        And User opens the navigation more menu
        And User opens the faucet view from the navigation menu
        And User clicks the claim tokens button
        Then Something went wrong message is shown in the faucet menu

    Scenario: Tokens already claimed buttons in the faucet menu
        Given "Dashboard Page" is open with "john" connected on "avalanche-fuji"
        And User opens the navigation more menu
        And User opens the faucet view from the navigation menu
        And User clicks the claim tokens button
        Then You have already claimed tokens message is shown
        And User clicks on the wrap into super tokens button
        Then Wrap/Unwrap page is open and the wrap container is visible with a wallet connected
        And User opens the navigation more menu
        And User opens the faucet view from the navigation menu
        Then The claim token is disabled and shows Tokens claimed message

    Scenario: No new notifications message
        Given "Settings Page" is open with "dan" connected on "ethereum"
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

    @mocked
    Scenario Outline: Receiving opening and archiving a notification
        Given Notifications requests are mocked to "<notification>"

        Given "Settings Page" is open with "dan" connected on "ethereum"
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
        Then Archived "<notification>" notification is shown

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

        Given "Settings Page" is open with "dan" connected on "avalanche-fuji"
        And User opens the notifications modal
        Then No "new" notifications message is shown
        And User switches to the "archive" notification tab
        And Archived "Old notification" notification is shown

    Scenario: Using view mode from the Connect or Impersonate screen
        Given "Vesting page" is open without connecting a wallet
        And User uses view mode to look at "john"
        Then View mode chip shows "0x9Be8...E2B9"

    Scenario: Close view mode from the Connect or Impersonate screen
        Given "Vesting page" is open without connecting a wallet
        And User clicks on the view mode button
        And User closes the dialog
        Then View mode dialog does not exist

    Scenario: Using view mode from the account modal
        Given "Address book page" is open with "alice" connected on "polygon"
        And User opens the connected account modal
        And User uses view mode to look at "john"
        Then View mode chip shows "0x9Be8...E2B9"

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

    Scenario: Searching for an lens address
        Given "Vesting page" is open without connecting a wallet
        And User clicks on the view mode button
        And User types "elvijs.lens" into the address input
        Then A lens entry for "elvijs.lens" is visible
        And The avatar image for "elvijs.lens" is shown loaded
        And User chooses the first lens entry from the list
        Then View mode chip shows "elvijs.lens"

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

    Scenario: Lens Api error when fetching a receiver
        Given "Vesting page" is open without connecting a wallet

        Given Lens and ENS api requests are blocked
        And User clicks on the view mode button
        And User types "elvijs.lens" into the address input
        Then An error is shown in the "Lens" receiver list

    Scenario: ENS Api error when fetching a receiver
        Given "Vesting page" is open without connecting a wallet

        Given Lens and ENS api requests are blocked
        And User clicks on the view mode button
        And User types "vijay.eth" into the address input
        Then An error is shown in the "ENS" receiver list

    Scenario: Hovering on onboarding cards and connect wallet modal showing up if user is not connected
        Given "Dashboard page" is open without connecting a wallet
        And User hovers on the modify streams onboarding card
        And User clicks on the modify streams onboarding card
        Then Wallet connection modal is shown

    #Not the greatest solution as minigame could not load and it would miss it, but I can't really validate the game itself with Cypress
    Scenario: Opening the mini-game without a wallet connected
        Given "Minigame page" is open without connecting a wallet
        Then The minigame container iframe is visible without a wallet connected
        Then In-game cosmetics warning is shown

    Scenario: Opening the mini-game with a wallet connected
        Given "Minigame page" is open with "john" connected on "polygon"
        Then The minigame container iframe is visible with a wallet connected
        Then In-game cosmetics warning does not exist
