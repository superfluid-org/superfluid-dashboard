@rejected
Feature: Stream transactional rejected test cases

  Scenario: Creating a new stream
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "fUSDCx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Modifying a stream
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Cancelling a stream
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to cancel the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

