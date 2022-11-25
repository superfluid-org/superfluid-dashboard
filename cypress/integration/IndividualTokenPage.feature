Feature: Token page test cases

  Scenario: Token balances and net flows
    Given "Dashboard Page" is open with a mocked connection to "ongoingStreamAccount" on "polygon-mumbai"
    And User connects their wallet to the dashboard
    And User opens "goerli" "fDAIx" individual token page
    Then Token symbol name, icons and liquidation date in token page are shown correctly for "fDAIx" on "goerli"
    And "fDAIx" net flow balances are shown correctly for "ongoingStreamAccount" on "goerli"

  Scenario: Streams table in token page
    Scenario: Distributions table in token page
      Scenario: Transfers table in token page
        Scenario: Wrap/Unwrap buttons in tokens page
          Scenario: Token page working correctly in view mode