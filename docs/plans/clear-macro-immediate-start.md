# Clear Macro: immediate-start ScheduleFlow (end-date-only streams relay in one action)

> Record of an implemented development (2026-07-08, branch `dashboard-clearmacro-v2`). Follows
> `clear-macro-relay-integration.md` and `clear-macro-relay-fee.md`.

## Why

A **new** stream with only an **end date** on the send-stream form builds the batch
`[grant(DELETE perm), createFlowSchedule(end-only), createFlow(immediate)]`. The relay only
engages for a submission that reduces to ONE signed macro action, so this case never showed the
relay chip — a real capability gap, not a UI bug: the macro's `ScheduleFlow` rejected
`startDate == 0` with a non-zero rate and never created the CFA flow itself.

## Contract change (`contracts/src/DashboardClearMacro.sol`)

`ScheduleFlow` gained a third mode, keyed entirely off the existing five params (no ABI or
EIP-712 typedef change):

| startDate | flowRate | endDate | meaning |
|---|---|---|---|
| >0 | >0 | 0 or >0 | scheduled start (+optional stop) — unchanged |
| 0 | 0 | >0 | stop-only on an existing flow — unchanged |
| 0 | **>0** | >0 | **immediate start**: batch = `[grant(missing DELETE bit)?, createFlowSchedule(end-only), cfa.createFlow(rate)]` |
| 0 | <0 | any | `InvalidFlowRate` (was: any non-zero rate with start 0) |

Load-bearing invariants:
- **The stored schedule row keeps `flowRate = 0`** in immediate-start mode
  (`p.startDate != 0 ? p.flowRate : int96(0)` at the `createFlowSchedule` call) — parity with the
  row the dashboard's direct batch stores for end-only schedules. Before this change that was only
  vacuously true because validation forced the rate to 0.
- `_missingSchedulerGrant`, `_scheduleTxCount`, `previewRelayFee` needed **no changes**: start==0
  already means DELETE-bit-only/no-allowance, and the fee was already 2× (setup + keeper stop —
  the immediate create rides inside the setup tx).
- If a flow already exists at execution, `cfa.createFlow` reverts and the whole action rolls back
  **deliberately** — the signed text promises to *start* a stream; silently updating an existing
  one would exceed that consent. The dashboard preflights `activeExistingFlow` seconds before
  signing, so the race window is tiny.
- Signed description (new branch in `_descriptionScheduleFlow`): `"Start a stream of
  0.10000 SYM/day to 0x… immediately, stopping at <end> (unix time), and authorize the Flow
  Scheduler" + schedule fee suffix`.

## Dashboard changes

- `src/features/send/useFlowSchedulingWrites.ts`: the schedule sub-op's macro action carries the
  rate when there is no active flow (`shouldScheduleStart || !activeExistingFlow`), and the old
  grant+schedule reduction became the exported pure helper `reduceToScheduleFlowAction`, covering
  `[schedule]`, `[grant, schedule]`, `[schedule, createFlow]`, `[grant, schedule, createFlow]`.
  The trailing createFlow folds in only with matching token/receiver/rate and `startDate === 0` —
  the false-positive audit (updateFlow batches, delete-schedule paths, userData batches) is in its
  doc comment.
- `src/features/send/stream/SendStream.tsx`: the `clearMacroActionKind` memo no longer bails on
  `!activeFlow && !startTimestamp`; also fixed a pre-existing inexactness (an active flow with an
  unchanged rate claimed `updateFlow` although the hook builds zero ops — masked by
  `hasAnythingChanged` disabling submit).
- `eslint.config.mjs`: `contracts/` added to the ignore list — the vendored submodule's own JS was
  failing `pnpm lint` with 25 unrelated errors whenever the submodule is checked out.

## Deployment (OP Sepolia, 2026-07-08)

**`0x0725db8cf32CDefa1e822CB336ca5caf4cbE69FD`**
(tx `0xe0b6104f1c775171fd7d6ceffa771b181abdb33e3e1a7952f7e979eaa9227d3b`), same constructor params
as its predecessor: fee token fUSDCx `0x131780640EDf9830099AAc2203229073d6D2FE69`, base fee 0.01,
fee receiver `0x7269B0c7C831598465a9EB17F6c5a03331353dAF`. Replaces
`0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65` in `networks.ts` (which replaced the feeless
`0xa7AA0ff5…`). Verified live: `baseFee()`/`feeToken()` reads and an on-chain
`describeScheduleFlow(start=0, rate>0)` returning the immediate-start text with exact fee
disclosure (0.02 new / 0.01 modify). ABI regen (`pnpm contracts:abi`) was a no-op, as expected —
only internals and description text changed.

## Verification status

- `pnpm contracts:test` 86/86 green — 5 new immediate-start tests (ops shape/grant diffing, keeper
  stop, full-control no-overflow, active-flow revert atomicity, existing-row 1× fee + preview) plus
  a new description test (a local added to `testEnglishDescriptionsForAllActions` is
  stack-too-deep, hence the separate function); `testScheduleFlowRevertsZeroOrNegativeRate`'s
  stop-only-with-rate expectation inverted by design (now negative-rate).
- `pnpm typecheck`, `pnpm lint` green.
- **End-to-end on OP Sepolia not yet exercised** — remaining: send-stream form with end date only →
  chip visible → one relayed tx → flow live immediately, row `{start:0, end, rate:0}`, DELETE-only
  grant, 2× fee; plus regression sweep (start+end, start-only, end-added-to-active-flow,
  rate-change-with-end hides chip).

## Retrospective

- The design-review pass caught the one real trap early: forwarding `p.flowRate` verbatim into
  `createFlowSchedule` would have stored a non-zero rate on end-only rows, diverging from the
  dashboard's own rows. When relaxing a validation, re-check every downstream use the old
  validation was vacuously protecting.
- Deploying via the in-session `!` runner fails at the keystore password prompt
  (`Device not configured`) — forge needs a real TTY; run broadcasts from a normal terminal and
  read the address back from `contracts/broadcast/.../run-latest.json`.
- `forge script` resolves the script path from CWD, not from `--root` — keep the `contracts/`
  prefix.
