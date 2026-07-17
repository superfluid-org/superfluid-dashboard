# Clear Macro: multi-network deployment tooling

Status: implemented (tooling only — no new network has been broadcast to yet). 2026-07-09.

## Goal

Replace the hand-rolled OP Sepolia deploy flow (env vars exported into `forge script`, one-off
`forge verify-contract` commands) with repeatable tooling that can deploy `DashboardClearMacro` to any
eligible network with the correct settings:

- `contracts/script/DeployDashboardClearMacro.s.sol` — per-chain config table keyed by `block.chainid`
  (compile-time-checksummed addresses), env vars demoted to per-invocation overrides.
- `contracts/script/deploy-clear-macro.sh` — driver that simulates/broadcasts/verifies per network and
  prints ready-to-paste `networks.ts` snippets. Also exposed as `pnpm contracts:deploy`.

## Which networks are eligible — and why only these

The constructor requires a live FlowScheduler (`ZeroAddress` + `code.length` checks), so eligibility is
bounded by FlowScheduler availability in `@superfluid-finance/metadata`. Only **9 of the dashboard's 16
networks** qualify:

| network (metadata name) | chainId | fee SuperToken (table) |
|---|---|---|
| eth-mainnet | 1 | USDCx `0x1BA8603DA702602A8657980e825A6DAa03Dee93a` |
| optimism-mainnet | 10 | USDCx (native USDC) `0x35Adeb0638EB192755B6E52544650603Fe65A006` |
| bsc-mainnet | 56 | USDCx `0x0419e1fA3671754F77EC7D5416219A5f9A08B530` |
| xdai-mainnet | 100 | USDCx `0x1234756ccf0660E866305289267211823Ae86eEc` |
| polygon-mainnet | 137 | USDCx (native USDC) `0x07b24BBD834c1c546EcE89fF95f71D9F13a2eBD1` |
| base-mainnet | 8453 | USDCx `0xD04383398dD2426297da660F9CCA3d439AF9ce1b` |
| arbitrum-one | 42161 | USDCx (native USDC) `0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf` |
| avalanche-c | 43114 | USDCx `0x288398F314D472B82C44855F3f6fF20b633c2A97` |
| optimism-sepolia | 11155420 | fUSDCx `0x131780640EDf9830099AAc2203229073d6D2FE69` (already deployed: `0xEeFC8492f24898289E65Ee06dE7B8A19F30832a5`) |

Celo, Degen, Scroll (+Sepolia), Avalanche Fuji, Sepolia and Base Sepolia have **no FlowScheduler** and
cannot receive the macro. If one gains a FlowScheduler later, add a row to `_defaultConfig` and to the
driver's network list.

The `ClearMacroForwarderV1WithPermit2` forwarder is already deployed at the same address
(`0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e`) on all 16 SDK chains, so app-side eligibility
(`isClearMacroSupportedOnNetwork`) turns on purely by adding `dashboardClearMacro.macroAddress` to the
network's block in `src/features/network/networks.ts`.

## Config sources and fee policy

- **host / FlowScheduler**: `@superfluid-finance/metadata` (`contractsV1.host` / `.flowScheduler`).
- **fee SuperToken**: the chain's USDCx wrapping the *native* USDC, from `@superfluid-finance/tokenlist`.
  On Optimism/Polygon/Arbitrum deliberately not the bridged `USDC.ex` — the fee token must exist as a
  `WrapperSuperToken` in the token list for the dashboard's pay-with-USDC (Permit2) path to resolve its
  underlying.
- **fee policy** (per-network configurable in the table; currently uniform): base fee `0.1e18` (must stay
  a multiple of `1e13`; raised from `0.01e18` on 2026-07-13), receiver
  `0xac808840f02c47C05507f48165d2222FF28EF4e1` (Superfluid DAO Safe, dao.superfluid.eth; changed
  2026-07-14 from the dedicated fee EOA `0x74cD5673dF7efC148067Ecab494A19a46b0a3167`, which the
  deployed OP Sepolia instance still uses). The Safe has code on eth-mainnet and Base today; on the
  other chains it can be re-instantiated at the same address before fees are collected. A new
  schedule pays 2x base per
  reserved keeper execution on top of the 1x relay fee (3x with one scheduled date, 5x with both);
  modify/cancel stay 1x. Fee config is immutable per deployment — changing it means redeploying.
- Overridable per invocation via `SUPERFLUID_HOST`, `FLOW_SCHEDULER`, `FEE_SUPER_TOKEN`, `BASE_FEE_AMOUNT`
  (`=0` → feeless), `FEE_RECEIVER`.

Cross-check performed 2026-07-09: every table row matches the metadata package and the token list
(host, flowScheduler, USDCx address + Wrapper type + native-USDC underlying) exactly.

## Usage

```bash
pnpm contracts:deploy all                     # simulate on all 9 chains (no account, no keys needed)
pnpm contracts:deploy base-mainnet            # simulate one chain
pnpm contracts:deploy --broadcast --verify --account <keystore> base-mainnet
pnpm contracts:deploy --verify base-mainnet   # verify the latest broadcast only
BASE_FEE_AMOUNT=0 pnpm contracts:deploy ...   # feeless deployment
RPC_URL_8453=https://... pnpm contracts:deploy base-mainnet   # RPC override
```

- Simulation is the default and runs the full script (config checks + constructor) against forked state.
- `--broadcast` refuses to run without `--account <keystore>` / `DEPLOYER_ACCOUNT`. forge's `--account`
  takes the plain keystore filename (e.g. `hacked_dev`), not the `0x`-prefixed name `cast wallet list` shows.
- `--verify` needs `ETHERSCAN_API_KEY` (Etherscan v2 multichain API) on every chain, OP Sepolia included.
  Verification args are read back from `contracts/broadcast/.../run-latest.json` so they always match the
  instance actually deployed.

After a real deployment (per network):

1. Add the printed snippet to that network's block in `src/features/network/networks.ts`
   (`dashboardClearMacro: { macroAddress: "0x..." }`, see the OP Sepolia block for the pattern).
2. Extend the deployment lineage comment in `src/features/clearMacro/dashboardClearMacro.ts`.
3. `pnpm contracts:abi` only if the external interface changed.

## CI deployment

`.github/workflows/deploy-clear-macro.yml` runs the same driver from GitHub Actions,
**manual dispatch only** (Actions → "Deploy Clear Macro" → Run workflow):

- Inputs: `network` (choice of the 9 eligible chains or `all`), `broadcast` (default off → simulation),
  `verify` (default on, only applied with broadcast).
- All per-chain settings stay hardcoded in the repo's scripts; CI supplies only the credentials:
  the org secret `BUILD_AGENT_MNEMONIC` (BIP-39 mnemonic of the funded deployer, account at
  derivation index 0, expected 0xd15d5d0f5b1b56a4daef75cfe108cb825e97d015 — the driver's
  `DEPLOYER_MNEMONIC` path, taking precedence over private key and keystore) and the repository
  secret `ETHERSCAN_API_KEY` (verification).
- Broadcasts are open to anyone with repo write access; there is deliberately no approval gate.
  A deployed macro has no user-facing effect until its address is added to
  `src/features/network/networks.ts` in a reviewed PR — that review is the effective gate.
- The gitignored `broadcast/*/run-latest.json` records are uploaded as a workflow artifact
  (`clear-macro-broadcast-<network>-<run id>`) — the durable record of what was deployed with which
  constructor args. The job summary shows the driver output including the `networks.ts` snippets.
- A concurrency group serializes runs so two deployments never race.

## Mainnet rollout caveat

The relay provider currently submits with a hard 200k gas cap while multi-op schedule actions need
~687k, so immediate-start relays revert OutOfGas until the provider uses the gas estimate (see
`clear-macro-immediate-start.md`). Deploying the macro is safe regardless (deployment and relay are
independent), but the end-to-end flow on new networks inherits this blocker.

## Retrospective

- `forge script` target resolution changed at some point: the historically documented
  `forge script script/DeployDashboardClearMacro.s.sol --root contracts` now fails with
  *"contract source info format must be `<path>:<contractname>`"*. The path must be resolvable from the
  CWD (not `--root`) and needs the `:DeployDashboardClearMacro` suffix; the driver uses an absolute path.
- On OP-stack chains, `forge script`'s post-run on-chain simulation enforces sender gas funds even in
  dry runs (`lack of funds (0) for max fee`), unlike L1 where a zero-balance default sender passes.
  Simulate mode therefore uses `--skip-simulation` — the script body (all requires + the constructor)
  still executes against forked state, which is the validation that matters.
- macOS ships bash 3.2, so the driver avoids associative arrays (case-based lookups instead).
- Address checksums in exploration notes/comments were unreliable; solc enforces EIP-55 on literals, and
  the table was checksummed with viem `getAddress` and cross-checked against the packages.
- A Codex review pass caught: `BASE_FEE_AMOUNT=0` initially left the table's fee token/receiver in the
  (unused) immutables — now zeroed; unknown chains initially fell through to a silently feeless deploy —
  `BASE_FEE_AMOUNT` is now required there; broadcast-record extraction now filters CREATEs by
  `contractName == "DashboardClearMacro"` instead of taking the first one.
