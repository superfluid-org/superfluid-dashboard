@numTestsKeptInMemory(0)
@retries(5)
Feature: Stream transactional test cases

    Scenario: Creating a new stream
        Given The "fDAIx" stream from "bob" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" on "polygon-mumbai" is cancelled

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"
        And User inputs all the details to send "1" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User starts the stream and the transaction dialogs are visible for "polygon-mumbai"
        And User goes to the token page from the transaction dialog
        And User opens the transaction drawer
        And The transaction drawer shows a pending "Send Stream" transaction on "polygon-mumbai"
        And The restore button is visible for the last transaction
        And The first row in the table shows "elvijs.lens" "receiving" an "ongoing" stream of "1" token per month since "now"
        And The first stream row in the table shows "Sending" pending transaction status
        And The transaction drawer shows a succeeded "Send Stream" transaction on "polygon-mumbai"
        And The restore button is visible for the last transaction
        And The first stream row in the table shows "Syncing" pending transaction status
        And The first row does not have a pending transaction status
        And User restores the last transaction
        Then All the details to send "1" "fDAIx" per "month" to "elvijs.lens" on "polygon-mumbai" are set in the fields

    Scenario: Modifying a stream
        Given The "fDAIx" stream from "bob" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" on "polygon-mumbai" is running

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"
        And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User modifies the stream and the transaction dialogs are visible for "polygon-mumbai"
        And User goes to the token page from the transaction dialog
        And User opens the transaction drawer
        And The transaction drawer shows a pending "Update Flow Rate" transaction on "polygon-mumbai"
        And The restore button is visible for the last transaction
        And The transaction drawer shows a succeeded "Update Flow Rate" transaction on "polygon-mumbai"
        And The restore button is visible for the last transaction
        And The first row in the table shows "elvijs.lens" "receiving" an "ongoing" stream of "2" token per month since "now"
        And User restores the last transaction
        Then All the details to send "2" "fDAIx" per "month" to "elvijs.lens" on "polygon-mumbai" are set in the fields

    Scenario: Cancelling a stream
        Given The "fDAIx" stream from "bob" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" on "polygon-mumbai" is running

        Given "Send Page" is open with "bob" connected on "polygon-mumbai"
        And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        And User cancels the stream and the transaction dialogs are visible for "polygon-mumbai"
        And User clicks the OK button
        And User opens the transaction drawer
        And User clicks on the "dashboard" navigation button
        And The transaction drawer shows a pending "Cancel Stream" transaction on "polygon-mumbai"
        And The restore button is not visible for the last transaction
        And User clicks on "polygon-mumbai" "fDAIx" row
        And There are 5 stream rows visible
        And The first stream row in the table shows "Canceling" pending transaction status
        And The transaction drawer shows a succeeded "Cancel Stream" transaction on "polygon-mumbai"
        And The restore button is not visible for the last transaction
        And The first stream row in the table shows "Syncing" pending transaction status
        And The first row does not have a pending transaction status
        And There are no cancel or modify buttons in the last stream row
        And The amount sent for the last stream in the table is not flowing
        And The netflow and incomming/outgoing amounts in the dashboard page for "fDAIx" on "polygon-mumbai" are "-"
        And The first row in the table shows "elvijs.lens" "receiving" an "ongoing" stream of "0" token per month since "now"
