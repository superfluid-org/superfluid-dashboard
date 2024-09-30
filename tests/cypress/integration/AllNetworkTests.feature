@hourly
@numTestsKeptInMemory(0)
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
      | avalanche-fuji | AVAX  |
      | gnosis         | xDAI  |
      | polygon        | POL   |
      | optimism       | ETH   |
      | arbitrum-one   | ETH   |
      | avalanche      | AVAX  |
      | bsc            | BNB   |
      | celo           | CELO  |
      | sepolia        | ETH   |
      | base           | ETH   |
      | scroll         | ETH   |
      | scrsepolia     | ETH   |
      | opsepolia      | ETH   |
      | degen          | DEGEN |

  Scenario Outline: Superfluid RPCS are not behind on <network>
    Given Superfluid RPCs are not more then 10 minutes behind on <network>

    Examples:
      | network        |
      | avalanche-fuji |
      | gnosis         |
      | polygon        |
      | optimism       |
      | arbitrum-one   |
      | avalanche      |
      | bsc            |
      | celo           |
      | sepolia        |
      | base           |
      | scroll         |
      | scrsepolia     |
      | opsepolia      |
      | degenchain     |

  Scenario Outline: The graph is not behind on <network>
    Given The graph is not more then 10 minutes behind on <network>

    Examples:
      | network        |
      | avalanche-fuji |
      | gnosis         |
      | polygon        |
      | optimism       |
      | arbitrum-one   |
      | avalanche      |
      | bsc            |
      | celo           |
      | sepolia        |
      | base           |
      | scroll         |
      | scrsepolia     |
      | opsepolia      |
      | degenchain     |


# Mumbai down, no faucet gg
# Scenario: Testnet faucet fund check
#     Given The faucet contract has got enough funds to send to people