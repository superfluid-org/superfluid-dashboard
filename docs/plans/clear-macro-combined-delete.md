# Clear Macro: combined DeleteFlow (scheduled-stream cancels relay in one action)

> Record of a development (2026-07-09, branch `dashboard-clearmacro-v2`). Follows
> `clear-macro-immediate-start.md`; same shape of gap, mirrored on the delete side.

## Why

On the send-stream form, "Cancel Stream" on a stream **with a schedule** (any end date) never
relayed even with the relay toggle on. Two stacked causes:

1. The cancel builds the batch `[deleteFlow, deleteFlowSchedule]`
   (`useDeleteFlowWithScheduling`), and `subOperationsWriteFragment` drops `clearMacro` for any
   ≥2-op batch. Unlike the upsert hook, the delete hook attached no reduced macro action to the
   batch fragment.
2. There was nothing to reduce *to*: the macro's `DeleteFlow` only emitted `cfa.deleteFlow` — no
   single signable action covered "stop the stream and remove its schedule".

Since streams created through the immediate-start ScheduleFlow path always have a schedule row,
every relayed-in stream was un-relayable on the way out. A capability gap, not a UI bug — the
exact mirror of the immediate-start case.

Secondary gap: `clearMacroActionKind` never yielded `deleteFlow`, so a plain active stream with
no form edits hid the relay chip although the Cancel button was visible and its lone `deleteFlow`
was relayable (it only relayed if the global toggle had been flipped on some other page).

## Contract change (`contracts/src/DashboardClearMacro.sol`)

`DeleteFlow` semantics became: *stop the flow, and remove any flow schedule the **signer** has
for it*. No ABI or EIP-712 typedef change — `DeleteFlowParams {superToken, sender, receiver}`
already keys the schedule row.

- `_buildOperationsDeleteFlow` appends the `CALL_APP_ACTION`
  `flowScheduler.deleteFlowSchedule(superToken, receiver)` op **only when
  `account == p.sender && _scheduleExists(superToken, account, receiver)`**.

Load-bearing invariants:
- **The signer gate is a consent/correctness boundary, not an optimization.** CFA lets the flow's
  *receiver* (or an operator) delete a flow, and `FlowScheduler.deleteFlowSchedule` resolves the
  row's sender from the batch signer — an unconditional call from a receiver-side close would
  delete the wrong row `(token, receiver, receiver)`. With the gate, a receiver-signed DeleteFlow
  stops the flow and leaves the sender's schedule row untouched (the keeper's later stop attempt
  no-ops against a deleted flow).
- **The description is state-independent but role-qualified**: `"Delete flow of <SYM> from 0x<sender>
  to 0x<receiver> and, if you are the sender, cancel any matching schedule for it" + fee suffix`.
  The describe/struct-hash functions cannot see the signer, and the struct hash is recomputed at
  execute time — schedule-state-conditional wording would `InvalidSignature`-revert on a
  sign→execute race. "if you are the sender / any matching" keeps the text truthful for every
  signer and every row state. Proven by `testDeleteFlowExecutesAfterScheduleRemoved`.
- **Fee stays 1× base** — the schedule cleanup rides inside the same relayed tx and *removes*
  keeper reservations rather than creating them. `previewRelayFee`, `_scheduleTxCount`, and the
  fee suffix needed no changes; `previewRelayFee` stays flat even when a row exists
  (`testPreviewRelayFeeDeleteFlowWithScheduleStaysFlat`).
- `cfa.deleteFlow` still reverts when no flow exists, rolling the whole action back **including
  the schedule deletion** — deliberate: the signed text promises flow deletion; a schedule-only
  cancel has its own DeleteFlowSchedule action.

## Dashboard changes

- `src/features/send/useFlowSchedulingWrites.ts`: new exported pure helper
  `reduceToDeleteFlowAction` — collapses exactly `[deleteFlow, deleteFlowSchedule]` with matching
  `superToken`/`receiver` into the `deleteFlow` macro action (false-positive audit in its doc
  comment); `useDeleteFlowWithScheduling` now wires
  `writeFragment.clearMacro ?? reduceToDeleteFlowAction(subOperations)`, mirroring the upsert
  hook. A lone `deleteFlowSchedule` (scheduled-not-started cancel) still lifts through
  `writeFragment.clearMacro` exactly as before. Pending updates unchanged — the relay branch
  consumes the same `subTransactionTitles`.
- `src/features/send/stream/SendStream.tsx`: the `clearMacroActionKind` memo short-circuits to
  the **cancel** kind (`deleteFlow` with an active flow, else `deleteFlowSchedule`) whenever
  `isModifying && isSendDisabled` — while the primary button is disabled, Cancel is the only live
  action, so the chip both *appears* on a pristine existing stream (previously hidden) and shows
  the accurate 1× fee instead of a stale send-kind range. When the primary button is **enabled**
  but its batch is not relayable (e.g. rate change + schedule), the chip stays hidden — it must
  not advertise a relay next to a direct-executing primary button (design-review finding). A
  cancel clicked in that chip-hidden state still relays when the global toggle is on — the same
  silent-global-toggle behavior lone deletes always had; safe, as the relay branch requires
  `params.clearMacro` on the write.

## Residual coverage gaps (analyzed pre-deploy, consciously deferred)

Pre-deploy sweep (2026-07-09, cross-checked with a Codex review pass) of every batch shape the
send-stream hooks can build vs what the macro can express. Relayable: all lone ops, the
`[grant?, schedule, createFlow?]` family (ScheduleFlow incl. immediate-start), and
`[deleteFlow, deleteFlowSchedule]` (this development). Not relayable — no macro action exists,
the chip correctly hides (`clearMacroActionKind` → `undefined`), and the direct path works:

- **A. `[deleteFlowSchedule, updateFlow]`** — clear the schedule AND change the rate in one
  submit. Reachable, moderately plausible. Would need a new combined action ("Update the flow to
  X/day and cancel any matching schedule" — honest under clear-signing).
- **B. `[deleteFlowSchedule, createFlow]`** — scheduled-not-started stream edited to start now
  with no schedule. Reachable, low-moderate plausibility. Needs a new action;
  `ScheduleFlow(start=0, end=0, rate>0)` is deliberately `InvalidTimeWindow`.
- **C. `[grant?, schedule, updateFlow]`** — change rate AND schedule on an active stream. The
  most plausible residual gap. Must NOT be shoehorned into ScheduleFlow's immediate-start mode:
  its signed text says "Start a stream" and it deliberately reverts on an active flow; a later
  version would add an explicit combined action instead.
- **D. `[grant]` alone** — schedule unchanged, only the scheduler ACL missing. Not naturally
  reachable from the form (`hasAnythingChanged` ignores operator-grant state, so submit stays
  disabled); not worth contract surface.

Verdict: none of A–D justify delaying or extending this deploy; a later contract version can add
combined actions if usage shows demand.

**Dashboard-side bug found during the sweep (fix independently of any deploy):** the hook's
schedule-changed comparison (`useFlowSchedulingWrites.ts`, the `createFlowSchedule` push
condition) compares the form's absent dates (`null`) against `getFlowSchedule`'s absent dates
(`undefined` — `src/features/transactions/contractReads.ts` maps 0/expired to `undefined`) with
`!==`, which is always true. Consequence: a **rate-only edit on an end-dated stream** builds
`[schedule(no-op re-set), updateFlow]` instead of a lone `[updateFlow]` — a spurious
"Modify Schedule" sub-tx and extra gas on the direct path, and a lost relay (the lone updateFlow
would have relayed). Normalizing the null/undefined comparison shrinks gap C to genuinely-dual
edits.

## Deployment (OP Sepolia, 2026-07-09)

**`0xEeFC8492f24898289E65Ee06dE7B8A19F30832a5`**
(tx `0x9697d2fd1e13c08f5efe47b8564f2f8674bd94ff268948715f5529a0b2fd0357`, block 45874010): same
constructor config as its predecessor `0xa35C9faC…2e78` — fee token fUSDCx
`0x131780640EDf9830099AAc2203229073d6D2FE69`, base fee 0.01, fee receiver
`0x74cD5673dF7efC148067Ecab494A19a46b0a3167`. Wired into `networks.ts` and the lineage doc
comment in `src/features/clearMacro/dashboardClearMacro.ts`. Blockscout-verified
("Pass - Verified"). The dashboard changes were held until this instance was live: a combined
action relayed against the old contract would stop the flow but leave the schedule row behind.

Deploy/verify quirks learned:
- The keystore account flag is `--account hacked_dev` — the plain keystore filename, even though
  `cast wallet list` displays it as `0xhacked_dev`; passing the displayed name fails with
  "Keystore file does not exist".
- `forge script --root contracts --verify` from the repo root deploys fine but its verify phase
  resolves the compiler cache from the CWD (looked for `<repo>/cache/solidity-files-cache.json`)
  and dies with "cannot resolve file". Run the standalone command afterwards instead — it honors
  `--root`: `forge verify-contract <addr> src/DashboardClearMacro.sol:DashboardClearMacro --root
  contracts --chain 11155420 --verifier blockscout --verifier-url
  https://testnet-explorer.optimism.io/api --constructor-args $(cast abi-encode
  "constructor(address,address,address,uint256,address)" <host> <flowScheduler> <feeToken>
  <baseFee> <feeReceiver>) --watch` — with the NEW instance's args exactly (earlier instances
  used a different fee receiver; a stale copy-paste fails the bytecode-args match). Verification
  needs no key, so it can run from any shell.

ABI regen (`pnpm contracts:abi`) was a no-op, as expected — internals and description text only.

## Verification status

- `pnpm contracts:test` 92/92 green — 6 new tests: `testDeleteFlowRemovesScheduleRow` (row zeroed,
  1× fee), `testDeleteFlowByReceiverKeepsSendersSchedule` (signer gate),
  `testDeleteFlowRevertsWhenNoFlowEvenWithSchedule` (atomicity),
  `testDeleteFlowExecutesAfterScheduleRemoved` (state-independent hash),
  `testDeleteFlowDescriptionExact`, `testPreviewRelayFeeDeleteFlowWithScheduleStaysFlat`; plus a
  fee assertion added to `testDeleteFlow` (no-row delete stays 1×) and the new description clause
  asserted in `testEnglishDescriptionsForAllActions`.
- `pnpm typecheck`, `pnpm lint` green.
- **End-to-end on OP Sepolia pending the redeploy** — sweep: (a) active stream with end date,
  toggle on → one signature, one relayed tx, flow stopped AND row gone, 0.01 fUSDCx fee, both
  optimistic updates; (b) active stream, no schedule, pristine form → chip now visible, lone
  cancel relays; (c) scheduled-not-started stream → still relays as lone DeleteFlowSchedule;
  (d) active stream + schedule + rate edit → chip hidden; (e) toggle off → direct batch;
  (f) table-row cancel stays non-relay.
- **Known-blocker caveat**: the combined action (agreement call + app action + fee transfer) may
  exceed the relay provider's hard 200k gas cap (`clear-macro-immediate-start.md` §Known
  blocker). If sweep (a) dies OutOfGas at the relayer, replay the calldata locally to prove
  not-our-bug (procedure in that doc); lone deletes stay light thanks to the conditional op
  emission.

## Retrospective

- The design-review pass (Codex via PAL) caught the one real UX trap before implementation: a
  single form-level chip driven by a "send OR cancel" kind would have advertised relay while an
  *enabled* Modify button executed direct. The fix — cancel kind only while the primary button is
  disabled — came out of that review; when one affordance covers two buttons, key it off which
  button is actually actionable.
- The immediate-start doc's invariants transferred almost verbatim (state-conditional *ops*,
  state-independent *description*, deliberate whole-action revert). Mirrored developments are
  cheap when the first one records its load-bearing decisions.
