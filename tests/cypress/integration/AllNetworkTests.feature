@hourly
@numTestsKeptInMemory(0)
Feature: Test cases that run indefinitely on all supported networks

  # Expected balances are read live from each network's Superfluid RPC and
  # compared with what the UI renders, so this scenario needs no wallet top-up.
  #
  # Most of these networks have deliberately never been funded, and that is fine:
  # this is a smoke test of network switching, page render and the token list, so
  # asserting "Balance: 0" still proves the app fetched and rendered a balance
  # instead of hanging or erroring. Only the networks in
  # NETWORKS_EXPECTED_TO_HOLD_A_BALANCE (see support/helpers/liveBalances.ts) are
  # meant to carry funds; if one of those reads 0 the run logs an "UNFUNDED"
  # warning. Topping it up restores non-zero coverage but is never required.
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
      | gnosis         | XDAI  |
      | polygon        | POL   |
      | optimism       | ETH   |
      | arbitrum-one   | ETH   |
      | avalanche      | AVAX  |
      | bsc            | BNB   |
      | celo           | CELO  |
      | sepolia        | ETH   |
      | base           | ETH   |
      | scroll         | ETH   |
      | opsepolia      | ETH   |

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
      | opsepolia      |

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
      | opsepolia      |


# Mumbai down, no faucet gg
# Scenario: Testnet faucet fund check
#     Given The faucet contract has got enough funds to send to people
