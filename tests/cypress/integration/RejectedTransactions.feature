@ignoreDuringUI
@rejected
@retries(5)
@numTestsKeptInMemory(0)
Feature: Transactional rejected test cases

    Scenario: Creating a new stream on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "1" "TokenTwox" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User tries to start or modify the stream and the first transaction dialogs are visible on "selected network"
        And Transaction rejected error is shown

    Scenario: Modifying a stream on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "2" "TokenOnex" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User tries to start or modify the stream and the first transaction dialogs are visible on "selected network"
        And Transaction rejected error is shown

    Scenario: Cancelling a stream on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "2" "TokenOnex" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User tries to cancel the stream and the first transaction dialogs are visible on "selected network"
        And Transaction rejected error is shown

    Scenario: Wrapping network native tokens on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "wrap-unwrap" navigation button
        And User wraps the "0.01" of the selected token
        And Transaction dialog for selected network is shown wrapping 0.01 TokenGas
        And Transaction rejected error is shown

    Scenario: Unwrapping network native token on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "wrap-unwrap" navigation button
        And User switches to unwrap tab
        And User unwraps the "0.01" of the selected token
        And Transaction dialog for selected network is shown unwrapping 0.01 TokenGas
        And Transaction rejected error is shown

    Scenario: Wrapping normal underlying tokens on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "wrap-unwrap" navigation button
        And User opens the token selection in the wrap page
        And User chooses "TokenTwo" to wrap
        And User inputs "0.01" into the wrap field
        And User wraps the "0.01" of the selected token
        And Transaction dialog for selected network is shown wrapping 0.01 TokenTwo
        And Transaction rejected error is shown

    Scenario: Unwrapping normal super tokens on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "wrap-unwrap" navigation button
        And User switches to unwrap tab
        And User opens the token selection in the wrap page
        And User chooses "TokenTwox" to wrap
        And User unwraps the "0.01" of the selected token
        And Transaction dialog for selected network is shown unwrapping 0.01 TokenTwo
        And Transaction rejected error is shown

    Scenario: Giving approval to tokens on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "wrap-unwrap" navigation button
        And User opens the token selection in the wrap page
        And User chooses "TokenOne" to wrap
        And User inputs "0.01" into the wrap field
        And User approves the protocol to use "TokenOne"
        And Transaction dialog for selected network is shown approving allowance of 0.01 TokenOne
        And Transaction rejected error is shown

    Scenario: Approving a subscription on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User opens "selected network" "TokenOnex" individual token page
        And User opens the distributions tab
        And User approves the last index distributions
        And Distribution approval dialog on "selected network" shows up
        And Transaction rejected error is shown

    Scenario: Revoking a subscription on selected network
        Given Transactional account john is connected to the dashboard on selected network
        And User opens "selected network" "TokenTwox" individual token page
        And User opens the distributions tab
        And User revokes the last index distributions
        And Distribution revoking dialog on "selected network" shows up
        And Transaction rejected error is shown

    @platformNeeded
    Scenario: Creating a stream with just start date
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "1" "TokenTwox" per "month" to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4"
        And User clicks the scheduling toggle
        And User inputs a date "1" "year" into the future into the stream start date
        And User accepts the risk warning
        And User clicks the send transaction button
        And Scheduled stream transaction dialogs are shown
        And Transaction rejected error is shown

    @platformNeeded
    Scenario: Creating a stream with just end date
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "1" "TokenTwox" per "month" to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4"
        And User clicks the scheduling toggle
        And User inputs a date "1" "year" into the future into the stream end date
        And User accepts the risk warning
        And User clicks the send transaction button
        And Scheduled stream transaction dialogs are shown
        And Transaction rejected error is shown

    @platformNeeded
    Scenario: Creating a stream with start and end date
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "1" "TokenTwox" per "month" to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4"
        And User clicks the scheduling toggle
        And User inputs a date "1" "year" into the future into the stream start date
        And User inputs a date "2" "year" into the future into the stream end date
        And User accepts the risk warning
        And User clicks the send transaction button
        And Scheduled stream transaction dialogs are shown
        And Transaction rejected error is shown

    @platformNeeded
    Scenario: Adding end date to an ongoing stream
        Given Transactional account john is connected to the dashboard on selected network
        And User clicks on the "send" navigation button
        And User inputs all the details to send "1" "TokenOnex" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User clicks the scheduling toggle
        And User inputs a date "2" "year" into the future into the stream end date
        And User accepts the risk warning
        And User clicks the send transaction button
        And Scheduled stream transaction dialogs are shown
        And Transaction rejected error is shown

    @platformNeeded
    Scenario: Auto-Wrap page: Adding auto-wrap for a token (no permissions set)
        Given "Auto-Wrap Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User clicks on the add token button
        And User selects "selected network" as the network for the auto-wrap
        And User selects "TokenOnex" as the super token to use for the stream
        And User clicks on the enable auto-wrap transaction button in the auto-wrap page dialog
        Then Transaction rejected error is shown

    @platformNeeded
    Scenario: Auto-Wrap page: Adding auto-wrap for a token which already has ACL allowance
        Given "Auto-Wrap Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User clicks on the add token button
        And User selects "selected network" as the network for the auto-wrap
        And User selects "TokenThreex" as the super token to use for the stream
        And User clicks the Allowance button for the auto-wrap
        Then Transaction rejected error is shown

    @platformNeeded
    Scenario: Auto-Wrap page: Enabling auto-wrap for a token which has ACL allowance from the table
        Given "Auto-Wrap Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User clicks on the "TokenThreex" enable button in the auto-wrap table on "selected network"
        And User clicks the Allowance button for the auto-wrap
        Then Transaction rejected error is shown

    @platformNeeded
    Scenario: Auto-Wrap page: Disabling auto-wrap from the table
        Given "Auto-Wrap Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User clicks on the "TokenTwox" disable auto-wrap button on "selected network"
        Then Transaction rejected error is shown

    @playformNeeded
    Scenario: Vesting page: Enabling Auto-wrap from the permissions table for a user who has not set it up
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on selected network
        And User clicks on the "vesting" navigation button
        Then User opens "TokenOnex" permission table row
        Then Auto-wrap icon for "TokenOnex" is "grey"
        And User clicks on the enable auto-wrap transaction button in the permissions table
        Then Auto-wrap dialog is showing ACL allowance button
        And User clicks on the enable auto-wrap transaction button in the auto-wrap dialog
        Then Transaction rejected error is shown

    @playformNeeded
    Scenario: Vesting page: Auto-wrap in the permissions table for a user who has already given ACL permissions
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on selected network
        And User clicks on the "vesting" navigation button
        Then User opens "TokenThreex" permission table row
        Then Auto-wrap icon for "TokenThreex" is "grey"
        And User clicks on the enable auto-wrap transaction button in the permissions table
        Then Auto-wrap dialog is showing token allowance button
        And User clicks the Allowance button for the auto-wrap
        Then Transaction rejected error is shown

    @playformNeeded
    Scenario: Vesting page: Disabling auto-wrap from the permissions table
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on selected network
        And User clicks on the "vesting" navigation button
        Then Auto-wrap icon for "TokenTwox" is "green"
        Then User opens "TokenTwox" permission table row
        And User clicks the disable auto-wrap button in the permissions table
        Then Transaction rejected error is shown

    @playformNeeded
    Scenario: Vesting page: Fixing permissions button in the vesting page table
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on goerli
        And User clicks on the "vesting" navigation button
        Then User opens "fDAIx" permission table row
        And User clicks on the Fix permissions button
        Then Transaction rejected error is shown

    Scenario: Settings page: Adding a new permission - save changes screen
        Given "Settings Page" is open with "john" connected on "polygon-mumbai"
        And User clicks on the add approval button
        And User opens the add approval modal is visible
        And User selects "fDAIx" as the super token to use for the stream
        And User searches for "0x9B6157d44134b21D934468B8bf709294cB298aa7" as a receiver
        And User inputs a allowance "1.53" into the field
        And User inputs a flow rate "12.17" into the field
        And User toggle on a create permission
        And User toggle on a update permission
        And User toggle on a delete permission
        And User toggle off a update permission
        And User closes the add approval modal
        And Unsaved Changes modal should be visible
        And User clicks on the save changes button
        Then Transaction rejected error is shown

    Scenario: Settings page: Adding a new permission
        Given HDWallet transactions are rejected

        Given "Settings Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User clicks on the add approval button
        And User opens the add approval modal is visible
        And User selects "TokenOnex" as the super token to use for the stream
        And User searches for "0x9B6157d44134b21D934468B8bf709294cB298aa7" as a receiver
        And User inputs a allowance "1.53" into the field
        And User inputs a flow rate "12.17" into the field
        And User toggle on a create permission
        And User toggle on a update permission
        And User toggle on a delete permission
        And User toggle off a update permission
        And User closes the add approval modal
        And Unsaved Changes modal should be visible
        And User click on approvals add button
        And Transaction rejected error is shown
        And User closes tx the dialog
        And User closes the unsaved changes modal

    Scenario: Settings page: Changing ACL permissions
        Given "Settings Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User opens the first modify permissions form on "selected network"
        And User clicks the create permission toggle
        And User clicks the update permission toggle
        And User clicks the delete permission toggle
        And User click on approvals add button
        And Transaction rejected error is shown

    Scenario: Settings page: Changing Token allowance
        Given "Settings Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User opens the first modify permissions form on "selected network"
        And User inputs a allowance "42069" into the field
        And User click on approvals add button
        And Transaction rejected error is shown

    Scenario: Settings page: Changing flow rate allowance
        Given "Settings Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User opens the first modify permissions form on "selected network"
        And User inputs a flow rate "42069" into the field
        And User click on approvals add button
        And Transaction rejected error is shown

    Scenario: Revoking a permission ( rejected )
        Given "Settings Page" is open with "john" connected on "selected network"
        And No loading skeletons are visible in the page
        And User opens the first modify permissions form on "selected network"
        And User clicks on the revoke button in the permissions form
        Then Transaction rejected error is shown
