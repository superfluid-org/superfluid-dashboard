@ignoreDuringUI @Gnosis
Feature: Gnosis safe test cases

  Scenario Outline: Gnosis safe connecting to dashboard on <network>
    Given Gnosis safe is open on "<network>"
    And Dashboard page is visible in the gnosis app
    And User connects their wallet in the gnosis app
    Then The correct wallet is connected to the gnosis app on "<network>"
    Examples:
      | network      |
      | gnosis       |
      | ethereum     |
      | polygon      |
      | bsc          |
      | arbitrum-one |
      | avalanche    |
      | optimism     |
      | goerli       |
