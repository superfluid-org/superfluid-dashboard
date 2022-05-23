Feature: Common element test cases

#  Scenario: Switching between pages using navigation drawer
#    Given "Dashboard page" is open without connecting a wallet
#    And User clicks on the "dashboard" navigation button
#    Then Dashboard page is open when users wallet is not connected
#    And User clicks on the "wrap-unwrap" navigation button
#    Then Wrap/Unwrap page is open and the wrap container is visible
#    And User clicks on the "send" navigation button
#    Then Send page is open and the send container is visible

  Scenario: Testing mocked web3 provider
    #Given "Dashboard page" is open without connecting a wallet
    Given "Dashboard page" is open with a mocked web3 provider
    #And User clicks on the connect wallet button
    Then Wait for 10 seconds
