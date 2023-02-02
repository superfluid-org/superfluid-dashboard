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
    And User inputs "0.8" into the unwrap field
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
