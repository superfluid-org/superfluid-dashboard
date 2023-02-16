Feature: Export Stream Data page test cases

  Background:
    Given "Accounting Export page" is open without connecting a wallet

  Scenario: Selecting and removing an address from the list
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And Selected sections shows "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"
    And User removes the selected address from the list of addresses
    And Ok button is not visible and no entries are highlighted
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" is shown as one of the selected addresses for export preview
    And And address search box shows that "1" address is selected
    And Export preview button is enabled
    And User removes the selected address from the list of selected addresses
    And Export preview button is disabled
    And And address search box shows that "0" address is selected

  Scenario Outline: Changing price granularity and accounting periods
    And User selects "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" for the accounting export
    And User changes the price granularity to "<period>"
    And User changes the accounting period to "<period>"
    Then Export preview is correctly fetched from the accounting API for "<period>"
    Examples:
      | period  |
      | Daily   |
      | Weekly  |
      | Monthly |
      | Yearly  |

  Scenario: Selecting multiple addresses and exporting the data
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as an extra accountable account
    And User selects "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" from the search section
    And User clicks the OK button
    Then Exported data for "multiple accounts" is fetched and shown correctly

  Scenario: Selecting a counterparty and exporting the data
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as the accountable account
    And User selects "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" from the search section
    And User clicks the OK button
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the counterparty account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    Then Exported data for "counterparty" is fetched and shown correctly

  Scenario: Date range of the reports
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And User changes the export start date to "01/22"
    And User changes the export end date with date picker to "Feb" "2022"
    Then Exported data for "custom dates" is fetched and shown correctly

  Scenario: Export preview - enabling and disabling columns
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And User clicks on the export preview button
    And User enables all of the columns
    Then Exported data for "all columns" is fetched and shown correctly
    And User disables all of the columns
    Then No data is shown in the export preview

  Scenario: Export preview - Sorting by ascending/descending
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And User clicks on the export preview button
    And User clicks on the "amount" column
    Then The "amount" column is sorted in "ascending" order
    And User clicks on the "amount" column
    Then The "amount" column is sorted in "descending" order

  Scenario: Export preview - Custom filters
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And User clicks on the export preview button
    And User adds a custom filter for "tokenSymbol" to "contains" "DAIx"
    Then The export preview table only shows "tokenSymbol" rows with "DAIx"

  Scenario: Exporting and validating CSV
    And User searches for "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" as the accountable account
    And User selects "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40" from the search section
    And User clicks the OK button
    And User clicks on the export preview button
    And User exports the CSV
    Then CSV contains the correct data