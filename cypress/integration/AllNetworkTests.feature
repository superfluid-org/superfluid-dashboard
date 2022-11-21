@hourly
Feature: Test cases that run indefinitely on all supported networks

  Scenario Outline: Smoke testing RPC and Graph in Wrap page
    Given "Dashboard Page" is open without connecting a wallet
    Given User uses view mode to look at "staticBalanceAccount"
    And User clicks on the "wrap-unwrap" navigation button
    And User changes their network to "<network>"
    Then The native token "<token>" balance for "staticBalanceAccount" on "<network>" is shown under the token selection button
    And User opens the token selection in the wrap page
    And The could not find any tokens message is not shown
    Then The native token "<token>" balance for "staticBalanceAccount" on "<network>" in the token list
    Examples:
      | network        | token |
      | goerli         | ETH   |
      | polygon-mumbai | MATIC |
      | avalanche-fuji | AVAX  |
      | gnosis         | XDAI  |
      | polygon        | MATIC |
      | optimism       | ETH   |
      | arbitrum-one   | ETH   |
      | avalanche      | AVAX  |
      | bsc            | BNB   |

