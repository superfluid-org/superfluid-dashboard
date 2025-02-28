@numTestsKeptInMemory(0)
Feature: Transfer transactional test cases

  Scenario: Send transfer
    Given "Transfer Page" is open with "bob" connected on "opsepolia"
    And User inputs all the details to send "1" "fDAIx" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User sends the transfer and the transaction dialogs are visible for "opsepolia"
    And User opens the transaction drawer
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Send Transfer" transaction on "opsepolia"
    And The restore button is visible for the last transaction
    And The first row does not have a pending transfer transaction status
    And User restores the last transaction
    Then All the details to send "1" "fDAIx" to "elvijs.eth" on "opsepolia" are set in the fields
