@ignoreDuringUI
@Gnosis
Feature: Gnosis safe test cases

    Scenario Outline: Gnosis safe connecting to dashboard on <network>
        Given Gnosis safe Superfluid app is open on "<network>"
        And Dashboard page is visible in the gnosis app
        #And User connects their wallet in the gnosis app
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
            | celo         |

    Scenario Outline: Gnosis safe - adding superfluid as a custom app <network>
        Given Gnosis safe custom app page is open on "<network>"
        And User tries to add Superfluid as a custom app
        And Manifest is loaded correctly and user accepts the warning and adds the app
        Then Superfluid app is visible on the custom app page

        Examples:
            | network      |
            | gnosis       |
            | ethereum     |
            | polygon      |
            | bsc          |
            | arbitrum-one |
            | avalanche    |
            | optimism     |
            | celo         |
