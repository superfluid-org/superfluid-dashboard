Feature: Distribution transaction test cases

  @numTestsKeptInMemory(0)
  Scenario: Approving a subscription
    Given Transactional account number 1 is connected to the dashboard on goerli
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
    Given Transactional account number 1 is connected to the dashboard on goerli
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