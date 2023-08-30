Feature: Bridge page test cases (Li-Fi widget)

    @skip
    Scenario: Routes and connect wallet button showing up for a user without a connected wallet
        Given "Dashboard page" is open without connecting a wallet
        And User clicks on the "bridge" navigation button
        And User chooses "DAIx" token to swap "From" on "Polygon"
        And User chooses "USDC" token to swap "To" on "Polygon"
        And User inputs "1" into the swap amount
        And The You pay section shows the correct token and network icons
        And Token swapping route for is correctly shown
        And Connect wallet button is visible

    @skip
    Scenario: Routes and swap button showing up for a user with a connected wallet but with no balance for it
        Given Transactional account bob is connected to the dashboard on goerli
        And User clicks on the "bridge" navigation button
        And User chooses "DAIx" token to swap "From" on "Polygon"
        And User chooses "USDC" token to swap "To" on "Polygon"
        And User inputs "1" into the swap amount
        And Token swapping route for is correctly shown
        And Review swap button is disabled
        And Not enough gas funds error is shown

    @skip
    Scenario: Routes and connect wallet button showing up for a user in view mode
        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "ongoingStreamAccount"
        And User clicks on the "bridge" navigation button
        And User chooses "DAIx" token to swap "From" on "Polygon"
        And User chooses "USDC" token to swap "To" on "Polygon"
        And User inputs "1" into the swap amount
        And The You pay section shows the correct token and network icons
        And Token swapping route for is correctly shown
        And Connect wallet button is visible

    @skip
    Scenario: Li-Fi widget history page (No activity)
        Given Transactional account bob is connected to the dashboard on goerli
        And User clicks on the "bridge" navigation button
        And LiFi bridge inputs are visible
        And History button is not visible
        And User clicks on the history button
        Then No history message is shown
        And User clicks on the back button
        And LiFi bridge inputs are visible
        And User disconnects their wallet from the dashboard
        And History button is not visible

    #There was a bug that froze the whole bridge when choosing a token without an icon
    Scenario: Choosing a token with a default icon does not crash the page
        Given "Dashboard page" is open without connecting a wallet
        And User clicks on the "bridge" navigation button
        And User chooses "idleWETHx" token to swap "From" on "Polygon"
        And User chooses "idleWETHYield" token to swap "To" on "Polygon"
        And User inputs "1" into the swap amount
        And Connect wallet button is visible

    Scenario: Loading the page directly does not crash the dashboard
        Given "Bridge page" is open without connecting a wallet
        And LiFi bridge inputs are visible

    @skip
    Scenario: Lifi bridge settings page ( very vague )
        Given "Bridge page" is open without connecting a wallet
        And User opens the lifi widget settings
        And Lifi widget settings are visible
        And User clicks on the back button
        Then LiFi bridge inputs are visible

    Scenario: Only Superfluid supported networks are shown in the Bridge page and super tokens are featured
        Given "Bridge page" is open with "bob" connected on "ethereum"
        And User opens the token selection in the bridge page
        Then Only Superfluid supported networks are shown as available options
        And Ethereum mainnet is shown in the network list

    Scenario: Only Superfluid supported networks are shown in the Bridge page and super tokens are featured
        Given "Bridge page" is open with "john" connected on "ethereum"
        And User opens the token selection in the bridge page
        And User selects "Polygon" as the network for the first token bridging
        Then Featured super tokens on "polygon" are visible