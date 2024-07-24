@hourly
@numTestsKeptInMemory(0)
Feature: Test cases that run indefinitely on all supported networks

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
            | degen          |

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
            | degen          |


# Mumbai down, no faucet gg
# Scenario: Testnet faucet fund check
#     Given The faucet contract has got enough funds to send to people