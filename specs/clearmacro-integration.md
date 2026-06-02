# ClearMacro Dashboard Integration

## Why

The dashboard traditionally executes user actions as direct wallet transactions. That path is simple and remains the baseline, but it has two product drawbacks:

- users must pay gas for every supported action;
- multi-step or relayed execution cannot be presented as one clear, typed authorization.

ClearMacro adds a second execution path for supported dashboard actions. The user signs an EIP-712 typed message that describes the action, and a provider relays the signed payload through a ClearMacro forwarder. The intended user benefit is a gasless or relayed dashboard action with a wallet prompt that still clearly shows what is being authorized.

The direct wallet path remains mandatory. The dashboard must use it whenever ClearMacro is not configured, unsupported on the current chain, fails before the user signs, or the user explicitly chooses the wallet path.

## Components

### Dashboard Macro Contract

`contracts/src/DashboardClearMacro.sol` is the dashboard-specific macro. It supports:

- CFA create/update/delete flow;
- upgrade/downgrade;
- super-token approve;
- super-token transfer.

Each action has:

- a numeric action id;
- an ABI encoder shape;
- an EIP-712 primary type;
- an on-chain `describe*` method used to produce the human-readable EIP-712 `description` field.

The OP Sepolia deployment used for integration testing is:

- `DashboardClearMacro`: `0x743db635a328cC5660cf76Aa6BDfAda75CE2942a`
- `ClearMacroForwarderV1WithPermit2`: `0xdDced1A1741e1CbAF7234Fe11feE2c5bA64b967f`

### ClearMacro Provider

The provider exposes a dapp-facing API:

- `GET /v1/capabilities`
- `POST /v1/relay-executions`
- `GET /v1/relay-executions/:id`

Capabilities intentionally expose only `providerName` and supported `{ chainId, forwarderAddress }` pairs. Macro addresses are dashboard configuration, not provider discovery data.

For the OP Sepolia dashboard stack, provider policy must allow:

- domain: `app.superfluid`
- macro: `0x743db635a328cC5660cf76Aa6BDfAda75CE2942a`

The forwarder validates `payload.security.provider` against on-chain provider ACL roles. In the local OP Sepolia provider setup, `providerName` is `macros.superfluid.eth`, and the relayer signer must hold the matching ACL role.

### Dashboard Frontend

The dashboard integration lives under `src/features/clearMacro/` and is wired into the existing Redux transaction endpoints.

Key pieces:

- config in `src/utils/config.ts`:
  - `NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL`
  - `NEXT_PUBLIC_CLEARMACRO_ENABLED`
- capabilities and provider client:
  - `clearMacroApi.slice.ts`
  - `relayExecutionClient.ts`
  - `capabilities.ts`
- chain macro address map:
  - `dashboardClearMacroAddresses.ts`
- action helpers:
  - `relaySuperTokenTransfer.ts`
  - `relayCfaFlow.ts`

The frontend uses existing transaction tracking and dialog infrastructure. Relayed transactions are registered with the same transaction tracker shape as direct transactions: a hash, chain id, title, extra data, and a `wait()` function backed by the chain provider.

## How Execution Works

For each supported action, the frontend follows this sequence:

1. Fetch provider capabilities, unless already cached.
2. Verify ClearMacro is enabled, the chain is listed, the forwarder is known, and the dashboard macro address is configured.
3. Build the macro action bytes.
4. Build the forwarder security object:
   - `domain = "app.superfluid"`
   - `macroContract = DashboardClearMacro`
   - `provider = capabilities.providerName`
   - validity window
   - keyed nonce from the forwarder
5. Call forwarder `encodeParams(action, security)` on-chain.
6. Call forwarder `getDigest(macro, payload)` on-chain.
7. Locally reconstruct the EIP-712 typed data and hash it.
8. Compare local hash to `getDigest`; if they differ, do not ask the wallet to sign.
9. Ask the wallet for an EIP-712 signature.
10. Submit the payload and signature to `POST /v1/relay-executions`.
11. Poll the relay execution until a transaction hash is available.
12. Register the transaction in the existing dashboard transaction tracker.

The wallet prompt should be an EIP-712 typed-data prompt. It is not `personal_sign`; the forwarder verifies the EIP-712 digest.

## Fallback Rules

The integration deliberately distinguishes failures before signing from failures after signing.

Before EIP-712 signing, the dashboard may fall back to the direct wallet transaction when:

- ClearMacro config is absent or disabled;
- capabilities cannot be fetched;
- the chain is unsupported;
- macro or forwarder address is missing;
- on-chain read calls fail;
- local EIP-712 hash does not match forwarder `getDigest`;
- the signer does not match the requested sender.

After wallet signing has started, the dashboard must not silently submit the direct transaction. A signed relay authorization may already have reached the provider or may be relayed later. Automatically sending a direct transaction at that point can create duplicate user actions.

For transfer, the UI therefore includes an explicit bypass:

- `Send with my wallet (skip gasless relay)`

If relay fails after signing, the user can deliberately enable that option and retry as a normal wallet transaction.

## Current Status

### Implemented In The Dashboard

ClearMacro infrastructure:

- environment config and provider URL handling;
- capabilities fetch and cache through RTK Query;
- provider relay client;
- dashboard macro address map;
- forwarder and macro read ABIs;
- app-only TypeScript config (`tsconfig.app.json`) for frontend checks.

Transfer:

- relay-first for super-token transfer when ClearMacro is ready;
- direct fallback before signing;
- no direct fallback after EIP-712 signing;
- explicit wallet bypass checkbox;
- warning hint for post-sign relay failure;
- transaction tracking through the existing tracker.

Simple CFA:

- relay-first for single-operation immediate create/update/delete flow;
- scheduled flows remain direct;
- scheduler cleanup remains direct;
- interface-fee create-flow batches remain direct;
- multi-operation cases remain direct;
- transaction tracking keeps `subTransactionTitles` compatible with pending-update logic.

Provider/testnet setup:

- OP Sepolia provider compose config was prepared in the provider repo;
- local provider stack was brought up successfully;
- `/readyz` and `/v1/capabilities` reported OP Sepolia ready.

Tests and checks:

- `forge test --root contracts -vv` passes for `DashboardClearMacro` (18 tests);
- app-only typecheck config was added and verified by subagent with the local `tsc` binary;
- targeted lint diagnostics on touched files are clean;
- Cypress scaffolding exists for transfer ClearMacro behavior.

### Not Implemented Yet

The following macro actions exist in `DashboardClearMacro` but are not yet wired in the dashboard frontend:

- upgrade;
- downgrade;
- super-token approve.

The existing dashboard `approve` mutation is for approving an underlying ERC-20 to the Super Token contract during wrapping. That is not the same as macro `ACTION_APPROVE`, which approves a spender on the Super Token.

The integration also does not relay:

- scheduled stream creation or modification;
- existing schedule cleanup;
- stream creates that include an interface fee operation;
- any multi-operation batch that is not exactly represented by one DashboardClearMacro action.

### E2E Status

`specs/clearmacro-e2e-plan.md` describes the intended local E2E workflow.

Current Cypress scaffolding covers transfer UI and fallback shape, including:

- ClearMacro skip-relay checkbox helpers;
- mocked capabilities scenario;
- opt-in live scenario tags.

The live E2E path still needs a final runnable pass on a fully prepared environment:

- dashboard built or served with `NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL`;
- `dashboard/tests` dependencies installed;
- Cypress wallet secrets available;
- provider stack running and funded on OP Sepolia.

One operational note: package scripts reference `scripts/e2e-clearmacro.sh`; verify the runner exists in the working tree before relying on those scripts.

## Interesting Findings

### EIP-712 Must Be Reconstructed, Not Replaced With `signMessage`

The forwarder verifies a digest returned by `getDigest(macro, payload)`, which is an EIP-712 digest. The dashboard must ask the wallet to sign typed data, not use `personal_sign`/`signMessage`, because those add a different prefix.

The useful safety pattern is:

- build the typed data locally;
- compute `ethers.utils._TypedDataEncoder.hash(...)`;
- compare it to forwarder `getDigest(...)`;
- only then request `_signTypedData(...)`.

### On-Chain Descriptions Are The Source Of Truth

The EIP-712 action hash includes a human-readable `description`. The frontend should not reimplement formatter logic for amounts or flow rates. It calls the macro's `describe*` functions and uses the returned string in typed data.

This avoids frontend/backend formatting drift and keeps the wallet prompt aligned with the macro's own hash.

### Capabilities Are Not A Macro Registry

The provider capability response does not reveal allowed macros or macro policy. That is intentional. The dashboard still needs its own deployed macro address map, and provider ops must keep the provider registry allowlist in sync with that map.

### Provider Name Is Part Of The Signed Security Policy

`payload.security.provider` is signed. It must match the provider's configured name and the on-chain ACL role granted to the relayer. A wrong provider string is not a cosmetic issue; it changes the signed payload and causes relay/preflight/on-chain authorization failure.

### Post-Sign Fallback Is Dangerous

A relay failure after EIP-712 signing is not equivalent to "nothing happened." The provider might have received the authorization, or might submit later. The dashboard therefore does not automatically submit a direct transaction after signing.

This is why transfer has an explicit wallet bypass rather than hidden automatic fallback.

### Scheduled Flows Are A Different Product Surface

Flow Scheduler operations are not equivalent to CFA macro actions. A scheduled flow can involve scheduler permissions, app actions, existing schedule deletion, and future execution semantics. Those paths stay on the existing direct/batch transaction path until a macro explicitly models them.

### Root TypeScript Checking Needed A Narrower Project

The root `tsconfig.json` includes broad `**/*.ts` and `**/*.tsx` patterns, which can pull in contract submodules and examples. `tsconfig.app.json` exists to check the dashboard frontend without unrelated contract-submodule noise.

### Cypress Cannot Infer EIP-712 From The Current DOM

The shared transaction dialog still says "Waiting for transaction approval..." for both direct transactions and typed-data signatures. Without instrumenting the injected wallet provider, Cypress cannot reliably assert that the wallet used `eth_signTypedData_v4` rather than a normal transaction prompt.

## Operational Checklist

For a chain to use ClearMacro in the dashboard:

1. Deploy `DashboardClearMacro`.
2. Configure the dashboard macro address map for the chain.
3. Ensure the provider registry allows `(domain = "app.superfluid", macroAddress)`.
4. Ensure provider capabilities expose the chain and the correct forwarder.
5. Grant the provider/relayer role on the Superfluid host ACL.
6. Fund the relayer.
7. Configure the dashboard with `NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL`.
8. Run contract tests, app typecheck, and ClearMacro E2E smoke.

## Recommended Next Steps

1. Run the app-only typecheck and targeted lint locally from a clean dependency install.
2. Run the mocked ClearMacro Cypress transfer scenario.
3. Run the live OP Sepolia transfer scenario against the local provider stack.
4. Add live or mocked E2E coverage for simple CFA create/update/delete.
5. Decide whether upgrade/downgrade and super-token approve should be wired next.
6. Consider making the transaction dialog distinguish "waiting for signature" from "waiting for transaction approval."
