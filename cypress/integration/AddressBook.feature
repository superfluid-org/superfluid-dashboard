Feature: Address Book test cases

  Scenario: No addresses added onboarding message
    Given "Address book Page" is open without connecting a wallet
    Then No addresses added message is shown

  Scenario: Adding, editing and removing an address book entry
    Given "Address book Page" is open without connecting a wallet
    And User adds "0x0000000000000000000000000000000000000000" to their address book
    Then The last address book entry name is "0x0000...0000"
    And User edits the name of the last address book entry to "testing"
    Then The last address book entry name is "testing"
    And User removes the last address book entry
    Then No addresses added message is shown

  Scenario: Address book entries shown in address input dialogs
    Given "Address book Page" is open without connecting a wallet
    And User adds "0x8ac9C6D444D12d20BC96786243Abaae8960D27e2" to their address book
    Then The last address book entry name is "0x8ac9...27e2"
    And User edits the name of the last address book entry to "testing"
    And User clicks on the "dashboard" navigation button
    And User clicks on the view mode button
    And User types "testing" into the address input
    Then "testing" address book entry for "0x8ac9C6D444D12d20BC96786243Abaae8960D27e2" is visible in the search results
    And User chooses the first address book result
    Then View mode chip shows "testing"
    And User clicks on the "send" navigation button
    And User clicks on the address button in the send page
    And User types "testing" into the address input
    Then "testing" address book entry for "0x8ac9C6D444D12d20BC96786243Abaae8960D27e2" is visible in the search results
    And User chooses the first address book result
    Then Chosen wallet address shows up as testing
    And User clicks on the "history" navigation button
    And User waits for the activity history to load
    And User opens the receiver dialog
    And User types "testing" into the address input
    Then "testing" address book entry for "0x8ac9C6D444D12d20BC96786243Abaae8960D27e2" is visible in the search results
    And User chooses the first address book result
    Then Chosen wallet address shows up as testing
