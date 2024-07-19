Feature: Auto-wrap page test cases

    Scenario: Stop viewing buttons in the auto-wrap table
        Given "Auto-wrap page" is open using view mode to look at "john"
        And No loading skeletons are visible in the page
        And User changes their network to "opsepolia"
        And User opens the navigation more menu
        And User opens the auto-wrap page from the navigation menu
        Then There are no enable or disable auto-wrap buttons visible
        And User clicks on the stop viewing as an address button
        Then Settings page wallet not connected screen is visible

    Scenario: Change network buttons in the table
        Given Dashboard is open with a mocked connection to "john" on "sepolia"
        And User connects their wallet to the dashboard
        And User opens the navigation more menu
        And User opens the auto-wrap page from the navigation menu
        And No loading skeletons are visible in the page
        Then All action buttons are changed to switch network buttons on "opsepolia" table

    Scenario: Data shown in the table
        Given "Auto-Wrap Page" is open with "john" connected on "opsepolia"
        And No loading skeletons are visible in the page
        Then Auto-wrap data shown on "opsepolia" is correct

    Scenario: Filtering out a network
        Given "Auto-Wrap Page" is open with "john" connected on "opsepolia"
        And No loading skeletons are visible in the page
        And User opens the network selection dropdown
        And User clicks on the "opsepolia" toggle
        Then "opsepolia" balances are not visible

    Scenario: No permissions set screen + add token button
        Given "Auto-Wrap Page" is open with "alice" connected on "opsepolia"
        Then No permissions set screen is visible
        And User clicks on the add token button in the no permissions set screen
        Then Add Auto-wrap dialog is open

    Scenario: Not in allowlist screen + apply for access button
        Given "Auto-Wrap Page" is open with "alice" connected on "polygon"
        Then Not in allowlist auto-wrap page screen is visible

    Scenario: Network contracts shown by the table
        Given "Auto-Wrap Page" is open with "john" connected on "opsepolia"
        Then Auto-wrap contract addresses are shown correctly for "opsepolia"

    Scenario: Close button showing up for a token which already has auto-wrap set up
        Given HDWallet transactions are rejected

        Given "Auto-Wrap Page" is open with "john" connected on "opsepolia"
        And No loading skeletons are visible in the page
        And User clicks on the add token button
        And User selects "opsepolia" as the network for the auto-wrap
        And User selects "fUSDCx" as the super token to use for the stream
        And User clicks on the close auto wrap dialog button
        Then Auto-wrap dialog is not visible

    Scenario: Anyone being able to create an auto-wrap on testnets
        Given HDWallet transactions are rejected

        Given "Auto-Wrap Page" is open with "alice" connected on "opsepolia"
        And No loading skeletons are visible in the page
        And User clicks on the add token button
        And User selects "opsepolia" as the network for the auto-wrap
        And User selects "fDAIx" as the super token to use for the stream
        And User clicks on the enable auto-wrap transaction button
        Then Transaction rejected error is shown
