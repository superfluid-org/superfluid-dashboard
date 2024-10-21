Feature: Transfer transactional test cases

  Scenario: Send transfer
    Given "Transfer Page" is open with "bob" connected on "opsepolia"
    And User inputs all the details to send "1" "fDAIx" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the send transfer button
