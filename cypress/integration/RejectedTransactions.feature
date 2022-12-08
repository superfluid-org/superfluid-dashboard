@rejected @numTestsKeptInMemory(0)
Feature:Transactional rejected test cases

  Scenario: Creating a new stream on goerli
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "fUSDCx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Modifying a stream on goerli
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Cancelling a stream on goerli
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "fDAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to cancel the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

    ##Polygon ones , for now just for 1 network , but should create something more dynamic to use on all networks
  Scenario: Creating a new stream on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "USDCx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Modifying a stream on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "DAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Cancelling a stream on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "DAIx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to cancel the stream and the first transaction dialogs are visible on "polygon"
    And Transaction rejected error is shown

  Scenario: Wrapping network native tokens on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User wraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown wrapping 0.1 MATIC
    And Transaction rejected error is shown

  Scenario: Unwrapping network native token on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown unwrapping 0.1 MATIC
    And Transaction rejected error is shown


  Scenario: Wrapping normal underlying tokens on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "USDC" to wrap
    And User inputs "0.1" into the wrap field
    And User wraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown wrapping 0.1 USDC
    And Transaction rejected error is shown

  Scenario: Unwrapping normal super tokens on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User opens the token selection in the wrap page
    And User chooses "USDCx" to wrap
    And User unwraps the "0.1" of the selected token
    And Transaction dialog for polygon is shown unwrapping 0.1 USDC
    And Transaction rejected error is shown

  Scenario: Giving approval to tokens on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "DAI" to wrap
    And User inputs "0.1" into the wrap field
    And User approves the protocol to use "DAI"
    And Transaction dialog for polygon is shown approving allowance of 0.1 DAI
    And Transaction rejected error is shown

  Scenario: Approving a subscription on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User opens "polygon" "MATICx" individual token page
    And User opens the distributions tab
    And User approves the last index distributions
    And Distribution approval dialog on "polygon" shows up
    And Transaction rejected error is shown

  Scenario: Revoking a subscription on polygon
    Given Transactional account john is connected to the dashboard on polygon
    And User opens "polygon" "USDCx" individual token page
    And User opens the distributions tab
    And User revokes the last index distributions
    And Distribution revoking dialog on "polygon" shows up
    And Transaction rejected error is shown
