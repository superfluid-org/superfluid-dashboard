@hourly
Feature: Test cases that run indefinitely on all supported networks

  Scenario Outline: Smoke testing RPC and Graph in Wrap page on <network>
    Given "Wrap Page" is open using view mode to look at "staticBalanceAccount"
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
      | celo            | CELO   |


  Scenario Outline: Superfluid RPCS are not behind on <network>
    Given Superfluid RPCs are not more then 10 minutes behind on <network>
    Examples:
      | network        |
      | goerli         |
      | polygon-mumbai |
      | avalanche-fuji |
      | gnosis         |
      | polygon        |
      | optimism       |
      | arbitrum-one   |
      | avalanche      |
      | bsc            |
      | celo           |

  Scenario Outline: The graph is not behind on <network>
    Given The graph is not more then 10 minutes behind on <network>
    Examples:
      | network        |
      | goerli         |
      | polygon-mumbai |
      | avalanche-fuji |
      | gnosis         |
      | polygon        |
      | optimism       |
      | arbitrum-one   |
      | avalanche      |
      | bsc            |
      | celo           |