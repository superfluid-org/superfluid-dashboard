# Clear Macro: multi-network deployment tooling

Status: deployed on 4 of 9 eligible networks and wired up in the app. Tooling 2026-07-09;
first multi-network rollout and pipeline hardening 2026-07-20.

## Deployed instances

All four are the same build from master `28aa6ab2`, Etherscan-verified, at base fee 0.1 paying the
Superfluid DAO Safe `0xac808840f02c47C05507f48165d2222FF28EF4e1`:

| network | chainId | macro address |
|---|---|---|
| optimism-sepolia | 11155420 | `0x96ec6a06fb72c8C3e42E9DD3ae3525e7847078c3` |
| base-mainnet | 8453 | `0xC04FE9940e460457B75C3Aa4871bF142E0f49744` |
| arbitrum-one | 42161 | `0x3BDd82FFbCcB9DBD0c233Ecd950642edbF60D667` |
| optimism-mainnet | 10 | `0x4D11B0b59948d81EEAaF667CCDaA212f824949d4` |

Not yet deployed: eth-mainnet, bsc-mainnet, xdai-mainnet, polygon-mainnet, avalanche-c.

**Open follow-up:** the DAO Safe has no code on optimism-mainnet, arbitrum-one or optimism-sepolia.
Fees accrue there from the moment each address is wired into `networks.ts` and are only retrievable
once the Safe is instantiated at that address on those chains.

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
| optimism-sepolia | 11155420 | fUSDCx `0x131780640EDf9830099AAc2203229073d6D2FE69` |

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
  2026-07-14 from the dedicated fee EOA `0x74cD5673dF7efC148067Ecab494A19a46b0a3167` — the OP Sepolia
  redeploy on 2026-07-20 resolved that discrepancy, so all live instances now pay the Safe). Verified
  2026-07-20: the Safe has code only on **eth-mainnet and base-mainnet**; on the other 7 eligible
  chains it can be re-instantiated at the same address (Safe factory replay) before fees are
  collected — accepted deliberately, but it is an assumption, not a guarantee. A new
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
  instance actually deployed. That record is gitignored, so to verify a *CI* deployment locally, first
  pull the run's artifact into place (the archive preserves its `<chainId>/` level):

  ```bash
  gh run download <run id> --repo superfluid-org/superfluid-dashboard \
    --name "clear-macro-broadcast-<network>-<run id>" \
    --dir contracts/broadcast/DeployDashboardClearMacro.s.sol/
  ```

  Or just dispatch the workflow with `broadcast` unchecked and `run_id=<run id>`, which does this.

After a real deployment (per network):

1. Add the printed snippet to that network's block in `src/features/network/networks.ts`
   (`dashboardClearMacro: { macroAddress: "0x..." }`, see the OP Sepolia block for the pattern).
2. Extend the deployment lineage comment in `src/features/clearMacro/dashboardClearMacro.ts`.
3. `pnpm contracts:abi` only if the external interface changed.

## CI deployment

`.github/workflows/deploy-clear-macro.yml` runs the same driver from GitHub Actions,
**manual dispatch only** (Actions → "Deploy Clear Macro" → Run workflow):

Three mutually exclusive modes, selected by the inputs:

| inputs | job | what it does |
|---|---|---|
| `broadcast=true` | `deploy` | broadcasts, then verifies as a **separate** step |
| `broadcast=false`, `run_id` empty | `simulate` | dry run only |
| `broadcast=false`, `run_id=N` | `verify` | re-verifies the deployment recorded by run N, no redeploy |

- Inputs: `network` (choice of the 9 eligible chains or `all`), `broadcast` (default off → simulation),
  `verify` (default on; applies to broadcast runs only), `run_id` (verify-only recovery).
- **Deploy and verify are separate steps** in the broadcast job, and verification is
  `continue-on-error`. An explorer queue can outlast forge's retry budget long after the contract is
  safely deployed; conflating the two made a successful mainnet deploy look like a failed job, which
  invites a re-dispatch — and since this is a plain CREATE deploy, re-dispatching produces a *second*
  contract at a new address rather than resuming. The job summary reports deploy and verify status
  separately and, on verify failure, prints the exact verify-only re-run instruction.
- The verify-only job downloads the target run's artifact into
  `contracts/broadcast/DeployDashboardClearMacro.s.sol/` (the artifact preserves its `<chainId>/`
  level, so it unpacks straight into the path `verify_latest` reads) and needs `actions: read`.
  Bounded by artifact retention — 90 days by default; after that, verify manually with
  `forge verify-contract` and args re-derived from `_defaultConfig`.
- Foundry is pinned (`foundry-rs/foundry-toolchain@v1` with `version: v1.7.1`) in both this workflow
  and `contracts.yml`, and the deploy job logs `forge --version`. See the retrospective on build
  reproducibility for why.
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
  constructor args. Uploaded *before* verification runs, so the record survives a verify hang. The
  job summary shows the driver output including the `networks.ts` snippets.
- Simulations upload their records too (`clear-macro-dryrun-<network>-<run id>`). Note dry runs write
  to a different path — `.../<chainId>/dry-run/run-latest.json` — which the broadcast job's glob does
  not match.
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

### First multi-network rollout, 2026-07-20

- **A verification timeout is not a deploy failure.** The base-mainnet run deployed successfully, then
  went red because Etherscan's queue outlasted `forge verify-contract --watch` (~90s by default).
  Etherscan finished on its own minutes later; the contract had been fine the whole time. Fixed three
  ways: deploy and verify are separate steps, verify is `continue-on-error`, and the retry budget is
  now `--retries 20 --delay 15` (~5 min). **Always check the explorer before concluding anything from
  a red job**, and never respond to one by re-dispatching a broadcast.
- **Simulations predict a meaningless address.** With no wallet configured, `forge script` falls back
  to its built-in default sender `0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38`, so a dry run reports
  that sender's next CREATE address — `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519` at nonce 0. That
  address is shared by every Foundry user on earth and has unrelated traffic on mainnet explorers.
  It has no relationship to where a real broadcast lands. The simulate job's summary now says so.
- **Builds were not byte-reproducible across CI runs.** arbitrum-one's deployment came out with a
  different metadata IPFS hash than base / optimism / optimism-sepolia, despite identical source,
  identical commit `28aa6ab2`, identical solc 0.8.30 and byte-identical *executable* bytecode. Cause:
  `forge` auto-detected 8 remappings beyond the 7 declared in `foundry.toml` by walking the nested
  submodule tree under `lib/superfluid-protocol-monorepo/lib/`. None are used by the contract so
  codegen is unaffected, but `settings.remappings` is part of the compiler metadata, so any variation
  in what the walk finds changes the metadata hash embedded in the deployed bytecode. Fixed with
  `auto_detect_remappings = false` plus the pinned Foundry version. Consequence while it was
  unfixed: full deployed bytecode and `EXTCODEHASH` differ between chains, so exact-bytecode
  monitoring or allowlists would flag arbitrum-one as a different contract, and Sourcify-style
  verification treats it as a distinct build.
- **How to compare builds.** The trailing metadata hash is *not* a build fingerprint. Compare code
  size, then mask the artifact's `immutableReferences` spans and truncate before the CBOR metadata
  block before hashing. Derive that offset rather than hardcoding it: the last two bytes are a
  big-endian length `L` of the CBOR block, so it starts at `len(code) - 2 - L`. For the current
  19,879-byte build `L = 0x0033 = 51`, giving offset **19826** (the 32-byte IPFS hash itself starts
  10 bytes later, at 19836, after the `a2646970667358221220` header). Size alone is what correctly
  identified the two superseded 19,852-byte instances; the metadata hash alone would have given a
  false negative on arbitrum-one.
- **CREATE2 was analysed and deferred.** The appealing idea — "one version, one address on every
  chain" — does not follow from CREATE2 alone, because the CREATE2 address depends on
  `keccak256(initcode)` and initcode embeds the ABI-encoded constructor args, which are chain-specific
  here (`host`, `flowScheduler`, `feeSuperToken`). CREATE2 as-is would buy only idempotency: a second
  broadcast reverts instead of silently duplicating (~1-2h of work). True cross-chain parity would
  additionally require moving `_defaultConfig` into the contract constructor keyed on `block.chainid`
  so the constructor takes zero args (~1 day) — at the cost of the `FEE_RECEIVER` /
  `BASE_FEE_AMOUNT=0` overrides, which break parity by definition, and of redeploying every live
  chain to join. The deterministic deployment proxy `0x4e59b44847b379578588920cA78FbF26c0B4956C` is
  present on all 9 eligible chains, and the contract has 4,697 bytes of size headroom, so both shapes
  are feasible. **Note the ordering constraint:** initcode also embeds the metadata block, so
  reproducible builds are a *precondition* for CREATE2 parity — without the remappings fix above,
  even the zero-args design would produce different addresses per chain.
