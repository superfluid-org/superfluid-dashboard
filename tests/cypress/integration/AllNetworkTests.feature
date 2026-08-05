@hourly
@numTestsKeptInMemory(0)
Feature: Test cases that run indefinitely on all supported networks

  # The expected balances are read live from each network's Superfluid RPC and
  # compared with what the UI renders, so this scenario needs no wallet top-up to
  # stay green. But on a network where the wallet holds nothing the assertion only
  # proves the UI can render "0"; every such network logs a "VACUOUS ASSERTION"
  # warning in the run output. Fund staticBalanceAccount
  # (0x8ac9C6D444D12d20BC96786243Abaae8960D27e2) on those networks to turn them
  # back into real checks.
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
      | opsepolia      |
      | degenchain     |


# Mumbai down, no faucet gg
# Scenario: Testnet faucet fund check
#     Given The faucet contract has got enough funds to send to people