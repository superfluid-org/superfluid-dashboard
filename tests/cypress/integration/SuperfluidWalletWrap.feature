@numTestsKeptInMemory(0)
@retries(5)
@superfluidWallet
@ignoreDuringUI
Feature: Superfluid Wallet wrap flow (mock popup)

  # Requires dashboard with NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true.
  # Uses in-process mock handler instead of Turnkey popup (see superfluidWalletMock.ts).

  Scenario: Wrapping via Superfluid Wallet mock on opsepolia
    Given Transactional account superfluidE2E is connected via Superfluid Wallet on opsepolia
    And User clicks on the "wrap-unwrap" navigation button
    And User wraps the "0.1" of the selected token
    And Transaction dialog for opsepolia is shown wrapping 0.1 ETH
    And Wrap transaction broadcasted message is shown
    And User clicks on the go to tokens page button from tx dialog
    And The restore button is visible for the last transaction
    And The transaction drawer shows a succeeded "Wrap to Super Token" transaction on "opsepolia"
    And The restore button is visible for the last transaction
    And Users super token balance of "ETHx" on "opsepolia" increases by "0.1" in the dashboard page
