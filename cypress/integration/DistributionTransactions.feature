Feature: Distribution transaction test cases

  @numTestsKeptInMemory(0)
  Scenario: Approving a subscription
    Given Transactional account is connected to the dashboard on goerli
    And User opens "goerli" "fDAIx" individual token page
    And User opens the distributions tab
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Awaiting Approval" "now"
    And User approves the last index distributions
    And The first row in the table shows "Approving..." pending transaction status
    And The transaction drawer shows a pending "Approve Index Subscription" transaction on "goerli"
    And The restore button is not visible for the last transaction
    And The transaction drawer shows a succeeded "Approve Index Subscription" transaction on "goerli"
    And The first row in the table shows "Syncing..." pending transaction status
    And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Approved" "now"
    And The restore button is not visible for the last transaction
    And The last distribution row has got a revoke subscription button

  @numTestsKeptInMemory(0)
  Scenario: Revoking a subscription
      Given Transactional account is connected to the dashboard on goerli
      And User opens "goerli" "fDAIx" individual token page
      And User opens the distributions tab
      And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Approved" "now"
      And User revokes the last index distributions
      And The first row in the table shows "Revoking..." pending transaction status
      And The transaction drawer shows a pending "Revoke Index Subscription" transaction on "goerli"
      And The restore button is not visible for the last transaction
      And The transaction drawer shows a succeeded "Revoke Index Subscription" transaction on "goerli"
      And The first row in the table shows "Syncing..." pending transaction status
      And The last distribution row is from "0x39aA80Fc05eD0b3549be279589Fc67f06b7e35EE" with "0" received with "Awaiting Approval" "now"
      And The restore button is not visible for the last transaction
      And The last distribution row has got a approve subscription button