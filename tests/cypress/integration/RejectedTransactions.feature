@ignoreDuringUI @rejected @numTestsKeptInMemory(0)
Feature:Transactional rejected test cases

  Scenario: Creating a new stream on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "send" navigation button
    And User inputs all the details to send "1" "TokenTwox" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "selected network"
    And Transaction rejected error is shown

  Scenario: Modifying a stream on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "TokenOnex" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to start or modify the stream and the first transaction dialogs are visible on "selected network"
    And Transaction rejected error is shown

  Scenario: Cancelling a stream on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "send" navigation button
    And User inputs all the details to send "2" "TokenOnex" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User tries to cancel the stream and the first transaction dialogs are visible on "selected network"
    And Transaction rejected error is shown

  Scenario: Wrapping network native tokens on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "wrap-unwrap" navigation button
    And User wraps the "0.01" of the selected token
    And Transaction dialog for selected network is shown wrapping 0.01 TokenGas
    And Transaction rejected error is shown

  Scenario: Unwrapping network native token on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User unwraps the "0.01" of the selected token
    And Transaction dialog for selected network is shown unwrapping 0.01 TokenGas
    And Transaction rejected error is shown

  Scenario: Wrapping normal underlying tokens on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "TokenTwo" to wrap
    And User inputs "0.01" into the wrap field
    And User wraps the "0.01" of the selected token
    And Transaction dialog for selected network is shown wrapping 0.01 TokenTwo
    And Transaction rejected error is shown

  Scenario: Unwrapping normal super tokens on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "wrap-unwrap" navigation button
    And User switches to unwrap tab
    And User opens the token selection in the wrap page
    And User chooses "TokenTwox" to wrap
    And User unwraps the "0.01" of the selected token
    And Transaction dialog for selected network is shown unwrapping 0.01 TokenTwo
    And Transaction rejected error is shown

  Scenario: Giving approval to tokens on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User clicks on the "wrap-unwrap" navigation button
    And User opens the token selection in the wrap page
    And User chooses "TokenOne" to wrap
    And User inputs "0.01" into the wrap field
    And User approves the protocol to use "TokenOne"
    And Transaction dialog for selected network is shown approving allowance of 0.01 TokenOne
    And Transaction rejected error is shown

  Scenario: Approving a subscription on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User opens "selected network" "TokenOnex" individual token page
    And User opens the distributions tab
    And User approves the last index distributions
    And Distribution approval dialog on "selected network" shows up
    And Transaction rejected error is shown

  Scenario: Revoking a subscription on selected network
    Given Transactional account john is connected to the dashboard on selected network
    And User opens "selected network" "TokenTwox" individual token page
    And User opens the distributions tab
    And User revokes the last index distributions
    And Distribution revoking dialog on "selected network" shows up
    And Transaction rejected error is shown
