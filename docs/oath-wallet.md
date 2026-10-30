# Oath Wallet connection

Oath is listed directly through AppKit's `customWallets` configuration. AppKit renders the same wallet row, image sizing, QR and connection instructions used by other WalletConnect wallets. This entry reuses the existing adapter, provider and session lifecycle; it does not create a second client or impersonate an injected wallet.

Oath is an iOS app. Desktop users scan the QR from Oath; iPhone/iPad users can use `oathwallet://wc?uri=…`. Android does not receive the iOS-only entry. The App Store link is provided to AppKit, with no Android, browser-extension, desktop or web-app link. The local identifier is not a WalletGuide approval claim.

The existing dashboard network configuration is unchanged. A listing does not mean Oath supports every dashboard network: the wallet must approve supported accounts/chains, and unsupported network requests remain subject to its normal rejection behavior.

## Validation

Run `node --test scripts/test-oath-wallet.mjs`, `pnpm typecheck`, `pnpm lint` and `pnpm build`. The host tests include the installed AppKit native-link formatter and verify preservation of the complete nested pairing URI. The repository's current ESLint configuration does not select TypeScript files; a successful lint command is not a TypeScript lint claim.

For a local browser test, use the existing `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` configuration with a project permitting the test origin. Never commit a test project configuration, pairing URI or wallet data.

1. Open the Connect Wallet menu. Oath should appear directly alongside other wallets, with the same native row/icon sizing.
2. Select Oath and verify its named QR and scanning instructions. Cancel, reopen and retry; then check the generic WalletConnect option still works.
3. Check a narrow viewport for clipping and sizing parity. This is not a device handoff test.
4. Separately, on an authorized iPhone with Oath, verify scanning, app handoff, supported-network approval, restoration/disconnection and signing before treating end-to-end wallet compatibility as verified. No such device approval or transaction is part of the automated host checks.
