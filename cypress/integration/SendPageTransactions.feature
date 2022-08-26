Feature: Stream transactional test cases

  @numTestsKeptInMemory(0)
  Scenario: Creating a new stream
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User cancels the stream if necessary
    And User starts the stream and the transaction dialogs are visible for "goerli"
    And User goes to the token page from the transaction dialog
    And User opens the transaction drawer
    And The transaction drawer shows a pending "Create Stream" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The first row in the table shows "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" "receiving" an "ongoing" stream of "1" token per month since "now"
    And The first stream row in the table shows "Sending..." pending transaction status
    And The transaction drawer shows a succeeded "Create Stream" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The first stream row in the table shows "Syncing..." pending transaction status
    And User restores the last transaction
    Then All the details to send "1" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" on "goerli" are set in the fields

  @numTestsKeptInMemory(0)
  Scenario: Modifying a stream
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User starts or cancels the stream if necessary
    And User modifies the stream and the transaction dialogs are visible for "goerli"
    And User goes to the token page from the transaction dialog
    And User opens the transaction drawer
    And The transaction drawer shows a pending "Update Stream" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Update Stream" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The first row in the table shows "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" "receiving" an "ongoing" stream of "2" token per month since "now"
    And User restores the last transaction
    Then All the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" on "goerli" are set in the fields

  @numTestsKeptInMemory(0)
  Scenario: Cancelling a stream
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User starts the stream if necessary
    And User cancels the stream and the transaction dialogs are visible for "goerli"
    And User clicks the OK button
    And User opens the transaction drawer
    And User clicks on the "dashboard" navigation button
    And The transaction drawer shows a pending "Close Stream" transaction on "goerli"
    And The restore button is not visible for the last transaction
    And User clicks on "goerli" "fDAIx" row
    And There are 5 stream rows visible
    And The first stream row in the table shows "Canceling..." pending transaction status
    And The transaction drawer shows a succeeded "Close Stream" transaction on "goerli"
    And The restore button is not visible for the last transaction
    And The first stream row in the table shows "Syncing..." pending transaction status
    And The first row does not have a pending transaction status
    And There are no cancel or modify buttons in the last stream row
    And The amount sent for the last stream in the table is not flowing
    And The netflow and incomming/outgoing amounts in the dashboard page for "fDAIx" on "goerli" are "-"
    And The first row in the table shows "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" "receiving" an "ongoing" stream of "0" token per month since "now"

Feature: Wrapping and Unwrapping transactional test cases

  @numTestsKeptInMemory(0)
  Scenario: Wrapping network native tokens
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "wrap-unwrap" navigation button
    And User wraps the "0.1" of the selected token
    And Transaction dialog for goerli is shown wrapping 0.1 ETH
    And Wrap transaction broadcasted message is shown
    And User clicks on the go to tokens page button from tx dialog
    And The transaction drawer shows a pending "Wrap to Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Wrap to Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And Users super token balance of "ETHx" on "goerli" increases by "0.1" in the dashboard page
    And User restores the last transaction
    Then Wrap field input field has "0.1" written in it
    And The token balances after wrapping "0.1" tokens are correctly shown in the wrap page

  @numTestsKeptInMemory(0)
  Scenario: Unwrapping network native token
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for goerli is shown unwrapping 0.1 ETH
    And Transaction broadcasted message with ok button is shown
    And User clicks the OK button
    And User opens the transaction drawer
    And The transaction drawer shows a pending "Unwrap from Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Unwrap from Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And User clicks on the "dashboard" navigation button
    And Users super token balance of "ETHx" on "goerli" decreases by "0.1" in the dashboard page
    And User restores the last transaction
    Then Unwrap field input field has "0.1" written in it
    And The token balances after wrapping "0.1" tokens are correctly shown in the unwrap page

  @numTestsKeptInMemory(0)
  Scenario: Wrapping normal underlying tokens
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "fUSDC" to wrap
    And User inputs "0.1" into the wrap field
    And User approves the protocol to use "0.1" "fUSDC" on "goerli" if necessary
    And User wraps the "0.1" of the selected token
    And Transaction dialog for goerli is shown wrapping 0.1 fUSDC
    And Wrap transaction broadcasted message is shown
    And User clicks on the go to tokens page button from tx dialog
    And The transaction drawer shows a pending "Wrap to Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Wrap to Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And Users super token balance of "fUSDCx" on "goerli" increases by "0.1" in the dashboard page
    And User restores the last transaction
    Then Wrap field input field has "0.1" written in it
    And The token balances after wrapping "0.1" tokens are correctly shown in the wrap page

  @numTestsKeptInMemory(0)
  Scenario: Unwrapping normal super tokens
    Given Transactional account is connected to the dashboard on goerli
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User opens the token selection in the wrap page
    And User chooses "fUSDCx" to wrap
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for goerli is shown unwrapping 0.1 fUSDC
    And Transaction broadcasted message with ok button is shown
    And User clicks the OK button
    And User opens the transaction drawer
    And The transaction drawer shows a pending "Unwrap from Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Unwrap from Super Token" transaction on "goerli"
    And The restore button is visible for the last transaction
    And User clicks on the "dashboard" navigation button
    And Users super token balance of "fUSDCx" on "goerli" decreases by "0.1" in the dashboard page
    And User restores the last transaction
    Then Unwrap field input field has "0.1" written in it
    And The token balances after wrapping "0.1" tokens are correctly shown in the unwrap page

Feature: Distribution transaction test cases

  @numTestsKeptInMemory(0)
  Scenario: Approving a subscription
    Given Transactional account is connected to the dashboard on goerli
    And User opens "goerli" "fDAIx" individual token page
    And User opens the distributions tab
    And User revokes the last index distribution if necessary
    And User approves the last index distributions
    And Distribution approval dialog on "goerli" shows up and user closes it
    And The first distribution row in the table shows "Approving..." pending transaction status
    And User opens the transaction drawer
    And The transaction drawer shows a pending "Approve Index Subscription" transaction on "goerli"
    And The restore button is not visible for the last transaction
    And The transaction drawer shows a succeeded "Approve Index Subscription" transaction on "goerli"
    And The first distribution row in the table shows "Syncing..." pending transaction status
    And There is no pending status for the first distribution row
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Approved" "now"
    And The table shows "1" total distributions "1" approved and "0" unapproved
    And The restore button is not visible for the last transaction
    And The last distribution row has got a revoke subscription button
    And User opens the approved distribution tab
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Approved" "now"
    And User opens the unapproved distribution tab
    Then No data row is shown

  @numTestsKeptInMemory(0)
  Scenario: Revoking a subscription
    Given Transactional account is connected to the dashboard on goerli
    And User opens "goerli" "fDAIx" individual token page
    And User opens the distributions tab
    And User approves the last index distribution if necessary
    And User revokes the last index distributions
    And Distribution revoking dialog on "goerli" shows up and user closes it
    And User opens the transaction drawer
    And The first distribution row in the table shows "Revoking..." pending transaction status
    And The transaction drawer shows a pending "Revoke Index Subscription" transaction on "goerli"
    And The restore button is not visible for the last transaction
    And The transaction drawer shows a succeeded "Revoke Index Subscription" transaction on "goerli"
    And The first distribution row in the table shows "Syncing..." pending transaction status
    And There is no pending status for the first distribution row
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Awaiting Approval" "now"
    And The table shows "1" total distributions "0" approved and "1" unapproved
    And The restore button is not visible for the last transaction
    And The last distribution row has got a approve subscription button
    And User opens the unapproved distribution tab
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Awaiting Approval" "now"
    And User opens the approved distribution tab
    Then No data row is shown