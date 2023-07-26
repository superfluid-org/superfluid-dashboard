Feature: Settings page test cases

    Scenario: Enabling and disabling notifications
        Given "Settings Page" is open with "john" connected on "polygon"
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
        And Approval modal should not be visible

    Scenario: Add a new permission and close approval modal
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
        And User closes the unsaved changes modal
        And Unsaved Changes modal should not be visible

    Scenario: Add a new permission and click add button
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
        And User click on Add button
