Feature: Activity History Page tests

  @skip
  Scenario: Activity history page entries shown for all networks in the correct order
    Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
    #Possible reworks comming up so didn't spend time on making it dynamic
    And User changes the activity history filter to 15 months before
    And User closes the dropdown
    And Activity history data for "staticBalanceAccount" is shown correctly on "mainnet"
    And User changes the visible networks to "testnet"
    And Activity history data for "staticBalanceAccount" is shown correctly on "testnet"

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
    And User changes the activity history filter to 15 months before
    And User closes the dropdown
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User waits for the activity history to load
    Then Only the activity history entries with "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" are shown

  Scenario: Enabling and disabling networks visible
    Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
    And User changes the activity history filter to 15 months before
    And User closes the dropdown
    And Activity rows for "arbitrum-one" are visible
    And User opens the network selection dropdown
    And User clicks on the "arbitrum-one" toggle
    Then No "arbitrum-one" activity rows are visible
    And User clicks on the "arbitrum-one" toggle
    Then Activity rows for "arbitrum-one" are visible

  @only @mocked
  Scenario Outline: <activity> shown in the activity history page
    Given Activity history request is mocked to "<activity>" on "polygon"
    Given "Activity History Page" is open using view mode to look at "staticBalanceAccount"
    Then Mocked "<activity>" entry on "polygon" is shown in the activity history
    Examples:
      | activity              |
#      | Liquidated            |
#      | Wrap                  |
#      | Send Stream           |
#      | Unwrap                |
#      | Receive Transfer      |
#      | Stream Updated        |
#      | Receive Stream        |
#      | Stream Cancelled      |
#      | Subscription Approved |
      | Subscription Updated  |
      | Subscription Rejected |
      | Index Created         |
      | Send Transfer         |
    #Send Distribution
    #Distribution Claimed
