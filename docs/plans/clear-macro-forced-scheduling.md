# Clear Macro: forced relay for scheduling, allowlist retired on macro networks

> Record of a development (2026-07-10, branch `dashboard-clearmacro-v2`). Follows
> `clear-macro-combined-delete.md`. Plan brainstormed with and reviewed by Codex (PAL clink)
> pre-implementation; its findings are folded in and marked below.

## Why

The send-stream form gated scheduling behind the platform allowlist — but only *visually*
(`useWhitelist` → blur overlay + dimmed fields; submission was never blocked). On networks with a
Dashboard Clear Macro deployment the economics changed: the macro's relay fee pays for the
scheduling service, so the allowlist is redundant there. This development makes scheduler-touching
submissions **pay via the relay** instead of asking for allowlist membership:

- Eligible signers (confirmed EOA, connected, not impersonating) see no allowlist overlay on
  macro networks and their scheduler-touching submits are **forced through the relay** — the
  chip stays a toggle, but the primary button is disabled until it's on ("keep toggle, gate
  submit").
- Everyone else (smart wallets, view mode) and every non-macro network keeps the previous
  behavior: allowlist overlay + direct writes.
- Forcing is scoped to FlowScheduler-touching submits (set/modify/clear a start/end date).
  CFA-only writes — plain create/update/delete, rate-only edits — are never forced.
- **Cancel is deliberately ungated**: stopping an outflow is a safety action; the schedule-row
  cleanup on cancel is incidental, and the table-row cancels are direct anyway. The whole gate is
  client-side product steering, not a security boundary (FlowScheduler is permissionless).

Decision input worth keeping: `ClearMacroForwarderV1.sol` verifies via
`SignatureChecker.isValidSignatureNow` — **ERC-1271 contract signatures work at the contract
level**. The dashboard's EOA-only gate is a UX choice (multisig signing doesn't fit the
synchronous sign-and-POST flow), so relaxing it later needs no contract change.

## Prerequisite bug fix (GLOBAL, all FlowScheduler networks)

`useFlowSchedulingWrites.ts` compared the form's absent dates (`null`) against
`getFlowSchedule`'s absent dates (`undefined`) with `!==` — always true — so a **rate-only edit
on an end-dated stream** built `[schedule(no-op re-set), updateFlow]` instead of a lone
`[updateFlow]` (flagged in `clear-macro-combined-delete.md` §Dashboard-side bug). Now normalized
through the exported `normalizeScheduleTimestamp` (absent → the contract's `0` sentinel), shared
with the form's mirror so the two can't drift. This became load-bearing: without it the gating
would misclassify rate-only edits as scheduler-touching. It intentionally changes direct batches
on non-macro networks too (drops the spurious "Modify Schedule" sub-tx) — a strict improvement.

## Dashboard changes

- `src/features/clearMacro/useClearMacroEligibility.ts`: `isAccountEligible` — the
  actionKind-independent half of `isEligible` — exposed for gates that exist before an action
  kind does.
- `src/features/send/stream/SendStream.tsx`:
  - The `clearMacroActionKind` memo split into `primaryClearMacroActionKind` (the primary
    batch's macro action, `undefined` = not macro-expressible) and the chip kind. The chip's
    cancel fallback now keys on the **base** disabled (form validity/change/fetching), not the
    final disabled — when the button is disabled *only because the relay toggle is off*, the chip
    must advertise the primary action the user needs to turn on, not the cancel (Codex finding).
  - `touchesScheduler` — form-level mirror of the hook's (normalized) schedule push conditions.
  - Gating: `isSendDisabled = base || pending-classification || (forced && (!relayEnabled ||
    !macro-expressible))`. The pending term holds scheduler submits while a same-signer wallet is
    still classifying (`isEOA === null`) so an actual EOA can't race a direct scheduler write
    through the unclassified window (Codex finding). A caption ("Checking your wallet type before
    scheduling…") explains that state — normally a moment, but a stalled classification RPC must
    not leave the button disabled with no visible reason, and the chip is hidden then too (Codex
    post-implementation finding).
  - Macro-inexpressible combinations (residual gaps A/B/C of `clear-macro-combined-delete.md`)
    block submit with a **generic** info alert ("schedule change + another stream change — two
    steps"); generic because gap B (scheduled-not-started → start now) is not a rate change
    (Codex finding).
  - Allowlist bypass: `isAccountEligible ||` an optimistic same-signer-only window during
    classification (view mode never skips the overlay, even transiently — Codex finding). The
    bypass also skips the allowlist API query. Visual only; submit gating stays strict.
- `src/features/clearMacro/ClearMacroRelayOption.tsx`: optional `relayRequired` prop — a warning
  caption when the toggle is off ("Required for scheduled streams on {network} — turn on to
  continue"). Passed only when the chip represents the primary action (`!isSendDisabledBase`
  guard), never its cancel fallback.

## Fail-closed relay requirement (the enforcement chain)

The requirement travels as **caller intent**, not hook-derived state — hook-derived alone could
leak: stale form vs fresh preflight reads can build a scheduler-touching batch with no macro
action, leaving any derived flag unset and the write going direct (Codex finding).

1. SendStream passes `requireClearMacroRelay: isSchedulerRelayForced` to the upsert hook.
2. `useUpsertFlowWithScheduling` tracks `hasSchedulerSubOperations` while building; if required
   ∧ scheduler ops ∧ no macro action → throws a user-facing "form may be out of date" error
   before returning write params. Otherwise forwards `clearMacroRequired` (only when scheduler
   ops exist — CFA-only batches stay unforced). The delete hook never sets it (Cancel ungated).
3. `useSuperfluidWriteContract`: with `clearMacroRequired`, a pre-signature
   `ClearMacroNotEligibleError` is rethrown wrapped ("The gasless transaction service is
   unavailable right now — please try again later.", original as `cause` — the dialog renders
   messages verbatim, so raw digest/capabilities text must not surface). If the relay gate can't
   engage at all (toggle raced off, wallet reclassified), a belt-and-suspenders `else if` throws
   instead of self-paying.
4. `executeClearMacro` takes `relayRequired` and drops "turn the relay option off" from the
   fee-shortfall remedies (an unavailable remedy under forcing — Codex finding); top-up /
   switch-payment-mode / Permit2-approve remedies stay.

Policy decided with the user: relay downtime on a forced write **surfaces an error** (no silent
self-pay fallback) — the fee is the product; the rare outage does not justify a fee bypass.
Non-forced writes keep the silent fallback exactly as before.

## Verification status

- `pnpm typecheck`, `pnpm lint` green.
- **End-to-end OP Sepolia sweep pending** (eligible EOA): (a) no-date stream, toggle off →
  direct; (b) dated stream, toggle off → disabled + "required" caption; toggle on → relays as
  scheduleFlow (incl. end-date-only); (c) rate-only edit on end-dated stream → NOT gated, single
  Update Stream sub-tx (bug-fix proof), relays lone updateFlow when toggled; (d) rate + date in
  one submit → disabled + combined-edit alert, two steps work; (e) gap B (scheduled-not-started →
  start now) → same alert; (f) clear-schedule-only → gated, relays deleteFlowSchedule; (g) cancel:
  toggle off → direct, on → combined delete; (h) block the relay capabilities endpoint → forced
  submit shows wrapped "service unavailable", Cancel still direct; (i) fee shortfall on forced
  write → copy has no "turn relay off"; (j) fresh connect (isEOA pending) → scheduler submit
  briefly disabled, non-scheduler unaffected; (k) view mode + Safe → overlay/gating exactly as
  before. Mainnet-shape check: temporarily set `dashboardClearMacro` on a mainnet def in dev —
  overlay suppressed for eligible EOA only. Cypress: send-page specs on opsepolia (the allowlist
  assertions in `SendPage.ts:616-622` are view-mode based and should still pass).
- Note for the sweep: OP Sepolia is a testnet, so the overlay never showed there anyway
  (`useWhitelist` short-circuits testnets) — the observable changes there are the gating, chip
  caption, alert, and outage behavior; the overlay change only manifests on a future mainnet
  macro network.

## Retrospective

- The pre-implementation Codex review earned its cost: five of its findings (caller-intent flag,
  pending-classification race, same-signer overlay optimism, chip-vs-cancel `relayRequired`,
  forced-mode fee copy) were real holes in the first plan draft, all cheap to fix at plan time.
- The "display mirror vs runtime truth" pattern (chip memo mirroring hook logic) survives another
  development, but only because the fail-closed guard now backstops drift at the write layer —
  a mirror that gates money paths needs a runtime enforcement twin, not just a comment promising
  alignment.
- The one-line null/undefined normalization shows how a cosmetic bug becomes load-bearing the
  moment new logic keys on the same comparison; the shared helper (one source for both sides) is
  what actually prevents recurrence, not the fix itself.
