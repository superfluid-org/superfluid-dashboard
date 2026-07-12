# Dashboard ClearMacro (contracts)

This directory is a Foundry project for the **DashboardClearMacro**, a ClearMacro v1-compatible macro that bundles common dashboard operations behind one signed payload (see [Superfluid docs](https://docs.superfluid.finance/) and the protocol repository for forwarder details).

Types for the forwarder and ClearMacro base live in `@superfluid-finance/ethereum-contracts` via `foundry.toml` remappings (no vendored forwarder copies in this tree).

## Purpose

- **`DashboardClearMacro`**: multi-action macro for dashboard flows (create/update/delete streams, upgrade/downgrade, approve, transfer, flow scheduling).
- **`FormatterLibs`**: helpers used by encoders and human-readable descriptions.

The macro is constructed with two per-chain addresses — the Superfluid host and the [FlowScheduler](https://docs.superfluid.finance/) automation contract (both published in `@superfluid-finance/metadata`) — plus the relay fee configuration (fee SuperToken, base fee per relayed transaction, fee receiver). The scheduling actions grant the FlowScheduler the required CFA flow-operator permissions and register the schedule in the same signed batch; off-chain keepers later trigger the actual stream start/stop.

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

Schedule Flow notes: `startDate = 0` schedules a stop only (requires `flowRate = 0`); `endDate = 0` schedules a start only (requires `flowRate > 0`); at least one date must be set. A scheduled start uses the dashboard's default `startMaxDelay` of 1 day and no upfront `startAmount`. The bundled permission grant (`increaseFlowRateAllowanceWithPermissions`) only adds what is missing: the macro reads the FlowScheduler's existing flow-operator permissions and allowance for the signer and grants the missing permission bits (create for a start, delete for a stop) and the allowance top-up to `flowRate` — skipped entirely when already sufficient (e.g. after a prior full-control grant), so repeated schedule edits do not accumulate allowance. Cancelling a schedule does not revoke previously granted permissions. A **new** schedule is charged the relay fee for each keeper execution it reserves (2x for one date, 3x for both); modifying an existing schedule row is charged 1x (see **Fees** below). Every description above also discloses the relay fee.

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
pnpm contracts:abi    # build + regenerate src/features/clearMacro/dashboardClearMacroAbi.generated.ts
```

Run `pnpm contracts:abi` after changing the macro's external interface so the dashboard's generated ABI module stays in sync.

Equivalent direct `forge` invocations:

```bash
forge build --root contracts
forge test --root contracts -vv
```

## Deployment

Per-chain constructor settings (host, FlowScheduler, fee SuperToken, fee policy) live in a
`block.chainid`-keyed table in `script/DeployDashboardClearMacro.s.sol`; the env vars `SUPERFLUID_HOST`,
`FLOW_SCHEDULER`, `FEE_SUPER_TOKEN`, `BASE_FEE_AMOUNT` and `FEE_RECEIVER` override any value per
invocation. The driver `script/deploy-clear-macro.sh` deploys and verifies selectively per network
(simulation by default, `--broadcast` requires an explicit `--account`); the full environment-variable
reference is in the script's header comment:

```bash
pnpm contracts:deploy all                                                # dry-run every eligible chain
pnpm contracts:deploy --broadcast --verify --account <keystore> <network>
```

Deployments can also run from CI: the manual-dispatch workflow `.github/workflows/deploy-clear-macro.yml`
takes the target network as input, simulates by default, and sources the deployer from repository secrets
(`CLEAR_MACRO_DEPLOYER_PRIVATE_KEY`, plus `ETHERSCAN_API_KEY` for verification); broadcast runs are gated
behind the `contract-deployment` environment.

Eligibility is bounded by FlowScheduler availability. Full rollout notes, the config table sources, and
the dashboard wiring step are in `docs/plans/clear-macro-multi-network-deploy.md`.

## Security and replay notes

- **Keyed nonces:** replay protection follows ERC-4337-style keyed nonces: `key << 64 | sequence`.
- **`provider` and relay:** `provider = "self"` allows the signer to relay their own execution. Any other `provider` string requires the corresponding ACL role on `host.getSimpleACL()`.
- **Fees:** a relay fee of `BASE_FEE_AMOUNT * txCount` is charged in `FEE_SUPER_TOKEN` to `FEE_RECEIVER` on every action, where `txCount` is the number of transactions the relay executes: **1x** for any plain action and for cancelling a schedule; a **new** schedule reserves the keeper executions it triggers, so it costs **2x** (start-only or stop-only) or **3x** (start and stop); **modifying** an existing schedule is **1x** (the keeper executions were reserved when it was first created, so the fee is not re-applied). The fee is transferred from the signer (a self-spend, so no allowance is needed) and disclosed in the signed description. `BASE_FEE_AMOUNT` must be a multiple of `1e13` (5-decimal granularity, so the disclosed amount is exact), and `BASE_FEE_AMOUNT = 0` deploys a feeless macro. The fee configuration is immutable per deployment.

## Tests

The Foundry suite exercises action happy paths on deployed protocol fixtures, signature and macro mismatch cases, unknown actions, unsupported languages, provider authorization (`self` vs ACL), nonce replay / ordering, validity window boundaries, and the full flow-scheduling lifecycle (schedule via macro, then keeper-style `executeCreateFlow` / `executeDeleteFlow` against a locally deployed FlowScheduler).

CI runs `forge test --root contracts -vv` with a recursive submodule checkout (see `.github/workflows/contracts.yml`, job `forge-contracts`).
