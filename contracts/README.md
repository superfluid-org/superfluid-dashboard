# Dashboard ClearMacro (contracts)

This directory is a Foundry project for the **DashboardClearMacro**, a ClearMacro v1-compatible macro that bundles common dashboard operations behind one signed payload (see [Superfluid docs](https://docs.superfluid.finance/) and the protocol repository for forwarder details).

Types for the forwarder and ClearMacro base live in `@superfluid-finance/ethereum-contracts` via `foundry.toml` remappings (no vendored forwarder copies in this tree).

## Purpose

- **`DashboardClearMacro`**: multi-action macro for dashboard flows (create/update/delete streams, upgrade/downgrade, approve, transfer).
- **`FormatterLibs`**: helpers used by encoders and human-readable descriptions.

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

The Foundry suite (when present) exercises action happy paths on deployed protocol fixtures, signature and macro mismatch cases, unknown actions, unsupported languages, provider authorization (`self` vs ACL), nonce replay / ordering, and validity window boundaries.

CI runs `forge test --root contracts -vv` with a recursive submodule checkout (see `.github/workflows/ci.yml`, job `forge-contracts`).
