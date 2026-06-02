# Superfluid Wallet Dashboard Integration PoC

## Goal

Add a dashboard PoC where disconnected users see:

- Primary CTA: `Connect Superfluid Wallet`
- Secondary CTA: `Connect Wallet`, preserving the existing Web3Modal flow

`Connect Superfluid Wallet` should use the popup wallet flow from `tmp/popup-wallet-demo`: dashboard opens the wallet app, user authenticates by email + OTP, wallet returns an account, wagmi marks the dashboard as connected.

The dashboard and wallet app must remain separate npm projects. They may live in the same git repo during the PoC, but the wallet app should have its own `package.json`, dependencies, env, and dev command so it can later move to a standalone repo/deployment with minimal churn.

First demo scope:

- Chain support: chain-agnostic for normal dashboard/wagmi flows
- Required smoke-test chain: Optimism Sepolia, chain ID `11155420`
- Transaction flow to verify: wrap/upgrade only
- Wallet popup URL locally: `http://localhost:3001`
- Future deployed wallet URL: `https://wallet.superfluid.org`
- Do not implement streams, vesting, scheduling, typed-data support, or all-chain polish unless wrap requires it

Feature flag behavior:

- `NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true`: register the `superfluidWallet` connector and show primary `Connect Superfluid Wallet` plus secondary `Connect Wallet`.
- Unset, `false`, or any other value: do not register the `superfluidWallet` connector; keep the existing Web3Modal-only connect flow.

## Source To Copy

Use `tmp/popup-wallet-demo` as the implementation source. Do not design the connector/provider from scratch.

Copy/adapt these files into `src/features/wallet/superfluidWallet/`:

- `tmp/popup-wallet-demo/apps/dapp/lib/connector.ts`
- `tmp/popup-wallet-demo/apps/dapp/lib/eip1193-provider.ts`

Useful wallet-side reference:

- `tmp/popup-wallet-demo/apps/wallet/*`

Create the Superfluid-owned wallet app as a separate npm project at repo root: `superfluid-wallet/`. It must not live inside dashboard `src/` and must not be part of the dashboard Next.js package.

For the first integration pass, copy the whole `tmp/popup-wallet-demo/apps/wallet` directory to `superfluid-wallet/`, get it running, then apply only necessary Superfluid naming/config changes. Do not reimplement the wallet app from scratch.

`tmp/wagmi-demo` is only a secondary reference. It uses in-page Turnkey integration, which is not the hosted cross-origin `wallet.superfluid.org` journey.

## What The Demo Already Provides

`popup-wallet-demo` already provides most wallet plumbing:

- A wagmi connector via `createConnector`
- An EIP-1193 provider
- Popup opening with encoded JSON-RPC requests
- `postMessage` response handling
- Account persistence for wagmi reconnect
- `eth_requestAccounts`
- `eth_accounts`
- `eth_chainId`
- public RPC forwarding for common read/estimate/broadcast methods
- `eth_sendTransaction` implemented as sign then `eth_sendRawTransaction`
- `eth_signTransaction`
- `eth_sign`
- `personal_sign`
- event forwarding for `accountsChanged`, `chainChanged`, and `disconnect`
- clearing dashboard-side state on connector disconnect

The implementer should preserve this behavior unless dashboard integration requires a small change.

## Required Adaptations

Make the copied connector/provider dashboard-specific:

- Rename connector ID from `turnkeyWallet` to `superfluidWallet`.
- Rename connector name from `Turnkey Wallet` to `Superfluid Wallet`.
- Remove RainbowKit-specific exports/imports if unused.
- Replace hardcoded `http://localhost:3001` with dashboard config.
- Add `NEXT_PUBLIC_SUPERFLUID_WALLET_URL`, default `http://localhost:3001`.
- Add `NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true` with the exact feature-flag behavior above.
- Do not introduce a hardcoded single-chain wallet implementation.
- Remove Sepolia-only assumptions from copied demo code.
- Prefer existing dashboard chain/network definitions from `src/features/network/networks.ts` where practical.
- Keep `postMessage` origin checks. They must use the configured wallet origin.

Provider RPC routing:

- For public RPC methods, reuse the dashboard's existing network definitions — same URLs as `wagmiConfig` transports.
- Resolve the active chain ID from provider state (persist `chainId` on connect and on `chainChanged`).
- Look up the network in `src/features/network/networks.ts` and use `rpcUrls.superfluid.http[0]`.
- Remove the demo's single Sepolia RPC URL and `NEXT_PUBLIC_SEPOLIA_RPC_URL`.
- Do not add new per-chain RPC env vars unless there is a documented blocker.

Make the copied wallet app chain-aware enough for dashboard transactions:

- In `superfluid-wallet/`, do not hardcode Sepolia as the signing chain.
- In the copied wallet signing UI, check the equivalent of `components/sign-transaction.tsx`; the demo currently falls back to Sepolia if `transaction.chainId` is absent.
- Prefer requiring `transaction.chainId` from the dashboard/provider and show a clear error if it is missing.
- If a fallback is still needed for the PoC, use the active chain from the request/provider state, not a fixed testnet.
- Ensure the wallet signs the `chainId` provided by the dashboard transaction.
- If wallet-side RPC config is needed, make it chain-keyed or reuse the dashboard/provider request data. Do not add a wallet config that only supports Optimism Sepolia unless there is a documented blocker.

## Dashboard Integration Points

Touch as little as possible:

- `src/utils/config.ts`: add wallet URL/config values.
- `src/features/wallet/wagmiConfig.ts`: add the Superfluid Wallet connector to wagmi config.
- `src/features/wallet/ConnectButtonProvider.tsx`: add `connectSuperfluidWallet` using wagmi `useConnect` and connector ID `superfluidWallet`.
- `src/features/wallet/ConnectWallet.tsx`: render primary `Connect Superfluid Wallet` and secondary `Connect Wallet` when disconnected.

Do not replace Web3Modal. Do not remove Safe/test connectors. Do not introduce non-wagmi account state.

Do not add Turnkey wallet UI/auth dependencies to the dashboard package unless absolutely necessary. The dashboard package should only contain the connector/provider bridge needed to talk to the separate wallet origin.

Connect CTA inventory:

- Most top-level CTAs render through `ConnectWallet.tsx`; update that component first.
- Also inspect direct `openConnectModal` callers and standalone connect buttons. Known files include `src/features/transactionBoundary/ConnectionBoundary.tsx`, `src/features/transactionBoundary/ConnectionBoundaryButton.tsx`, `src/features/onboarding/OnboardingCards.tsx`, and `src/features/bridge/LiFiWidgetManager.tsx`.
- For this PoC, do not redesign every contextual connect prompt. At minimum, the main disconnected dashboard CTA must show primary `Connect Superfluid Wallet` and secondary `Connect Wallet`.
- If a contextual button starts a transaction flow, prefer routing its disconnected state to `connectSuperfluidWallet` as the primary action only when that is low-risk. Otherwise document it as deferred.

## Wallet App Boundary

The wallet app is a separate app, even when colocated in this repository for convenience.

For the PoC:

- Create `superfluid-wallet/` at repo root as the wallet app npm project.
- Start by copying the whole `tmp/popup-wallet-demo/apps/wallet` directory into `superfluid-wallet/`.
- Keep its own `package.json`, env files, and dev command.
- After it runs, apply minimal Superfluid naming/config changes and remove obvious demo-only cruft if safe.
- Running `tmp/popup-wallet-demo/apps/wallet` directly is acceptable only as a quick reference/sanity check before or during implementation.
- Do not place wallet app pages/components under dashboard `src/`.
- Do not make the dashboard import wallet app React components.
- Communication between dashboard and wallet app should be only through popup URL parameters and `postMessage`, as in `popup-wallet-demo`.

Wallet app config:

- Add `NEXT_PUBLIC_DAPP_ORIGIN`, default `http://localhost:3000`, future value `https://app.superfluid.org`.
- Add Turnkey env vars from `tmp/popup-wallet-demo/apps/wallet/.env.local.example`: `NEXT_PUBLIC_ORGANIZATION_ID` and `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID`.
- Use `NEXT_PUBLIC_DAPP_ORIGIN` as the wallet app `postMessage` target origin. Do not keep `'*'` as the default for the final PoC implementation.
- Keep the dashboard-side provider validating messages from `NEXT_PUBLIC_SUPERFLUID_WALLET_URL`.
- Local pair: dashboard `http://localhost:3000`, wallet `http://localhost:3001`.
- Production pair: dashboard `https://app.superfluid.org`, wallet `https://wallet.superfluid.org`.

Production direction:

- Deploy the wallet app separately at `https://wallet.superfluid.org`.
- Keep dashboard deployable independently at the existing app origin.

## Session Behavior

Best UX for the PoC:

- Refresh should reconnect if dashboard-side account metadata and wallet-side Turnkey session are still valid.
- Explicit dashboard disconnect should clear dashboard-side Superfluid Wallet connector state.
- If the wallet session is expired, the next connect/signing request should reopen the popup and re-authenticate.

Turnkey notes:

- Read-write sessions default to `900` seconds, i.e. 15 minutes.
- Session length is configurable with `expirationSeconds` when creating or refreshing a read-write session.
- `refreshSession` can extend a valid session.
- The wallet app owns Turnkey session creation/refresh because the session lives on the wallet origin.
- The dashboard should not manage Turnkey session lifetime directly.
- For this PoC, configure the wallet app's default Turnkey read-write session duration to 30 days: `2592000` seconds.

Set the 30-day duration in `superfluid-wallet/`, not in the dashboard connector. If `@turnkey/react-wallet-kit` does not expose a simple session-duration option, document that blocker and keep the SDK default temporarily.

## Network Switching

PoC assumption: do not implement full `wallet_switchEthereumChain` support unless wrap testing proves it is required.

- For the required smoke test, manually select Optimism Sepolia in the dashboard before wrapping.
- If wagmi calls `wallet_switchEthereumChain` through the Superfluid provider and the copied demo provider does not support it, document the blocker in self-verification.
- Do not block the PoC on complete wallet-side network switching unless the wrap flow cannot proceed without it.

## Implementation Steps

1. Copy `connector.ts` and `eip1193-provider.ts` from `tmp/popup-wallet-demo/apps/dapp/lib/` to `src/features/wallet/superfluidWallet/`.
2. Apply the required adaptations above.
3. Register the connector in `src/features/wallet/wagmiConfig.ts`.
4. Add `connectSuperfluidWallet` to `ConnectButtonProvider.tsx`.
5. Update `ConnectWallet.tsx` disconnected UI.
6. Run `superfluid-wallet/` as a separate npm project on port `3001`.
7. Verify connect on local dashboard + local wallet popup.
8. Verify Optimism Sepolia wrap/upgrade.

`connectSuperfluidWallet` requirements:

- Use wagmi `useConnect` with connector ID `superfluidWallet`.
- Expose a loading state for the primary CTA from `useConnect` pending state or equivalent.
- On primary CTA click, call `stopImpersonation()` like the current header connect flow does.
- Surface or log useful errors for blocked popup, closed popup, provider timeout, and user rejection.

## Parallelization Plan

This task can be split across parallel sub-agents. Use separate branches or coordinate carefully if multiple agents edit the same worktree.

Agent A: dashboard connector/provider bridge

- Owns `src/features/wallet/superfluidWallet/`.
- Copies/adapts `connector.ts` and `eip1193-provider.ts` from `tmp/popup-wallet-demo/apps/dapp/lib/`.
- Adds config reads for wallet URL and chain-aware public RPC via `networks.ts` (`rpcUrls.superfluid.http[0]`).
- Ensures `postMessage` origin checks use the configured wallet origin.
- Self-verifies by instantiating the connector in isolation or via dashboard TypeScript checks.

Agent B: dashboard UI and wagmi wiring

- Owns `src/utils/config.ts`, `src/features/wallet/wagmiConfig.ts`, `src/features/wallet/ConnectButtonProvider.tsx`, and `src/features/wallet/ConnectWallet.tsx`.
- Registers the connector from Agent A.
- Adds `connectSuperfluidWallet` using `useConnect`.
- Updates disconnected UI to primary `Connect Superfluid Wallet` and secondary `Connect Wallet`.
- Keeps Web3Modal/Safe/test connectors intact.

Agent C: wallet app npm project

- Owns `superfluid-wallet/`.
- Keeps its own `package.json`, env files, and dev command.
- Copies the whole `tmp/popup-wallet-demo/apps/wallet` directory into `superfluid-wallet/`, then applies minimal Superfluid naming/config changes.
- Uses `tmp/popup-wallet-demo/apps/wallet` directly only as a reference or sanity-check server, not as the final PoC app location.
- Ensures it can run locally at `http://localhost:3001`.
- Removes wallet-side Sepolia-only fallback/config and signs with the transaction chain ID.
- Configures wallet-to-dashboard `postMessage` target origin via `NEXT_PUBLIC_DAPP_ORIGIN`.
- Adds Turnkey env documentation/template for `NEXT_PUBLIC_ORGANIZATION_ID` and `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID`.
- Sets Turnkey read-write session duration to 30 days if supported by the copied wallet app/SDK config.
- Does not add wallet app React components or Turnkey auth UI into dashboard `src/`.

Agent D: verification and tests

- Owns test updates and manual verification notes.
- Updates Cypress/page-object assertions that assume the main unauthenticated button is `Connect Wallet`.
- Verifies secondary `Connect Wallet` still opens Web3Modal.
- Keeps Turnkey popup auth out of CI unless mock popup infrastructure is added.
- Runs `pnpm tsc`, `pnpm lint`, and optionally `pnpm build`.
- Performs or documents the local popup connect and Optimism Sepolia wrap test.

Recommended merge order:

1. Agent C ensures the wallet app runs at `http://localhost:3001`.
2. Agent A lands connector/provider bridge.
3. Agent B wires the bridge into dashboard UI/wagmi.
4. Agent D updates tests and performs final verification.

Avoid conflicts:

- Agent A should not edit `ConnectWallet.tsx` or `ConnectButtonProvider.tsx`.
- Agent B should not edit wallet app files.
- Agent C should not edit dashboard `src/`.
- Agent D should avoid implementation changes unless fixing test selectors or obvious verification blockers.

## Local Test Setup

Run `superfluid-wallet/` locally at `http://localhost:3001` from its own npm project, not from the dashboard dev server.

Wallet env should include:

```bash
NEXT_PUBLIC_DAPP_ORIGIN=http://localhost:3000
NEXT_PUBLIC_ORGANIZATION_ID=<turnkey-org-id>
NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID=<turnkey-auth-proxy-config-id>
```

Use shared dev Turnkey credentials from the team secret store if available; otherwise provision per-developer credentials in the Turnkey dashboard.

Run dashboard locally with:

```bash
NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true NEXT_PUBLIC_SUPERFLUID_WALLET_URL=http://localhost:3001 pnpm dev
```

Manual flow:

1. Open dashboard at `http://localhost:3000`.
2. Confirm `Connect Superfluid Wallet` is primary and `Connect Wallet` is secondary.
3. Click `Connect Superfluid Wallet`.
4. Complete email + OTP in popup.
5. Confirm dashboard shows the connected address through normal wagmi state.
6. Switch to Optimism Sepolia if needed.
7. Perform a small wrap/upgrade on Optimism Sepolia as the required smoke test.
8. Record the transaction hash if broadcast succeeds.

## Worker Self-Verification

Report these results after implementation:

- `pnpm tsc`: pass/fail and failure summary
- `pnpm lint`: pass/fail and failure summary
- `pnpm build`: pass/fail if run; explain if skipped
- Wallet popup URL used
- Wallet `NEXT_PUBLIC_DAPP_ORIGIN` used
- Whether Turnkey wallet env vars were configured, without printing secret values
- Feature flag value used
- Provider RPC routing strategy used
- Whether connect succeeded
- Whether refresh reconnect was tested and what happened
- Whether disconnect cleared dashboard-side state
- Whether wrap reached signing popup on Optimism Sepolia
- Wrap transaction hash if broadcast succeeded
- Any unsupported RPC method encountered
- Any `wallet_switchEthereumChain` blocker encountered

## Final Review Checklist

- `Connect Superfluid Wallet` is primary only when disconnected.
- `Connect Wallet` still opens Web3Modal.
- Existing conventional wallet flows remain available.
- Feature flag disables the Superfluid Wallet connector/CTA when not `true`.
- Superfluid Wallet connection updates wagmi state.
- Connector/provider code is isolated under `src/features/wallet/superfluidWallet/`.
- Wallet URL is configurable and local default works.
- Wallet app `postMessage` target origin is configurable and not `'*'` in the final PoC.
- `postMessage` origin checks are not disabled.
- Optimism Sepolia wrap/upgrade is the verified transaction path.
- Public RPC forwarding uses `network.rpcUrls.superfluid.http[0]` from `networks.ts`, not the demo Sepolia URL.
- Wallet-side transaction signing uses the transaction chain ID and does not fall back to Sepolia.
- Explicit disconnect clears dashboard-side Superfluid Wallet state.
- Static checks were run or failures are documented.
