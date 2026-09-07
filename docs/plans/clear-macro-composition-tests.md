# Clear Macro: composition-level test suite (operation arrays, no execution)

> Record of an implemented development (2026-07-13, branch `dashboard-clearmacro-v2`). Follows the
> `clear-macro-*.md` series; complements the integration suites, changes no product code.

## Why

`contracts/test/DashboardClearMacro.t.sol` is end-to-end: every action runs through
`ClearMacroForwarderV1.runMacro` against a full local framework, with assertions on resulting
chain state — including keeper execution via `vm.warp` + `executeCreateFlow`/`executeDeleteFlow`.
(`DashboardClearMacroEip712.t.sol` is a different layer again: it independently pins the
published EIP-712 signing surface, with one execution cross-check.) The integration layer proves
the actions *work*, but the thing `DashboardClearMacro` itself owns — the
`ISuperfluid.Operation[]` each action composes — was never asserted directly; CFA/FlowScheduler
execution is framework behavior outside this contract's scope. A composition regression (wrong
operation type, target, calldata, or array shape) would only surface indirectly, through whichever
downstream effect happened to be asserted.

## What was added

`contracts/test/DashboardClearMacroComposition.t.sol` (23 tests) — pins the exact operation arrays
via the `external view` entry point `ClearMacroBase.buildBatchOperations(host, params, msgSender)`,
which takes precisely the wire format the `encode*` helpers produce. Each test builds the array and
asserts length, `operationType` (`BatchOperation` constants), `target`, and byte-exact `data`;
nothing is signed or executed.

Coverage:
- All seven single-op actions: `[coreOp, feeOp]`, with the fee op pinned as a self-spend
  `transferFrom(signer → feeReceiver, 1x)`.
- `DeleteFlow` branches: no row (2 ops), signer-is-sender with row (3 ops, cancel appended,
  still 1x fee), signer-is-receiver with the sender's row (2 ops — the `account == p.sender` gate).
- `ScheduleFlow` branches: start+end / start-only / end-only / immediate-start shapes (grant bits,
  `startMaxDelay`, stored rate 0 for end-only rows, trailing `createFlow` for immediate start, and
  the 3x/2x fee reservation); grant omitted entirely under a pre-existing full-control grant
  (both scheduled and immediate-start shapes); grant carrying only missing permission bits +
  allowance shortfall under a partial grant, including the allowance-only delta (zero permission
  bits); fee dropping to 1x when the schedule row already exists;
  `InvalidTimeWindow`/`InvalidFlowRate` reverts at the builder.
- Feeless instance appends no fee op; `UnknownActionId` reverts from `buildBatchOperations`.

## Design decisions

- **Reuses `DashboardClearMacroTestBase`** (full framework deploy) rather than mocks:
  `buildBatchOperations` is a view, so the framework only supplies real addresses and the two
  state reads the builders make (`_scheduleExists`, `getFlowOperatorData`). Branch state is set up
  with the same direct `flowScheduler.createFlowSchedule`/`callAgreement` calls the integration
  tests already use. No mock surface to maintain or drift.
- **Expected calldata is reconstructed literally in each test** (explicit `startMaxDelay`, stored
  rate, permission bits as values, not re-derived via the contract's own conditionals), so the
  suite fails on any change to what an action composes — deliberate or not.
- The integration suites stay unchanged; the two layers are complementary (composition = the
  contract's own output; integration = end-to-end confidence including keeper runs).

## Verification

`cd contracts && forge test` — 115 tests green (92 pre-existing + 23 new) as of this change.

## Retrospective

`buildBatchOperations` decoding via `_decodeActionParams` (raw action wire format, not the full
forwarder payload — unlike `getPrimaryTypeName`/`getActionTypeDefinition`) is what makes this
suite cheap: `encode*` output feeds it directly, no forwarder involvement. Worth remembering for
future ClearMacro implementations — the composition layer is testable for free.
