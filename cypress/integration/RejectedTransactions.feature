@rejected
Feature: Stream transactional rejected test cases on goerli

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

    ##Polygon ones , for now just for 1 network , but should create something more dynamic to use on all networks
  Scenario: Creating a new stream
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "USDCx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Modifying a stream
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "DAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Cancelling a stream
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "DAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to cancel the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Wrapping network native tokens
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User wraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown wrapping 0.1 MATIC
    And Transaction rejected error is shown

  Scenario: Unwrapping network native token
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown unwrapping 0.1 MATIC
    And Transaction rejected error is shown


  Scenario: Wrapping normal underlying tokens
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "DAI" to wrap
    And User inputs "0.1" into the wrap field
    And User approves the protocol to use "0.1" "USDC" on "polygon" if necessary
    And User wraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown wrapping 0.1 DAI
    And Transaction rejected error is shown


  Scenario: Unwrapping normal super tokens
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User opens the token selection in the wrap page
    And User chooses "USDCx" to wrap
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown unwrapping 0.1 USDC
    And Transaction rejected error is shown
