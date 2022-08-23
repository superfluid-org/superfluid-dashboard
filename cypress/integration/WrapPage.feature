Feature: Wrap page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Wrap Page" is open without connecting a wallet
    And The upgrade button is disabled
    And User inputs "1" into the wrap field
    Then Connect wallet button is visible in the wrap/unwrap page
    And User switches to unwrap tab
    Then Connect wallet button is visible in the wrap/unwrap page
    And User switches to wrap tab
    Then Connect wallet button is visible in the wrap/unwrap page

  @broken @skip
  Scenario: Token balances shown for a user with a connected wallet
    Given "Wrap Page" is open with a mocked connection to "staticBalanceAccount" on "polygon"
    And User connects their wallet to the dashboard
    Then The "MATIC" balance is shown correctly on "polygon"
    And User opens the token selection in the wrap page
    Then The underlying token balances in the wrap token dialog are shown correctly on "polygon"
    And None of the tokens shown have got an animation around them
    And User chooses "MATIC" to wrap
    And User switches to unwrap tab
    And User opens the token selection in the wrap page
    Then The super token balances in the unwrap token dialog are shown correctly on "polygon"
    And All tokens have an animation around them
    And User chooses "USDCx" to wrap
    Then The "USDC" balance is shown correctly on "polygon"


  Scenario: Wrong network warnings in the wrap page
    Given "Wrap Page" is open with a mocked connection to "staticBalanceAccount" on "polygon"
    And User connects their wallet to the dashboard
    And User changes their network to "gnosis"
    And User inputs "0.5" into the wrap field
    And Change network button is visible with a message asking user to switch to "gnosis"
    And User switches to unwrap tab
    And User inputs "1" into the unwrap field
    And Change network button is visible with a message asking user to switch to "gnosis"


  Scenario: View mode warnings in wrap page
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "ongoingStreamAccount"
    And User clicks on the "wrap-unwrap" navigation button
    And User inputs "1" into the wrap field
    Then The stop viewing as an address button is visible
    And User switches to unwrap tab
    And User inputs "1" into the unwrap field
    Then The stop viewing as an address button is visible
    And User clicks on the stop viewing as an address button
    Then Connect wallet button is visible in the wrap/unwrap page
    And View mode chip does not exist

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

   @only
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


