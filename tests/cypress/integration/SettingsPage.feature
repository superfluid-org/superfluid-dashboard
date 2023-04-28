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
