# Plan: Migrate Redux write/read endpoints off sdk-core/ethers v5 → @sfpro/sdk + viem/wagmi (Clear-Macro-ready)

> Preparation material capturing intent, the migration surface, the approach, sequencing, and open
> questions.

## Context — why this change

The write path is built on `@superfluid-finance/sdk-core` (over-abstracted, locked to **ethers v5**)
and `@superfluid-finance/sdk-redux` (pre-wagmi Redux hooks) — both **deprecated**, replaced by
`@sfpro/sdk` (typed ABIs + viem/wagmi actions). The app is already fully on wagmi v2 / viem / Reown
AppKit for wallet connection; only the contract-interaction layer still drags ethers v5 + sdk-core.

**Two goals:**
1. **Gradually** migrate write (and direct-chain RPC read) endpoints off sdk-core, expressing
   interactions as type-safe, generated viem/wagmi calls (ABIs primarily from `@sfpro/sdk`, the rest
   generated locally via the existing `wagmi.config.ts`).
2. **Prepare** (not implement) for the **Clear Macro Forwarder** + a `DashboardClearMacro` contract.
   The end state must support **both** bare wagmi `writeContract` (self-pay) **and** Clear Macro
   (signing + optional gasless relay). This is partly a **dogfooding** experiment for `@sfpro/sdk`
   (the user maintains the SDK and patches it downstream as gaps surface).

A working **PoC already exists** for the simplest case (GDA pool connect/disconnect) and establishes
the hook pattern; this plan generalizes it across the whole surface.

### Scope decisions (confirmed)
- **Native mutations in scope:** also migrate sdk-redux-native `SuperTokenUpgrade`/`Downgrade`
  (wrap/unwrap) and IDA index-subscription approve/revoke — not only app-defined endpoints.
- **Reads:** migrate **direct-chain RPC reads** to viem `readContract`; **leave `subgraphApi`
  (GraphQL) on sdk-redux** (RTK Query is version-locked). sdk-core entity *types* it feeds the UI
  (`Stream`, `PoolMember`, `IndexSubscription`, …) therefore **stay** for now.
- **Tx tracking stays as the bridge:** keep sdk-redux `registerNewTransaction` + the read-only ethers
  `Framework` (confirmation/reorg watching, drawer, restore, redux-persist). **ethers v5 is not fully
  removed in this plan** — that's a later epic gated on a viem-native confirmation watcher.
- **Redux stays underneath, but writes leave RTK Query entirely (uniform Mechanism A — see below).**

---

## Architecture — uniform per-use-case wagmi hooks over a Redux persistence backbone

We move **every** write off RTK Query mutations and onto per-use-case wagmi hooks ("Mechanism A").
We do **not** keep any write as an RTK Query mutation. Redux does not leave the app — but its role for
writes narrows to a **dumb persistence sink**: the tx tracker (drawer, confirmation/reorg watching,
restore, persistence) and the `pendingUpdates` slice (optimistic UI + removal). Reads stay on RTK
Query / subgraphApi.

```
Feature hook (per use-case)        useTokenWrap(), useUpsertFlow(), useCreateVestingSchedule(), …
  reads (allowance/needsApproval, getActiveFlow, getFlowSchedule, …) → viem readContract
  simulate → estimateGas(+buffer) → write → trackTransaction(hash, pendingUpdates[])
        │
Shared executor                    useSuperfluidWriteContract (PoC, generalized)
  wagmi write + simulate + gas + MutationResult shape + light error/analytics
        │
Shared op-building                 @sfpro/sdk: prepareOperation / OPERATION_TYPE / Operation
  single call OR Host.batchCall(ops[])
        │
Redux persistence sink (unchanged) registerNewTransaction (tracker)  +  pendingUpdateSlice
  tx drawer/restore/persist  +  optimistic-update removal (keyed on tracker events + subgraph sync)
```

### Why this is clean
The only thing RTK Query mutations bought us was the **declarative `matchFulfilled` matcher** that
*created* optimistic pending updates. Everything else (tx tracking, persistence, drawer, pending
*removal*) is independent of how the write was triggered — removal is driven by
`transactionTracker.actions.updateTransaction` matchers + subgraph sync in `pendingUpdate.slice.ts`,
which don't care about the write's origin. So going uniform-hooks costs exactly one thing: moving the
conditional pending-**creation** logic out of the slice matchers. The pool PoC already proves the
pattern end-to-end (it creates `PendingConnectToPool` imperatively via `getPendingUpdate(hash)` →
`trackTransaction` → `addOne`, and removal still works via the unchanged tracker matchers).

### `buildPendingUpdates` — port the matchers into a shared pure helper
~13 endpoints have conditional, sometimes multi-entry pending-creation in the slice matchers (e.g.
flow/vesting emit derived ids like `${hash}-CreateTaskCreate`). Port that logic into a single pure
helper `buildPendingUpdates(args, subTransactionTitles): PendingUpdate[]` that each feature hook calls
and hands to the executor's `getPendingUpdates(hash)`. This keeps the brittle, title-string-coupled
logic in **one** reviewable place (mirrors where it lives today) rather than scattering it across
hooks, and co-locates nothing the slice still needs (removal matchers stay in the slice).

### Feature-hook shape (per the reference `useTokenWrap`)
Feature hooks follow this wagmi-native structure (adapted to this app):
- Compose prerequisite reads (e.g. an `useTokenApprove` sub-hook for allowance/`needsApproval`,
  or `getActiveFlow`/`getFlowSchedule`) via viem `readContract` / existing RTK read endpoints.
- **`useSimulateContract`** (query-`enabled` only when inputs are valid) as a pre-flight revert check;
  surfaces `simulate.data.request`.
- **`useEstimateGas`** off the simulated `request` — separate call (simulate does **not** return a gas
  limit), with a **+20% buffer** (`select: d => d*120n/100n`) and a `stateOverride` faking native
  balance so estimation doesn't fail on gas-poor accounts.
- **`useWriteContract`** → spread `request` + `{ gas: estimatedGas }`.
- Hand the resulting hash to **`trackTransaction`** (tracker + pending updates). `useWaitForTransaction
  Receipt` is optional for a local `isFinished`, but **the drawer's confirmation state already comes
  from the tracker** — don't duplicate it as the source of truth.
- Expose a `status` ({isLoading, isFinished, isError, error}) and `reset`, plus the `MutationResult`
  shape the existing `TransactionBoundary`/`TransactionDialog` consume (the executor already maps it).

**Gas/overrides reconciliation (decide during impl):** the app currently injects EIP-1559 fee fields
(`maxFeePerGas`/`maxPriorityFeePerGas`) from its gas API via `useGetTransactionOverrides` +
`ethersOverridesToViem`, and uses `gasLimit:0` to signal "let the smart wallet/Safe estimate." The
reference hook instead estimates the **gas limit** locally and lets the wallet pick fees. Combine
them: fee fields from `useGetTransactionOverrides`, gas **limit** from `useEstimateGas`+buffer —
**except** for smart wallets (`gasLimit:0` case) where we omit `gas` and skip local
estimate/simulate (the simulated context differs from 4337/delegatecall execution).

### Shared op-building layer (the batchCall replacement)
From `@sfpro/sdk/constant` (confirmed against the SDK's `tests/batchcall.live.test.ts`):
`OPERATION_TYPE`, `type Operation = {operationType,target,data,userData?}`, `prepareOperation(...)`,
`stripFunctionSelector(...)`. Build a sub-op with
`prepareOperation({operationType, target, data: encodeFunctionData({abi, functionName, args}),
userData})`, then execute single ops directly or many via Host `batchCall`
(`writeContract({address: hostAddress[chainId], abi: hostAbi, functionName:'batchCall', args:[ops],
value})`). Op-type mapping: CFA create/update/delete + flow-operator/allowance →
`SUPERFLUID_CALL_AGREEMENT` on `cfaAddress`; GDA distributeFlow(cancel) → same on `gdaAddress`;
`callAppAction(flowScheduler,…)` → `CALL_APP_ACTION` (build calldata with sfpro `flowSchedulerAbi`);
ERC20 approve → `ERC20_APPROVE` (+`stripFunctionSelector`); vesting → `ERC2771_FORWARD_CALL` on
`vestingSchedulerV3Address`. sfpro is generated off **all** vesting scheduler ABIs (v1/v2/v3), so the
overloaded signatures are covered. `subTransactionTitles` is built alongside the op list (same
title-per-op structure as today) and threaded into `extraData`.

---

## Mid-build & RPC reads — swap internals ethers → viem
Replace ethers Framework reads with viem `readContract` via `publicClient` + sfpro ABIs (follow
`src/features/redux/endpoints/balanceFetcher.ts`, which already does this). Reads: `getActiveFlow`,
`balance`, `underlyingBalance(s)`, `realtimeBalance`, `realtimeBalanceOfNow`, `tokenBuffer`, `isEOA`,
`getFlowSchedule`, vesting reads (`getActiveVestingSchedule`, allowances, constants), plus mid-build
`getFlowOperatorData` / `allowance` / `mapCreateVestingScheduleParams` /
`getMaximumNeededTokenAllowance`. RPC read **endpoints** stay RTK Query (locked) — only the `queryFn`
body changes; reads called directly from feature hooks can use viem `readContract` (or wagmi read
hooks) outright. Reconcile addresses: prefer sfpro `*Address` maps, fall back to
`@superfluid-finance/metadata`; **add a runtime guard for unsupported chains** instead of the PoC's
blind `chainId as SupportedChainId` cast.

---

## Migration surface (inventory)

**Simple single-call:** `gda.cancelDistributionStream`, `adHocRpc.approve` (ERC20 underlying),
`adHocRpc.transfer`, `adHocRpc.writeContract`, `SuperTokenUpgrade`/`Downgrade` (wrap/unwrap).
`gda.connectToPool`/`disconnectFromPool` ✅ done.

**Hard dynamic `batchCall` w/ `subTransactionTitles`:** `flowScheduler.upsertFlowWithScheduling`,
`deleteFlowWithScheduling`; `vesting.createVestingSchedule`,
`createVestingScheduleFromAmountAndDuration`, `deleteVestingSchedule`, `claimVestingSchedule`,
`fixAccessForVesting`; `batchVesting.executeBatchVesting`; `tokenAccess.updateAccess`/`revokeAccess`;
`vestingAgora.executeTranchUpdate`.

**IDA (legacy, low traffic):** `indexSubscriptionApprove`/`indexSubscriptionRevoke` via
`Host.callAgreement` + sfpro `idaAbi` (no forwarder exists).

**RPC reads:** listed above (swap to viem).

**Out of scope:** `subgraphApi` GraphQL queries + the sdk-core entity types they feed; the tx tracker
+ read-only Framework.

---

## Sequencing (one uniform pattern; delete each old endpoint + matcher per migrated consumer)
0. **Foundation:** generalize `useSuperfluidWriteContract` to `getPendingUpdates` (array) +
   `subTransactionTitles` passthrough + gas-estimate/override reconciliation; add the shared
   op-building helpers (sfpro `prepareOperation`); add `buildPendingUpdates` pure helper skeleton;
   add unsupported-chain address guard.
1. **Simple single-calls:** `cancelDistributionStream`, `approve`, `transfer`, `writeContract`,
   wrap/unwrap (the reference `useTokenWrap` is the template for wrap; pair with `useTokenApprove`).
2. **Token access:** `updateAccess`, `revokeAccess` — first real batch; no pending coupling.
3. **Flow scheduling:** `upsert`/`deleteFlowWithScheduling` — heaviest conditional logic + multi-entry
   pendings (port those matcher blocks into `buildPendingUpdates` first).
4. **Vesting:** the five vesting endpoints + `executeBatchVesting` (ERC2771 ops; v1/v2/v3 abis).
5. **`executeTranchUpdate`:** largest dynamic multi-op; last of the writes.
6. **IDA:** approve/revoke via Host + `idaAbi`.
7. **RPC reads:** swap read `queryFn`s to viem (interleave as each is touched).

Per migrated endpoint: build the feature hook → flip its UI consumer(s) → move pending-creation into
`buildPendingUpdates` → delete the old RTK mutation endpoint **and its slice `matchFulfilled` matcher**
once `grep use<X>Mutation` shows zero references. Removal matchers in the slice stay.

---

## Clear Macro preparation (do NOT build now)
No intent/lowering abstraction yet — tackle Clear Macro as a separate story. Getting the whole write
path onto unified wagmi/viem + `@sfpro/sdk` already puts us in a much better spot (Clear Macro is
itself a wagmi/viem integration: `clearMacroForwarderAbi` + `read/simulate/writeClearMacroForwarder*`
+ EIP-712 helpers, all in the SDK). The only forward-compat invariant to keep now: **`trackTransaction`
/ `registerNewTransaction` must stay hash-source-agnostic**, so a relayed Clear Macro tx (signer ≠
submitter) feeds the tracker through the same bridge. Self-pay vs relay naturally abstracts under the
feature hook later.

---

## Generation strategy
Make **`@sfpro/sdk` the source of truth** for ABIs/addresses (`abi`, `abi/core`, `abi/automation`,
`constant`, `action/*`). Migrate `src/generated.ts` consumers per-endpoint as touched. Keep the local
`wagmi.config.ts` only for contracts sfpro lacks (notably the future `DashboardClearMacro`). Missing
exports/op-helpers can be added upstream in `@sfpro/sdk` as part of the dogfooding.

---

## Critical files
- `src/features/transactions/useSuperfluidWriteContract.ts` — shared executor; generalize to
  `getPendingUpdates` + `subTransactionTitles` + gas/override reconciliation + light error/analytics.
- `src/features/transactions/trackTransaction.ts` — keep hash-source-agnostic; array pendings.
- `src/features/pendingUpdates/pendingUpdate.slice.ts` — port the `matchFulfilled` *creation* blocks
  into `buildPendingUpdates`; keep the tracker-driven *removal* matchers.
- `src/features/pool/usePoolConnectionWrites.ts` / `ConnectToPoolButton.tsx` — the done reference for
  the simple feature-hook shape.
- `src/features/redux/endpoints/{flowScheduler,vestingScheduler,vestingAgora,tokenAccess,gda,adHocRpc,
  batchVesting}Endpoints.ts` — the logic to port into feature hooks + op-builders.
- `src/features/redux/endpoints/balanceFetcher.ts` — existing viem+sfpro read pattern to follow.
- `src/features/tokenWrapping/TabWrap.tsx` / `TabUnwrap.tsx`, `src/features/index/SubscriptionRow.tsx`
  — native-mutation consumers (wrap/unwrap, IDA).
- `src/hooks/useGetTransactionOverrides.tsx` + `src/utils/ethersOverridesToViem.ts` — gas/override
  reconciliation with the new `useEstimateGas` path.
- `wagmi.config.ts` / `src/generated.ts` — shrink toward sfpro.
- Reference: the `useTokenWrap` hook (simulate→estimate→write→wait) + `@sfpro/sdk`
  `tests/batchcall.live.test.ts` (op-building + Host batchCall).

### Docs / lookups for implementation
- **wagmi / viem APIs** → read via **Context7 MCP** (`resolve-library-id` → `query-docs`) rather than
  recalling from memory — covers `useSimulateContract`/`useEstimateGas`/`useWriteContract`/
  `useWaitForTransactionReceipt`, `@wagmi/core` actions, viem `encodeFunctionData`/`readContract`/
  `stateOverride`.
- **Superfluid protocol / `@sfpro/sdk` / Clear Macro** → the `superfluid` skill (ABIs, op types,
  addresses, `clear-macro.md`). **viem patterns** → the `viem-integration` skill.

---

## Open questions & resolved concerns
- **(resolved) Mechanism** — uniform per-use-case wagmi hooks; no RTK mutations retained for writes.
- **(resolved) Pending updates** — creation ported to `buildPendingUpdates`; removal matchers unchanged.
- **(resolved) Vesting overloads** — sfpro generated off v1/v2/v3 ABIs.
- **(resolved) SDK pre-1.0 risk** — dogfooding; user owns the SDK.
- **Gas/override reconciliation** — combine app fee-overrides with local `useEstimateGas`+buffer;
  omit `gas`/skip simulate for smart wallets (`gasLimit:0`). Confirm Safe/AppKit behavior in testing.
- **Error monitoring & analytics — low priority.** Wire Sentry capture + analytics through the shared
  executor so they don't regress, but **don't over-invest**: neither is closely monitored, and Segment
  analytics is currently **disabled on the integration side**. Best-effort parity is enough.
- **`useWaitForTransactionReceipt` vs tracker** — tracker remains the source of truth for drawer
  confirmation/restore; use the wagmi hook only for a local `isFinished` if a feature needs it. Note
  the reference's `queryClient.invalidateQueries` targets wagmi's TanStack cache; our reads are mostly
  RTK Query, so post-confirmation refresh stays via RTK tags + pending-update removal.
- **Verify native flow matchers still used** — `flowCreate`/`flowUpdate`/`flowDelete` (sdk-redux
  native) have pending-slice matchers but the app uses `upsert/deleteFlowWithScheduling`; confirm
  before removing those matchers.
- **Clear Macro** — separate later story (see above).

---

## Verification (automated testing is a SEPARATE, later story — not implemented now)
- `pnpm typecheck` + `pnpm lint` after each phase (watch for `any` leakage at call sites).
- **Manual testing by the developer** on testnet (e.g. optimism-sepolia) per migrated flow: wallet
  prompt, optimistic pending (`PendingProgress`), drawer `subTransactionTitles`, success/restore,
  error display incl. user-reject. Run the **existing app test suite** (`tests/`, Cypress) which
  should behave the same. New op-builder/unit coverage is a follow-up story.
- Per phase, diff old vs new behavior before deleting any endpoint/matcher.
