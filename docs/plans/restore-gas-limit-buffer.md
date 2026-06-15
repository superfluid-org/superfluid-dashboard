# Plan: Restore the +20% gas-limit buffer dropped in the wagmi write-path migration

> Hand-off document for an implementing agent. Self-contained. The work spans: the core write
> executor (§1), a behavior-preserving `simulate` cleanup across the feature hooks (§2), and a small
> relay-fallback UI touch (§3: `src/MutationResult.ts:8` + `src/features/transactionBoundary/
> TransactionDialog.tsx:68`). Verified facts and line references are as of branch
> `2026-06-10-maintenance`.

## Context — why this change

The write path was migrated off `@superfluid-finance/sdk-core` (ethers v5) onto a shared wagmi/viem
executor, `src/features/transactions/useSuperfluidWriteContract.ts`. On **every** operation, the old
sdk-core path (`Operation.exec`) made **one** `eth_estimateGas` call that did two jobs at once:

1. a **+20% gas-limit buffer** — `populatedTransaction.gasLimit = multiplyGasLimit(estimated, 1.2)`
   (default `gasLimitMultiplier = 1.2`). This protects against out-of-gas reverts on Superfluid
   agreement calls and Host `batchCall`s, whose real on-chain gas can exceed a bare estimate because
   of SuperApp callbacks and solvency-dependent branches.
2. an **early revert check** — `estimateGas` reverts when the tx would revert, so the error surfaced
   in the dashboard *before* the wallet prompt.

The migration dropped gas estimation entirely. The revert-check half came back only as an opt-in
`simulate: true` flag, wired into just 5 call sites (pool connect/disconnect + 3 auto-wrap buttons;
added in migration commit `d0a4d719` and auto-wrap alignment `3ced32fd`). **The buffer half was
never restored** (flagged unfinished in `docs/plans/write-path-migration-sfpro-viem.md`, lines 86,
98-102, 230).

Today, for an EOA wallet, the request carries no `gas` field, so the gas limit comes entirely from
the wallet's own estimator. (Note: viem only self-estimates gas for *local* accounts; for JSON-RPC /
injected / WalletConnect accounts it forwards to `eth_sendTransaction` and the wallet estimates.)

**Goal:** restore parity — a best-effort +20% gas-limit buffer on EOA writes — without regressing the
smart-wallet or Clear Macro relay paths.

## The model — one pre-flight call, as in sdk-core

`estimateContractGas` and `simulateContract` both run a pre-flight call that throws the same decoded
viem revert error — but via different RPC methods: `estimateContractGas` issues `eth_estimateGas` (and
*also* returns a gas number), while `simulateContract` issues `eth_call`. `eth_estimateGas` is the
truer sdk-core parity (`Operation.exec` also estimated gas). So we reunify them into a **single
estimate call** on every self-paying EOA write, restoring exactly the pre-migration behavior (buffer +
revert check in one call).

## Confirmed decisions (with rationale)

- **Apply to all EOA writes, decoupled from `simulate`.** Gating on `simulate` would skip nearly
  every write that needs the buffer — including the dynamic flow-scheduling and vesting `batchCall`s,
  which run with `simulate` off. Pre-migration, every write went through sdk-core's `estimateGas`, so
  "every write" *restores* the prior baseline; it is not new risk. Note, though, that vs. *today* this
  is new latency: it adds a pre-flight `eth_estimateGas` round-trip to every EOA write that currently
  runs with `simulate` off (most of them) — e.g. a plain transfer now estimates before prompting.
- **Strict on a real contract revert; best-effort (with logging) on everything else.** Throw **only**
  on a confirmed execution revert — `ContractFunctionRevertedError` / `ExecutionRevertedError` (see the
  discriminator in §1b) — which surfaces in the dialog (sdk-core parity). On **any other** estimate
  failure (transport/timeout, `eth_estimateGas` unsupported, node hiccup, or an unrecognized error),
  call `Sentry.captureException(error, { level: "warning" })`, then omit `gas` and let the wallet
  estimate. This restores the lost check without letting a flaky node block an otherwise-valid write.
  We deliberately do **not** use a "throw unless it's a known-infra class" allowlist: any infra class
  we failed to enumerate would block an otherwise-valid write — the exact regression this work exists
  to avoid. The wallet re-estimates as the final authority, so falling back never strands the user, and
  the Sentry warning gives visibility into how often estimates fail. The feared non-revert cases
  (insufficient funds) are designed out anyway by fee-omission + `value = 0` (see the next decision).
- **No `stateOverride`.** sdk-core did NOT use one (verified in its `Operation.ts`: plain
  `estimateGas` → `multiplyGasLimit(_, 1.2)`). A balance-faking override was suggested in the
  migration plan but came from an external example hook, not sdk-core. It is also unnecessary: the
  estimate omits fee fields, so `eth_estimateGas`'s pre-pay check reduces to `balance ≥ value`, which
  passes for all non-payable calls (`value = 0`) and for native wraps whenever the form's own balance
  check passes. This already holds for this app's wallets: viem's `estimateGas` only fills fees for
  *local* accounts; for json-rpc/injected accounts it passes `parameters = ['blobVersionedHashes']` to
  `prepareTransactionRequest` (`estimateGas.js:44`), so no fee fields are filled (`shouldAttempt` false
  at `prepareTransactionRequest.js:132`; `includes('fees')` false at `:292`). Passing `prepare: false`
  on the estimate (see §1c) pins this guarantee explicitly and skips the prepare round-trip.
- **Remove the `simulate` flag + the normal-path `simulateContract` block.** All 5 current
  `simulate: true` sites have `gas === undefined`, so they take the new estimate branch — the estimate
  is their revert check, and nothing in the normal write path calls `simulateContract` anymore.
  Removing the flag + block is behavior-preserving. **The Clear Macro fallback simulation stays**
  (`executeClearMacro.ts` still calls `simulateContract` with `fallbackSimulationRequest`), and the
  hook keeps the `simulateContract` import for that path's type cast (see §1d / §3-adjacent notes).
- **Stay on the on-click model.** The preflight runs inside the mutation, on button click. Upfront
  (pre-click) reactive simulation is a deliberate future follow-up, NOT part of this change (see end).

## Background & research context — should a dApp pass a gas limit at all?

This is genuinely debated; the short version is "it depends, and Superfluid is one of the cases where
a buffered limit is justified." Useful context for anyone reviewing the decision:

- **viem only self-estimates gas for *local* accounts, not injected wallets.** When `gas` is omitted:
  a **local account** (private key in process) → viem runs `prepareTransactionRequest` →
  `eth_estimateGas`, signs, sends raw; a **JSON-RPC account** (MetaMask / WalletConnect — what this
  app uses) → viem forwards to `eth_sendTransaction` and the **wallet** fills in the gas limit. So
  today the dashboard's EOA gas limit comes from the wallet, not viem. (Some docs that say "viem
  always estimates" are describing the local-account path.)
- **General ecosystem guidance leans "let the wallet estimate"** — wallets have balance/network
  context, and a wrong dApp-supplied limit can fail a tx while still spending gas. MetaMask in
  particular runs its own estimate and may override a dApp-supplied limit.
- **But two well-documented cases argue for supplying a (buffered) limit, and this app hits both:**
  1. *MetaMask issue #9967* — when a dApp sets fee fields (`maxFeePerGas`) but **no** gas limit and
     the account is short on balance, MetaMask can balloon the limit to the *block* gas limit →
     absurd displayed cost. This app **does** inject fee fields from its gas API
     (`useGetTransactionOverrides`), so it is in this risk class; an explicit limit avoids it.
  2. *Underestimation on dynamic protocols* — exactly the Superfluid case. Agreement calls and Host
     `batchCall`s hit SuperApp callbacks and solvency-dependent branches whose real gas exceeds a
     bare `eth_estimateGas`. This is precisely why sdk-core shipped the `1.2×` buffer on every op.
- **Honest caveat:** MetaMask users may see the wallet re-estimate over the supplied limit, so the
  buffer's clearest beneficiaries are the #9967 footgun and wallets that honor dApp limits (many
  WalletConnect mobile wallets). It is still net-positive and restores pre-migration parity.

## Skip conditions (no estimate / no buffer)

- **Smart wallets** — the existing `gas: 0n` sentinel (`isSmartWallet`, set by
  `useGetTransactionOverrides` when `isEOA === false`) already omits gas; leave estimation to the
  wallet (4337 / delegatecall execution context differs from the simulated EOA call).
- **Clear Macro relay path** — the relay provider pays gas; fee/gas overrides don't apply. The relay
  branch returns from `mutationFn` on success, so the new estimate (placed after it) never runs for a
  relayed tx.
- **Explicit per-call `gas` override** — when a caller passes `overrides: { gas }` (e.g. the
  `200_000n` IbAlluo workaround in `TabWrap.tsx`), `gas !== undefined`, so the estimate is skipped and
  the override is respected, exactly as today.

## Current code state (for grounding)

In `useSuperfluidWriteContract.ts`, `mutationFn` currently builds the request and then runs an
optional simulate before the write (abridged, ~lines 143-233):

```ts
const { gas, ...feeOverrides } = { ...resolvedOverrides, ...params.overrides };
const isSmartWallet = gas === 0n;

const request = {
  chainId: params.chainId, abi: params.abi, address: params.address,
  functionName: params.functionName, args: params.args, account: address,
  ...(params.value !== undefined ? { value: params.value } : {}),
  ...feeOverrides,
  ...(!isSmartWallet && gas !== undefined ? { gas } : {}),
} as Parameters<typeof writeContract>[1];

// ... Clear Macro relay branch: on success `return { hash, chainId }` ...

if (params.simulate && !isSmartWallet) {
  await simulateContract(config, request as Parameters<typeof simulateContract>[1]);
}
const hash = await writeContract(config, request);
```

## Implementation

### 1. Core change — `src/features/transactions/useSuperfluidWriteContract.ts`

**a. Imports.** Add `getPublicClient` from `@wagmi/core` (already used in
`src/features/wallet/wagmiConfig.ts:271`). `@wagmi/core` has no `estimateContractGas`, but the viem
public client returned by `getPublicClient(config, { chainId })` exposes it. Add the viem error
classes for the discriminator (`BaseError`, `ContractFunctionRevertedError`, `ExecutionRevertedError`)
and `import * as Sentry from "@sentry/react"` (matches `src/features/redux/store.ts:14`). **Keep** the
`simulateContract` import — it is still used by the Clear Macro fallback cast at
`useSuperfluidWriteContract.ts:188`. (Optional: `wagmiConfig.ts` also exposes a cached
`resolvedWagmiClients` per chain; reusing it instead of a fresh `getPublicClient` is consistency-only,
not required.)

**b. Revert-vs-infra discriminator** (module scope, near `toSerializedError`):

```ts
import { BaseError, ContractFunctionRevertedError, ExecutionRevertedError } from "viem";

// True  = the EVM actually reverted (decodable on-chain revert) → surface in the dialog.
// False = the generic ContractFunctionExecutionError wrapper around a transport/timeout/
//         unsupported-method failure → best-effort: omit gas, let the wallet estimate.
function isContractRevert(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false;
  return !!error.walk(
    (e) =>
      e instanceof ContractFunctionRevertedError ||
      e instanceof ExecutionRevertedError
  );
}
```

Do **not** match `ContractFunctionExecutionError` or `CallExecutionError` (verified against viem
2.52.2): `estimateContractGas` rethrows every failure through `getContractError`, which **always**
wraps in `new ContractFunctionExecutionError(cause, …)` (`getContractError.js:34`), and
`BaseError.walk()` tests the outer error first — so matching that wrapper returns `true` for *every*
failure and makes the best-effort branch dead code. The decoded revert lives at the
`ContractFunctionRevertedError` cause (`getContractError.js:22–30`); `ExecutionRevertedError` is the
lower-level execution-reverted signal kept as belt-and-suspenders. Both are re-exported from
top-level `viem`.

> **Implementation note (as shipped, 2026-06-15).** A Codex review against the installed viem 2.52.2
> caught that `ExecutionRevertedError` is **overloaded**: its `nodeMessage` regex is
> `/execution reverted|gas required exceeds allowance/` (`errors/node.ts`), so the same class is
> produced both for a genuine bare revert AND for a "gas required exceeds allowance" gas-cap/estimation
> failure (code -32000) — which is **not** a contract revert and must fall back to wallet estimation,
> not block the write. The shipped `isContractRevert` therefore keeps `ContractFunctionRevertedError`
> definitive but narrows the `ExecutionRevertedError` arm to `!/gas required exceeds allowance/i.test(e.message)`.
> See the retrospective in `write-path-migration-sfpro-viem.md` for the rationale.

**c. Unified estimate + buffer**, replacing the standalone `simulateContract` block. Note `request`
must become mutable (relax the `const`-cast, or reassign via spread) so `request.gas` can be set:

```ts
const GAS_LIMIT_MULTIPLIER_NUM = 120n; // sdk-core parity: +20%
const GAS_LIMIT_MULTIPLIER_DEN = 100n;

// ...request built as today... Clear Macro branch unchanged (returns on success).

if (!isSmartWallet && gas === undefined) {
  // Unified pre-flight (sdk-core parity): one call that buffers gas AND checks for reverts.
  const publicClient = getPublicClient(config, { chainId: params.chainId });
  try {
    const estimated = await publicClient!.estimateContractGas({
      abi: params.abi,
      address: params.address,
      functionName: params.functionName,
      args: params.args,
      account: address,
      ...(params.value !== undefined ? { value: params.value } : {}),
      // Plain eth_estimateGas, no fee prepay: json-rpc/injected accounts already skip fee-fill
      // (estimateGas.js:44 → ['blobVersionedHashes']); `prepare: false` pins it + skips the
      // prepare round-trip, keeping the pre-pay check at `balance >= value`.
      prepare: false,
    } as Parameters<NonNullable<typeof publicClient>["estimateContractGas"]>[0]);
    request.gas = (estimated * GAS_LIMIT_MULTIPLIER_NUM) / GAS_LIMIT_MULTIPLIER_DEN;
  } catch (error) {
    if (isContractRevert(error)) throw error; // surface real reverts in the dialog
    // infra/RPC failure (incl. publicClient undefined) — log, then best-effort: omit gas
    // and let the wallet estimate.
    Sentry.captureException(error, { level: "warning" });
  }
}
// No `simulate` branch: the estimate above is the revert check for EOAs. Explicit-gas-override
// writes (gas !== undefined, e.g. IbAlluo) and smart wallets go straight to writeContract.

const hash = await writeContract(config, request);
```

**Placement matters:** this block lives in the normal write path, which runs only AFTER the Clear
Macro branch. The relay branch returns on success, so the estimate never runs for a relayed tx —
only for self-pay writes (including the relay-fallback case, where self-paying is the new reality and
estimating is correct). Smart wallets are excluded by `!isSmartWallet`.

**d. Drop the `simulate` field** + its doc comment from `SuperfluidWriteArgs` (`:78–79`), and remove
**only** the `params.simulate` simulate-block usage (`:226–231`). **Keep** the `simulateContract`
import — it is still referenced by the Clear Macro fallback cast at `:188`
(`request as Parameters<typeof simulateContract>[1]`), so removing it would break the build.

### 2. Cleanup — remove the dead `simulate` plumbing (behavior-preserving)

Remove `simulate?: boolean` from the feature-hook arg interfaces and their `simulate: arg.simulate`
passthroughs:
- `src/features/send/transfer/useTransfer.ts`
- `src/features/tokenWrapping/useTokenWrapWrites.ts`
- `src/features/send/useFlowSchedulingWrites.ts`
- `src/features/vesting/useVestingWrites.ts` (×5 interfaces)
- `src/features/vesting/agora/useExecuteTranchUpdate.ts`
- `src/features/tokenAccess/useTokenAccessWrites.ts` (×2)
- `src/features/pool/useDistributionWrites.ts`
- `src/features/pool/usePoolConnectionWrites.ts`
- `src/features/index/useIndexSubscriptionWrites.ts`
- `src/features/auto-wrap/useAutoWrapWrites.ts`

Remove the 5 `simulate: true` props at the call sites:
- `src/features/pool/ConnectToPoolButton.tsx`
- `src/features/pool/DisconnectFromPoolButton.tsx`
- `src/features/vesting/transactionButtons/AutoWrapStrategyTransactionButton.tsx`
- `src/features/vesting/transactionButtons/AutoWrapAllowanceTransactionButton.tsx`
- `src/features/vesting/transactionButtons/DisableAutoWrapTransactionButton.tsx`

Then `grep -rn "simulate" src` should show no stray `simulate?`/`simulate: true` plumbing. The only
remaining `simulateContract` references are legitimate: `useSuperfluidWriteContract.ts:10` (import) +
`:188` (the Clear Macro fallback cast), and the `fallbackSimulationRequest` + `simulateContract` in
`src/features/clearMacro/executeClearMacro.ts`.

### 3. Relay-fallback UI feedback — new `"fallback"` `RelayPhase`

When the Clear Macro relay bails out **pre-signature** (`ClearMacroNotEligibleError` — no forwarder
deployment, relay capabilities unavailable, payload-assembly/digest mismatch), the write falls through
to a self-pay transaction. Today that switch is silent (`setRelayPhase(undefined)` + a `console.warn`);
surface it so the user knows this tx is no longer gasless. This reuses the existing phase-narration
mechanism end-to-end — no new component or notification.

**a. Type** — `src/MutationResult.ts`: extend the union to
`"preparing" | "awaiting-signature" | "relaying" | "fallback"` and update its doc comment
(`"fallback"` = relay was attempted but not eligible; the tx is proceeding as a normal self-pay write).

**b. Set it** — `src/features/transactions/useSuperfluidWriteContract.ts:219`: in the
`ClearMacroNotEligibleError` branch, call `setRelayPhase("fallback")` instead of
`setRelayPhase(undefined)` (keep the `console.warn`). The phase persists through the self-pay
`writeContract` that follows.

**c. Narrate it** — `src/features/transactionBoundary/TransactionDialog.tsx`:
- Loading branch (`:68–101`): for `relayPhase === "fallback"` keep the generic headline ("Waiting for
  transaction approval...") and add a caption under the spinner, e.g. *"Gasless relay unavailable —
  you'll pay network fees for this transaction."*
- **Guard the success caption (`:120`)**: it currently renders "Executed gaslessly via the Clear Macro
  relay." for *any* truthy `relayPhase`. With a `"fallback"` value present on a successful self-pay
  write, that would be wrong — tighten the condition to `relayPhase === "relaying"` so the gasless
  caption shows only for an actual relay.

## Timing & UX (for reviewer awareness — unchanged by this work)

The preflight runs **on click, inside the mutation** — it does NOT run reactively before the click.
On click: `write(...)` fires → dialog shows the "Waiting for transaction approval…" spinner
(`TransactionDialog.tsx:68`) → behind it the estimate runs → on a real revert the mutation rejects
*before* `writeContract`, so the wallet popup never appears and the spinner flips to the "Error"
dialog (`TransactionDialog.tsx:146`); on success the wallet popup shows the buffered gas. So a revert
surfaces after the click, in place of the wallet prompt — matching sdk-core's behavior.

Error surfacing path: `mutationFn` throws → `useMutation` sets `error` → `result.error =
toSerializedError(...)` (`message = shortMessage ?? message`) → `TransactionDialogErrorAlert` renders
it in a red MUI alert.

## Known follow-ups (do NOT do here)

- **`TransactionDialogErrorAlert` is partly ethers-era.** Its friendly branches match ethers-v5
  strings (`INSUFFICIENT_FUNDS`, `UNPREDICTABLE_GAS_LIMIT`) that viem no longer emits; viem reverts
  fall through to the generic `shortMessage` branch (readable, but the pretty mappings are mostly
  dead). This matters more now that reverts surface in-dialog on every write. Worth a separate
  viem-aware pass.
- **Upfront (pre-click) reactive simulation/estimation.** The on-click `write(builder)` API is the
  blocker; going upfront means computing the request reactively at hook level, feeding it to a
  reactive `useSimulateContract`/`useEstimateGas` (query-`enabled` + debounced), gating the button
  via the existing `TransactionButton` `disabled` prop, and reconciling with the on-click estimate as
  the final pre-broadcast authority (staleness). Pure-builder forms (transfer, wrap/unwrap,
  single-call create-flow) are easy pilots; builder-with-reads forms (flow scheduling, vesting
  batchCalls) need their reads lifted to reactive queries first. Incremental, separate story.

## Verification

- `pnpm typecheck` && `pnpm lint`.
- `grep -rn "simulate" src` shows no stray `simulate?`/`simulate: true` plumbing — only the Clear
  Macro `fallbackSimulationRequest` and the `simulateContract` import + `:188` cast in
  `useSuperfluidWriteContract.ts`.
- **Manual on Optimism Sepolia (`pnpm dev`), EOA wallet:**
  - Create/update/close a stream, wrap, unwrap, transfer, set token allowance, vesting create — each
    still prompts and succeeds. The wallet prompt's suggested gas limit should reflect estimate ×1.2
    (visible in MetaMask's "edit gas" view for wallets that honor a supplied limit).
  - **Native-asset wrap** (~all native balance): the estimate succeeds and the write prompts (fee
    fields omitted keep the pre-pay check at `balance ≥ value`).
  - **Forced contract revert on a form that previously didn't simulate** (e.g. create-flow on an
    already-open stream): the error now surfaces in the dialog before the wallet prompt.
  - **Infra-failure fallback:** temporarily force `isContractRevert` to return `false` (or use an RPC
    without `eth_estimateGas` state support) → the write still proceeds via wallet estimation, no
    dialog error.
  - **Gnosis Safe (smart wallet):** no estimate runs, no `gas` attached, behavior unchanged.
  - **Clear Macro relay (enabled, eligible action):** relay path unaffected, no local estimation.
  - **Clear Macro relay fallback** (enabled but ineligible — e.g. force `ClearMacroNotEligibleError`):
    the dialog shows the "Gasless relay unavailable — you'll pay network fees" caption, the wallet
    prompts for gas, and on success the "Executed gaslessly…" caption does NOT appear.
  - **Former `simulate: true` sites** (pool connect/disconnect, auto-wrap): unchanged after flag
    removal; force a revert (e.g. connect to a non-existent pool) → error still in the dialog.

## After implementation — documentation

Append a short retrospective to `docs/plans/write-path-migration-sfpro-viem.md` (the established
single-file-per-development doc) noting: the buffer was dropped in the migration and why (sdk-core's
one `estimateGas` did both buffer + revert check); the restored unified-estimate design and its
strict-vs-best-effort rule; the on-click timing; and the two follow-ups above.

## References

### Repo (this codebase)
- `src/features/transactions/useSuperfluidWriteContract.ts` — the shared write executor (the core
  change site). Note the `mutationFn` flow: builder → `getTransactionOverrides` → Clear Macro branch
  (returns on success) → simulate (to be replaced) → `writeContract` → `trackTransaction`.
- `src/hooks/useGetTransactionOverrides.tsx` — produces fee fields from the gas API and the
  `gas: 0n` smart-wallet sentinel (`isEOA === false`). `src/features/transactions/viemFeeOverrides.ts`
  — the `ViemFeeOverrides` type.
- `src/features/wallet/wagmiConfig.ts` (~line 271) — existing `getPublicClient` usage to mirror.
- `src/features/transactionBoundary/{TransactionBoundary,TransactionDialog,TransactionButton}.tsx`
  and `src/features/transactions/TransactionDialogErrorAlert.tsx` — the result→dialog→error rendering
  path (relevant to how a thrown estimate surfaces, and to the ethers-era-error follow-up).
  `TransactionDialog.tsx` (loading headline `:68–101`, success caption `:120`) also narrates the relay
  phases — the §3 `"fallback"` change lives here.
- `src/MutationResult.ts` — the `RelayPhase` union extended with `"fallback"` in §3.
- `src/features/clearMacro/executeClearMacro.ts` — the relay path; its `fallbackSimulationRequest` is
  the one legitimate remaining `simulate` reference after cleanup.
- `docs/plans/write-path-migration-sfpro-viem.md` — the migration plan/retrospective; lines 86,
  98-102, 230 flagged this gas work as unfinished. `docs/plans/clear-macro-relay-integration.md` —
  the relay integration (context for the relay skip-condition).
- Git: buffer/check dropped in the migration commit `d0a4d719`; `simulate: true` added there and in
  the auto-wrap alignment `3ced32fd`. `Operation.exec`'s old behavior is the parity reference.

### External — gas estimation & best practice
- viem `writeContract`: <https://viem.sh/docs/contract/writeContract>
- viem `estimateContractGas`: <https://viem.sh/docs/contract/estimateContractGas>
- viem `prepareTransactionRequest` (local-account gas fill): <https://viem.sh/docs/actions/wallet/prepareTransactionRequest>
- viem discussion — simulate does not return a gas limit; estimate separately: <https://github.com/wevm/viem/discussions/862>
- MetaMask #9967 — fees set but no gas limit + low balance → gas balloons to block limit: <https://github.com/MetaMask/metamask-extension/issues/9967>
- wagmi discussion — gas-limit multiplier on writes: <https://github.com/wevm/wagmi/discussions/2196>
- sdk-core `Operation.ts` (the `multiplyGasLimit(estimated, 1.2)` source, default `gasLimitMultiplier = 1.2`):
  <https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/sdk-core/src/Operation.ts>
- Superfluid Super Apps (why agreement gas is dynamic): <https://docs.superfluid.finance/superfluid/developers/super-apps>

### Tooling for the implementer
- **wagmi / viem APIs** — prefer the Context7 MCP (`resolve-library-id` → `query-docs`) over recall;
  covers `estimateContractGas` (incl. `prepare: false`), `getPublicClient`, the viem error classes
  (`BaseError.walk`, `ContractFunctionRevertedError`, `ExecutionRevertedError`), and `@wagmi/core`
  actions.
- **viem patterns** — the `viem-integration` skill. **Superfluid protocol / `@sfpro/sdk`** — the
  `superfluid` skill.
