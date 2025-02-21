@ignoreDuringUI
@rejected
@retries(3)
@numTestsKeptInMemory(0)
Feature: ACL and Auto-Wrap related rejected test cases

  @platformNeeded
  Scenario: Auto-Wrap page: Adding auto-wrap for a token (no permissions set)
    Given "Auto-Wrap Page" is open with "john" connected on "selected network"
    And No loading skeletons are visible in the page
    And User clicks on the add token button
    And User selects "selected network" as the network for the auto-wrap
    And User selects "TokenOnex" as the super token to use for auto-wrap or vesting
    And User clicks on the enable auto-wrap transaction button in the auto-wrap page dialog
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  @platformNeeded
  Scenario: Auto-Wrap page: Adding auto-wrap for a token which already has ACL allowance
    Given "Auto-Wrap Page" is open with "john" connected on "selected network"
    And No loading skeletons are visible in the page
    And User clicks on the add token button
    And User selects "selected network" as the network for the auto-wrap
    And User selects "TokenThreex" as the super token to use for auto-wrap or vesting
    And User clicks the Allowance button for the auto-wrap
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  @platformNeeded
  Scenario: Auto-Wrap page: Enabling auto-wrap for a token which has ACL allowance from the table
    Given "Auto-Wrap Page" is open with "john" connected on "selected network"
    And No loading skeletons are visible in the page
    And User clicks on the "TokenThreex" enable button in the auto-wrap table on "selected network"
    And User clicks the Allowance button for the auto-wrap
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  @platformNeeded
  Scenario: Auto-Wrap page: Disabling auto-wrap from the table
    Given "Auto-Wrap Page" is open with "john" connected on "selected network"
    And No loading skeletons are visible in the page
    And User clicks on the "TokenTwox" disable auto-wrap button on "selected network"
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

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
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

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
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  @playformNeeded
  Scenario: Vesting page: Disabling auto-wrap from the permissions table
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on selected network
    And User clicks on the "vesting" navigation button
    Then Auto-wrap icon for "TokenTwox" is "green"
    Then User opens "TokenTwox" permission table row
    And User clicks the disable auto-wrap button in the permissions table
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  @playformNeeded
  Scenario: Vesting page: Fixing permissions button in the vesting page table
    And Transactional account john is connected to the dashboard on selected network
    And User clicks on the "vesting" navigation button
    Then User opens "TokenOnex" permission table row
    And User clicks on the Fix permissions button
    Then Transaction rejected error is shown for auto-wrap or vesting transaction

  Scenario: Settings page: Adding a new permission - save changes screen
    Given "Settings Page" is open with "john" connected on "selected network"
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
    And User clicks on the save changes button
    Then Transaction rejected error is shown

  Scenario: Settings page: Adding a new permission
    Given HDWallet transactions are rejected

    Given "Settings Page" is open with "john" connected on "selected network"
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

  Scenario: Settings page: Revoking a permission
    Given "Settings Page" is open with "john" connected on "selected network"
    And No loading skeletons are visible in the page
    And User opens the first modify permissions form on "selected network"
    And User clicks on the revoke button in the permissions form
    Then Transaction rejected error is shown
