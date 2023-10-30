Feature: Activity History Page tests

    Scenario: Activity history page entries shown for all networks in the correct order
        Given Activity history request is mocked to "all activities" on "polygon"

        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then Mocked activity history entries are visible in this order
            | Distribution Claimed  |
            | Distribution Claimed  |
            | Send Distribution     |
            | Send Distribution     |
            | Unwrap                |
            | Unwrap                |
            | Liquidated            |
            | Liquidated            |
            | Send Transfer         |
            | Liquidated            |
            | Subscription Updated  |
            | Subscription Updated  |
            | Stream Cancelled      |
            | Stream Updated        |
            | Receive Stream        |
            | Receive Transfer      |
            | Send Stream           |
            | Send Transfer         |
            | Wrap                  |
            | Subscription Rejected |
            | Subscription Rejected |
            | Index Created         |
            | Subscription Approved |
            | Subscription Approved |

    Scenario: No activity history message shown
        Given "Activity history page" is open without connecting a wallet
        Then No activity history message is shown

    Scenario: Enabling and disabling filters
        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        And User changes the activity history filter to 25 months before
        And User closes the dropdown
        And User opens activity filter
        And User clicks on the "Wrap / Unwrap" toggle in the activity filter
        And User closes the dropdown
        And No loading skeletons are visible in the page
        Then No "Wrap" activities are shown in the activity history
        And User opens activity filter
        And User clicks on the "Wrap / Unwrap" toggle in the activity filter
        And No loading skeletons are visible in the page
        Then Activity history entries with "Wrap" are visible

    Scenario: Filtering entries by address
        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        And User changes the activity history filter to 24 months before
        And User closes the dropdown
        And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
        And User waits for the activity history to load
        Then Only the activity history entries with "elvijs.lens" are shown

    Scenario: Enabling and disabling networks visible
        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        And User changes the activity history filter to 25 months before
        And User closes the dropdown
        And Activity rows for "arbitrum-one" are visible
        And User opens the network selection dropdown
        And User clicks on the "arbitrum-one" toggle
        Then No "arbitrum-one" activity rows are visible
        And User clicks on the "arbitrum-one" toggle
        Then Activity rows for "arbitrum-one" are visible

    Scenario: Copying address from the activity history
        Given Activity history request is mocked to "Receive Stream" on "polygon"

        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then Mocked "Receive Stream" entry on "polygon" is shown in the activity history
        And User hover on the first address element in the activity history table
        Then The copy tooltip shows "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
        And User clicks on the shown tooltip
        Then The copy tooltip shows "Copied to clipboard!"

    @mocked
    Scenario Outline: <activity> shown in the activity history page
        Given Activity history request is mocked to "<activity>" on "polygon"

        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then Mocked "<activity>" entry on "polygon" is shown in the activity history

        Examples:
            | activity                         |
            | Liquidated/v1                    |
            | Liquidated/v2                    |
            | Liquidated/sender                |
            | Receive Stream                   |
            | Stream Cancelled                 |
            | Send Stream                      |
            | Wrap                             |
            | Unwrap/wrapper                   |
            | Unwrap/native                    |
            | Receive Transfer                 |
            | Send Transfer                    |
            | Stream Updated                   |
            | Subscription Approved/Publisher  |
            | Subscription Approved/Subscriber |
            | Subscription Updated/Publisher   |
            | Subscription Updated/Subscriber  |
            | Subscription Rejected/Publisher  |
            | Subscription Rejected/Subscriber |
            | Index Created                    |
            | Send Distribution/Subscriber     |
            | Send Distribution/Publisher      |
            | Distribution Claimed/Publisher   |
            | Distribution Claimed/Subscriber  |
