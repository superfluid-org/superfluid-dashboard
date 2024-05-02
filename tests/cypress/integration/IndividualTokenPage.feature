Feature: Token page test cases

    Scenario: Token balances and net flows
        Given "Dashboard Page" is open with "ongoingStreamAccount" connected on "avalanche-fuji"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        Then Token symbol name, icons and liquidation date in token page are shown correctly for "fDAIx" on "avalanche-fuji"
        And "fDAIx" net flow balances are shown correctly for "ongoingStreamAccount" on "avalanche-fuji"

    Scenario: Streams table in token page
        Given "Dashboard Page" is open with "ongoingStreamAccount" connected on "avalanche-fuji"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        Then "avalanche-fuji" streams are shown with the correct values in the token page

    Scenario: Distributions table in token page
        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "polygonDistributionsAccount"
        And User changes their network to "polygon"
        And User opens "polygon" "MATICx" individual token page
        And User opens the distributions tab
        And The last distribution row is from "0xE093D8A4269CE5C91cD9389A0646bAdAB2c8D9A3" with "0.3885" received with "Approved" "6 Jan. 2022"
        And The revoke buttons are disabled

    Scenario: Transfers table in token page
        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "staticBalanceAccount"
        And User changes their network to "avalanche-fuji"
        And User opens "avalanche-fuji" "fUSDCx" individual token page
        And User opens the transfers tab
        Then "staticBalanceAccount" transfers for "fUSDCx" on "avalanche-fuji" are shown correctly
        And User switches to the "sent" tab in the transfer table
        And Only the "Sent" transfers are shown for "staticBalanceAccount" on "avalanche-fuji" for "fUSDC"
        And User switches to the "received" tab in the transfer table
        And Only the "Received" transfers are shown for "staticBalanceAccount" on "avalanche-fuji" for "fUSDC"

    Scenario: Wrap/Unwrap buttons in tokens page
        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "staticBalanceAccount"
        And User changes the visible networks to "testnet"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        And User clicks on the wrap button in the token page
        Then "fDAI" is selected as the token to wrap
        And User clicks on the "dashboard" navigation button
        And User opens "avalanche-fuji" "fDAIx" individual token page
        And User clicks on the unwrap button in the token page
        Then "fDAIx" is selected as the token to unwrap

    Scenario: Distributions table no data message
        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "staticBalanceAccount"
        And User changes the visible networks to "testnet"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        And User opens the distributions tab
        Then No data row is shown

    @mocked
    Scenario: Streams table no data message
        Given "Dashboard Page" is open without connecting a wallet
        And Stream table requests are mocked to an empty state
        And User uses view mode to look at "staticBalanceAccount"
        And User changes the visible networks to "testnet"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        Then No data row is shown

    @mocked
    Scenario: Transfers table no data message
        Given "Dashboard Page" is open without connecting a wallet
        And Transfer event requests are mocked to an empty state
        And User uses view mode to look at "staticBalanceAccount"
        And User changes the visible networks to "testnet"
        And User opens "avalanche-fuji" "fDAIx" individual token page
        And User opens the transfers tab
        Then No data row is shown

    #Works locally, leads to dashboard page on netlify builds
    @skip
    Scenario: Invalid token page leading to a 404 page
        Given "404 Token Page" is open without connecting a wallet
        Then 404 page is shown
