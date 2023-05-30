Feature: Address Book test cases

    Scenario: No addresses added onboarding message
        Given "Address book Page" is open without connecting a wallet
        Then No addresses added message is shown

    Scenario: Adding, editing and removing an address book entry
        Given "Address book Page" is open without connecting a wallet
        And User adds "0x0000000000000000000000000000000000000000" as "Testing" on "-" to their address book
        Then The last address book entry name is "Testing"
        And Last added address book entry network is "-"
        And User edits the name of the last address book entry to "testing"
        Then The last address book entry name is "testing"
        And User removes the last address book entry
        Then No addresses added message is shown
        And User adds "0x0000000000000000000000000000000000000000" as "-" on "polygon" to their address book
        Then The last address book entry name is "0x0000...0000"
        And Last added address book entry network is "polygon"

    Scenario: Adding an address with ENS name
        Given "Address book Page" is open without connecting a wallet
        And User adds "vijay.eth" as "-" on "-" to their address book
        Then The last address book entry name is "vijay.eth"
        And The last saved address is "0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac"
        And ENS name "vijay.eth" is shown by the last saved address book entry

    Scenario: Adding a new contract address to the address book
        And "Address book Page" is open without connecting a wallet
        And User adds "0xF9240F930d847F70ad900aBEE8949F25649Bf24a" as "Testing" on "-" to their address book
        Then A contract address "0xF9240F930d847F70ad900aBEE8949F25649Bf24a" on "goerli" is saved as "Testing"

    Scenario: Importing address book csv
        Given "Address book Page" is open without connecting a wallet
        And User imports their address book
        Then The imported addresses are shown correctly

    Scenario: Exporting address book
        Given Address book test data is set up
        And "Address book Page" is open without connecting a wallet
        And User exports their address book
        Then The exported address book is in correct format

    Scenario: Address book results showing up based on their saved network
        Given Address book test data is set up

        Given "Send Page" is open with "bob" connected on "polygon"
        And User searches for "Optimism" as a receiver
        Then No results found message is shown by the address book entries
        And User clears the receiver input field
        And User types "Polygon" into the address input
        Then "Polygon" with address "0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05" is visible as an address book result

    Scenario: Address book name showing up in - Wallet connection container
        Given Address book test data is set up

        Given "Ecosystem Page" is open with "alice" connected on "polygon-mumbai"
        Then Wallet connection status "alice" as the connected address

    Scenario: Address book name showing up in - View mode chip
        Given Address book test data is set up

        Given "Dashboard Page" is open without connecting a wallet
        And User uses view mode to look at "alice"
        Then View mode chip shows "alice"

    Scenario: Address book name showing up in - Account export
        Given Address book test data is set up

        Given "Accounting Export Page" is open without connecting a wallet
        And User searches for "Multiple networks test" as a receiver and selects it
        And Selected sections shows "Multiple networks test" and address book entry is selected
        And User clicks the OK button
        And "Multiple networks test" is selected for the export
        And User searches for "john" as the counterparty account
        And User selects "john" from the address book section
        And Selected sections shows "john" and address book entry is selected
        And User clicks the OK button
        And "john" is shown as one of the counterparty addresses
        And User changes the export start date to "01/22"
        And User changes the export end date with date picker to "Jan" "2023"
        And User clicks on the export preview button
        Then The export preview table only shows "counterparty" rows with "john"

    Scenario: Address book name showing up in - Vesting page
        Given Address book test data is set up

        Given "Vesting Page" is open with "john" connected on "goerli"
        Then The receivers shown in the vesting page are named "Multiple networks test"

    Scenario: Address book name showing up in - Vesting details page
        Given Address book test data is set up

        Given "Vesting Details Page" is open without connecting a wallet
        Then The "Receiver" shown in the vesting details page is "Multiple networks test"
        Then The "Sender" shown in the vesting details page is "john"

    Scenario: Address book name showing up in - Vesting creation form
        Given Address book test data is set up

        Given "Vesting page" is open with "john" connected on "polygon-mumbai"
        And User clicks on the create vesting schedule button
        And User searches for "bob" as a receiver and selects it
        Then Chosen wallet address shows up as bob

    Scenario: Address book name showing up in - Dashboard page and token page tables
        Given Address book test data is set up

        Given "Dashboard Page" is open with "john" connected on "goerli"
        And User clicks on "goerli" "TDLx" row
        Then "alice,dan,bob" are visible in the table as the receivers or senders of streams
        And User opens "goerli" "TDLx" individual token page
        Then "alice,dan,bob" are visible in the table as the receivers or senders of streams

    Scenario: Address book name showing up in - Stream details page
        Given Address book test data is set up

        Given "Ended stream details page" is open without connecting a wallet
        Then "Static Balance Account" is shown as the "sender" of the stream in the stream details page
        Then "Multiple networks test" is shown as the "receiver" of the stream in the stream details page

    Scenario: Address book name showing up in - Send stream form
        Given Address book test data is set up

        Given "Send Page" is open with "bob" connected on "polygon"
        And User searches for "Multiple networks test" as a receiver and selects it
        Then Chosen wallet address shows up as Multiple networks test

    Scenario Outline: Address book name showing up in - Activity history page - <activity>
        Given Address book test data is set up
        And Activity history request is mocked to "<activity>" on "polygon"
        And "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then The activity rows address shows up as "john"

        Examples:
            | activity              |
            | Distribution Claimed  |
            | Send Transfer         |
            | Liquidated            |
            | Subscription Updated  |
            | Stream Cancelled      |
            | Stream Updated        |
            | Receive Stream        |
            | Receive Transfer      |
            | Send Stream           |
            | Send Transfer         |
            | Subscription Rejected |
            | Subscription Approved |

    Scenario: Address book name filter
        Given Address book test data is set up

        Given "Address Book Page" is open with "john" connected on "polygon"
        And User opens the address filter
        And User searches for "Polygon" in the address filter
        And User selects "Polygon" from the address filter
        Then Only address names containing "Polygon" are visible
        And User clears the address book filter by using the clear all chip
        Then The imported addresses are shown correctly
        And User selects "Polygon" from the address filter
        Then Only address names containing "Polygon" are visible
        And User clears the "Polygon" filter by using the clear button by the specific chip
        Then The imported addresses are shown correctly
        And User clears the address book search field
        And User searches for "TestIfNoResultsBreakStuff" in the address filter
        Then No addresses are shown in the address book filter dropdown
