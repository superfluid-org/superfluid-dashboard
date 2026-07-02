# Dashboard ClearMacro (contracts)

This directory is a Foundry project for the **DashboardClearMacro**, a ClearMacro v1-compatible macro that bundles common dashboard operations behind one signed payload (see [Superfluid docs](https://docs.superfluid.finance/) and the protocol repository for forwarder details).

Types for the forwarder and ClearMacro base live in `@superfluid-finance/ethereum-contracts` via `foundry.toml` remappings (no vendored forwarder copies in this tree).

## Purpose

- **`DashboardClearMacro`**: multi-action macro for dashboard flows (create/update/delete streams, upgrade/downgrade, approve, transfer, flow scheduling).
- **`FormatterLibs`**: helpers used by encoders and human-readable descriptions.

The macro is constructed with two per-chain addresses: the Superfluid host and the [FlowScheduler](https://docs.superfluid.finance/) automation contract (both published in `@superfluid-finance/metadata`). The scheduling actions grant the FlowScheduler the required CFA flow-operator permissions and register the schedule in the same signed batch; off-chain keepers later trigger the actual stream start/stop.

## ClearMacro payload flow

1. Build action params (for one action).
2. Build the security object (`provider`, `nonce`, validity window, macro address, domain).
3. Call `encodeParams(action, security)` on the forwarder.
4. Call `getDigest(macro, payload)` on the forwarder and sign the digest.
5. Submit with `runMacro(macro, payload, signer, signature)`.

## Supported actions

Each action exposes:

- A typed encoder: `encode<Action>(lang, params)`.
- An English description: `describe<Action>(lang, params)`.
- EIP-712 hashing via `Action(string description, ...)`.

**Language:** English only for now (`lang = "en"`).

| ID | Action        | Params | Description shape (summary) |
|----|---------------|--------|-----------------------------|
| 1  | Create Flow   | `token`, `receiver`, `flowRate` | Create a new flow of `flowRate/day` `token`/day to `receiver` |
| 2  | Update Flow   | `token`, `receiver`, `flowRate` | Update flow to `flowRate/day` `token`/day to `receiver` |
| 3  | Delete Flow   | `token`, `sender`, `receiver` | Delete flow of `token` from `sender` to `receiver` |
| 4  | Upgrade       | `superToken`, `amount` | Upgrade `amount` `underlyingSymbol` to `superSymbol` |
| 5  | Downgrade     | `superToken`, `amount` | Downgrade `amount` `superSymbol` to `underlyingSymbol` |
| 6  | Approve       | `superToken`, `spender`, `amount` | Approve `spender` for an allowance of `amount` `superSymbol` |
| 7  | Transfer      | `superToken`, `receiver`, `amount` | Transfer `amount` `superSymbol` to `receiver` |
| 8  | Schedule Flow | `superToken`, `receiver`, `startDate`, `flowRate`, `endDate` | Schedule a stream of `flowRate`/day `superSymbol` to `receiver` (start and/or stop; unix timestamps), and authorize the Flow Scheduler |
| 9  | Delete Flow Schedule | `superToken`, `receiver` | Cancel the scheduled stream of `superSymbol` to `receiver` |

Schedule Flow notes: `startDate = 0` schedules a stop only (requires `flowRate = 0`); `endDate = 0` schedules a start only (requires `flowRate > 0`); at least one date must be set. A scheduled start uses the dashboard's default `startMaxDelay` of 1 day and no upfront `startAmount`. The bundled permission grant (`increaseFlowRateAllowanceWithPermissions`) only adds what is missing: the macro reads the FlowScheduler's existing flow-operator permissions and allowance for the signer and grants the missing permission bits (create for a start, delete for a stop) and the allowance top-up to `flowRate` — skipped entirely when already sufficient (e.g. after a prior full-control grant), so repeated schedule edits do not accumulate allowance. Cancelling a schedule does not revoke previously granted permissions.

## Clone and dependencies

Remappings expect the Superfluid protocol monorepo (and nested libs) under `contracts/lib/`. The submodule tracks `2026-03-permit2_and_macro` because ClearMacro is not yet available on the protocol monorepo `dev` branch. After cloning the dashboard repo:

```bash
git submodule update --init --recursive
```

## Build and test (from dashboard repo root)

With [Foundry](https://book.getfoundry.sh/getting-started/installation) installed:

```bash
pnpm contracts:build
pnpm contracts:test
```

Equivalent direct `forge` invocations:

```bash
forge build --root contracts
forge test --root contracts -vv
```

## Security and replay notes

- **Keyed nonces:** replay protection follows ERC-4337-style keyed nonces: `key << 64 | sequence`.
- **`provider` and relay:** `provider = "self"` allows the signer to relay their own execution. Any other `provider` string requires the corresponding ACL role on `host.getSimpleACL()`.
- **Fees:** this macro version does not charge a create-flow fee.

## Tests

The Foundry suite exercises action happy paths on deployed protocol fixtures, signature and macro mismatch cases, unknown actions, unsupported languages, provider authorization (`self` vs ACL), nonce replay / ordering, validity window boundaries, and the full flow-scheduling lifecycle (schedule via macro, then keeper-style `executeCreateFlow` / `executeDeleteFlow` against a locally deployed FlowScheduler).

CI runs `forge test --root contracts -vv` with a recursive submodule checkout (see `.github/workflows/contracts.yml`, job `forge-contracts`).
