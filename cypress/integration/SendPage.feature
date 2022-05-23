Feature: Send Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Send Page" is open without connecting a wallet
    And User fills all stream inputs
    And Stream ending on and amount per second is shown correctly
    And Stream preview is shown correctly
    And User accepts the risk warning
    Then Send button is enabled and asks user to Connect their wallet

  Scenario: Receiver dialog ENS support
    Given "Send Page" is open without connecting a wallet
    And User searches for "vijay.eth" as a receiver
    Then "0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac" is visible in the ENS recipient results
    And User selects the first ENS recipient result
    Then Chosen ENS receiver wallet address shows vijay.eth and 0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac
    And User clears the receiver field with the close button
