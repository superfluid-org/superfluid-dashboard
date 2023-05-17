Feature: Address Book test cases

    Scenario: No addresses added onboarding message
        Given "Address book Page" is open without connecting a wallet
        Then No addresses added message is shown

    Scenario: Adding, editing and removing an address book entry
        Given "Address book Page" is open without connecting a wallet
        And User adds "0x0000000000000000000000000000000000000000" on "-" to their address book
        Then The last address book entry name is "0x0000...0000"
        And Last address book entry network is "-"
        And User edits the name of the last address book entry to "testing"
        Then The last address book entry name is "testing"
        And User removes the last address book entry
        Then No addresses added message is shown
        And User adds "0x0000000000000000000000000000000000000000" on "polygon-mumbai" to their address book
        Then The last address book entry name is "0x0000...0000"
        And Last address book entry network is "polygon-mumbai"

    Scenario: Importing address book csv
        Given "Address book Page" is open without connecting a wallet

    Scenario: Exporting address book
        Given Address book test data is set up
        And "Address book Page" is open without connecting a wallet
        And User exports their address book
        Then The exported address book is in correct format

    Scenario: Address book results showing up based on their saved network
        Given Address book test data is set up

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"
        And User opens the receiver dialog
        And User searches for "WrongNetworkTest" as a receiver
        Then No results found message is shown by the address book entries
        And User searches for "CorrectNetworkTest" as a receiver
        Then "CorrectNetworkTest" is visible as an address book result

    Scenario: Adding a new contract address to the address book
        Given Address book test data is set up
        And "Address book Page" is open without connecting a wallet
        And User clicks on the add address button
        And User types in "0x0000000000000000000000000000000000000000" as the wallet address
        And User types in "Testing" as the address name
        Then Network is automatically selected to "polygon"
        Then And user clicks on save address button
        Then A contract address "0x0000000000000000000000000000000000000000" on "polygon" is saved as "Testing"

    Scenario: Address book name showing up in - Wallet connection container
        Given Address book test data is set up

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - View mode chip
        Given Address book test data is set up

        Given "Dashboard Page" is open without connecting a wallet

    Scenario: Address book name showing up in - Account export
        Given Address book test data is set up

        Given "Export Page" is open without connecting a wallet

    Scenario: Address book name showing up in - Vesting page
        Given Address book test data is set up

        Given "Vesting Page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - Vesting details page
        Given Address book test data is set up

        Given "Vesting Details Page" is open without connecting a wallet

    Scenario: Address book name showing up in - Vesting creation form
        Given Address book test data is set up

        Given "Vesting page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - Dashboard page and token page tables
        Given Address book test data is set up

        Given "Dashboard Page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - Stream details page
        Given Address book test data is set up

        Given "Stream details page" is open without connecting a wallet

    Scenario: Address book name showing up in - Send stream form
        Given Address book test data is set up

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - Activity history page
        Given Address book test data is set up

        Given "Activity History Page" is open with "bob" connected on "polygon-mumbai"

    Scenario: Address book name showing up in - Address book filter
        Given Address book test data is set up

        Given "Address book Page" is open without connecting a wallet
