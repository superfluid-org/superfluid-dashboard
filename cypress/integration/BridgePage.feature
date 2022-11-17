Feature: Bridge page test cases (Li-Fi widget)

  @only
  Scenario: Routes and connect wallet button showing up for a user without a connected wallet
    Given "Dashboard page" is open without connecting a wallet
    And User clicks on the "bridge" navigation button
    And User chooses "MKR" token to swap "From" on "Polygon"
    And User chooses "MKRx" token to swap "To" on "Polygon"
    And User inputs "1" into the swap amount
    And The You pay section shows the correct token and network icons
    And Token swapping route for is correctly shown
    And Connect wallet button is visible

  @only
  Scenario: Routes and swap button showing up for a user with a connected wallet but with no balance for it
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "bridge" navigation button
    And User chooses "MKR" token to swap "From" on "Polygon"
    And User chooses "MKRx" token to swap "To" on "Polygon"
    And Token swapping route for is correctly shown
    And Review swap button is disabled
    And Not enough funds error is shown

  Scenario: Choosing a token with a default icon does not crash the page
    Given Dashboard page is open when wallet of the user is not connected
    And User clicks on the "bridge" navigation button
    And User chooses "idleWETHx" token to swap "From" on "Polygon"
    And User chooses "idleWETHYield" token to swap "To" on "Polygon"
    And User inputs "1" into the swap amount
    And You pay section icon for a token without icon is shown correctly
    And Token swapping route for is correctly shown for a token that has no icon

    ##View mode
  ##History page
  ##Refreshing routes
  ##Extra routes page
  ##Send To different wallet
  ##LIFI-hyperlink
  ##Settings page
