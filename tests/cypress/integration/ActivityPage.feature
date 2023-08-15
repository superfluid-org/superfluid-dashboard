Feature: Activity History Page tests

    Scenario: Activity history page entries shown for all networks in the correct order
        Given Activity history request is mocked to "all activities" on "polygon"

        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then Mocked activity history entries are visible in this order
            | Distribution Claimed  |
            | Send Distribution     |
            | Unwrap                |
            | Send Transfer         |
            | Liquidated            |
            | Subscription Updated  |
            | Stream Cancelled      |
            | Stream Updated        |
            | Receive Stream        |
            | Receive Transfer      |
            | Send Stream           |
            | Send Transfer         |
            | Wrap                  |
            | Subscription Rejected |
            | Index Created         |
            | Subscription Approved |

    Scenario: No activity history message shown
        Given "Activity history page" is open without connecting a wallet
        Then No activity history message is shown

    @skip
    Scenario: Enabling and disabling filters
        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        And User changes the activity history filter to 10 months before
        And User closes the dropdown
        And User opens activity filter
        And User clicks on the "Wrap" toggle in the activity filter
        And User closes the dropdown
        Then No "Wrap" activities are shown in the activity history
        And User opens activity filter
        And User clicks on the "Wrap" toggle in the activity filter
        Then Activity history entries with "Wrap" are visible

    Scenario: Filtering entries by address
        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        And User changes the activity history filter to 25 months before
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

    @mocked
    Scenario Outline: <activity> shown in the activity history page
        Given Activity history request is mocked to "<activity>" on "polygon"

        Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
        Then Mocked "<activity>" entry on "polygon" is shown in the activity history

        Examples:
            | activity              |
            | Liquidated            |
            | Receive Stream        |
            | Stream Cancelled      |
            | Send Stream           |
            | Wrap                  |
            | Unwrap                |
            | Receive Transfer      |
            | Send Transfer         |
            | Stream Updated        |
            | Subscription Approved |
            | Subscription Updated  |
            | Subscription Rejected |
            | Index Created         |
            | Send Distribution     |
            | Distribution Claimed  |
