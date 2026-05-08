@numTestsKeptInMemory(0)
Feature: Transfer ClearMacro scaffolding

  ClearMacro transfer UI is gated by build-time config (`NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL`).
  Mocked scenarios stub GET **/v1/capabilities so no live provider process is required once the URL is set.

  @clearmacro @ignore @ignoreDuringUI
  Scenario: Wallet transfer path when mocked capabilities expose no relay chains
    Given ClearMacro capabilities are mocked as provider-unavailable (empty relay chains)
    And "Transfer Page" is open with "bob" connected on "opsepolia"
    And User inputs all the details to send "1" "fDAIx" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    Then ClearMacro transfer integration UI is available (skip relay checkbox visible)
    And ClearMacro skip relay checkbox is unchecked
    And ClearMacro relay wallet retry hint is not visible
    When User toggles ClearMacro skip relay checkbox
    Then ClearMacro skip relay checkbox is checked
    When User toggles ClearMacro skip relay checkbox
    Then ClearMacro skip relay checkbox is unchecked
    And User sends the transfer and the transaction dialogs are visible for "opsepolia"
    And User opens the transaction drawer
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Send Transfer" transaction on "opsepolia"
    And The restore button is visible for the last transaction
    And The first row does not have a pending transfer transaction status
    And User restores the last transaction
    Then All the details to send "1" "fDAIx" to "@elvijs" on "opsepolia" are set in the fields

  # Opt-in only: requires working ClearMacro provider + relay; excluded from CI via TAGS (not @ignoreDuringUI).
  # Does not assert eth_signTypedData_v4 / EIP-712 prompts (wallet harness limitation).
  @clearmacroLive @ignore @ignoreDuringUI
  Scenario: Send transfer against live ClearMacro capabilities (explicit runs)
    Given "Transfer Page" is open with "bob" connected on "opsepolia"
    And User inputs all the details to send "1" "fDAIx" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    Then ClearMacro transfer integration UI is available (skip relay checkbox visible)
    And ClearMacro skip relay checkbox is unchecked
    And User sends the transfer and the transaction dialogs are visible for "opsepolia"
    And User opens the transaction drawer
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Send Transfer" transaction on "opsepolia"
    And The restore button is visible for the last transaction
    And The first row does not have a pending transfer transaction status
    And User restores the last transaction
    Then All the details to send "1" "fDAIx" to "@elvijs" on "opsepolia" are set in the fields
