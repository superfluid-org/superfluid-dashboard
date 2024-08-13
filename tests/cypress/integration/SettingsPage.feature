Feature: Settings page test cases

  #Sadly mockBridge does not work with signatures
  @skip
  Scenario: Enabling and disabling notifications
    Given "Settings Page" is open with "john" connected on "ethereum"
    And No loading skeletons are visible in the page
    And User clicks on the notification button
    And User opens the notifications modal
    Then No "new" notifications message is shown
    And User closes the dropdown
    And User clicks on the notification button
    And User opens the notifications modal
    Then You are not subscribed to notifications message is shown

  Scenario: Wallet address shown in the settings page and using the settings button in notification modal
    Given "Dashboard Page" is open with "alice" connected on "ethereum"
    And User opens the notifications modal
    And User clicks on the notification settings button
    Then "0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B" is visible in the settings page

  Scenario: Wallet Not connected screen in settings page
    Given "Settings page" is open without connecting a wallet
    Then Settings page wallet not connected screen is visible

  Scenario: No permissions set screen showing up
    Given "Settings Page" is open with "alice" connected on "polygon"
    Then Settings page No Access Data screen screen is visible

  Scenario: Open and close approvals Modal in settings page
    Given "Settings Page" is open with "alice" connected on "polygon"
    And User clicks on the add approval button
    And User opens the add approval modal is visible
    And User closes the add approval modal
    And Approval modal should not exist

  Scenario: Add a new permission and close approval modal
    Given "Settings Page" is open with "john" connected on "opsepolia"
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
    And User closes the unsaved changes modal
    And Unsaved Changes modal should not exist

  Scenario: Address book names showing up in the ACL table
    Given Address book test data is set up

    Given "Settings Page" is open with "dan" connected on "opsepolia"
    And No loading skeletons are visible in the page
    Then "fTUSDx" permission row with "john" as an operator on "opsepolia" is visible

  Scenario: ENS names showing up in the ACL table
    Given "Settings Page" is open with "dan" connected on "opsepolia"
    And No loading skeletons are visible in the page
    Then "fTUSDx" permission row with "vijay.eth" as an operator on "opsepolia" is visible

  Scenario: Lens names showing up in the ACL table
    Given "Settings Page" is open with "dan" connected on "opsepolia"
    And No loading skeletons are visible in the page
    Then "fTUSDx" permission row with "@elvijs" as an operator on "opsepolia" is visible

  Scenario: Revoked Allowances and Permissions not showing up in the table
    Given HDWallet transactions are rejected

    Given "Settings Page" is open with "dan" connected on "opsepolia"
    And No loading skeletons are visible in the page
    Then Permission row for "vijay.eth" to use "MATICx" on "opsepolia" does not exist

  Scenario: Vesting form being auto-completed for existing permissions
    Given HDWallet transactions are rejected

    Given "Settings Page" is open with "john" connected on "opsepolia"
    And No loading skeletons are visible in the page
    And User opens the first modify permissions form on "opsepolia"
    Then The selected row token , network and operator are auto-filled in the modify form

  @bug
  @skip
  Scenario: View mode buttons in the form
    Given HDWallet transactions are rejected

    Given "Auto-wrap page" is open using view mode to look at "john"
    And No loading skeletons are visible in the page
    And User changes their network to "opsepolia"
    And User opens the first modify permissions form on "opsepolia"
    Then One stop viewing button is visible in the permissions form
    And User clicks the create permission toggle
    Then One stop viewing button is visible in the permissions form
    And User clicks on the stop viewing as an address button
    Then Settings page wallet not connected screen is visible

  Scenario: Change network buttons in the form
    Given "Dashboard Page" is open with "john" connected on "sepolia"
    And User clicks on the "settings" navigation button
    And No loading skeletons are visible in the page
    And User opens the first modify permissions form on "opsepolia"
    Then One change network is visible in the permissions form
    And User clicks the create permission toggle
    Then One change network is visible in the permissions form

  Scenario: Token and flow allowance showing "Unlimited"
    Given HDWallet transactions are rejected

    Given "Settings Page" is open with "dan" connected on "opsepolia"
    Then "fTUSDx" permission row with "vijay.eth" as an operator has "Unlimited" token allowance on "opsepolia"
    Then "fTUSDx" permission row with "vijay.eth" as an operator has "Unlimited" stream allowance on "opsepolia"
