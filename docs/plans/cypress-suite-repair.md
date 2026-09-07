# Cypress suite repair — 2026-08-05

Base: `origin/master` @ `26eb2e73`.

## Why

The Cypress suite had stopped being a signal. Two symptoms, investigated separately:

- **Hourly "Production Cypress tests"** — one job, `test-suite (AllNetworkTests)`, red on every
  scheduled run. **Last green: 2026-03-22** (~4.5 months). Predates the wagmi v3 migration (#871,
  2026-06-30) by three months, so unrelated to it.
- **PR checks** — ~25 of 41 jobs red. PR #884 was merged with 26 failures.

The structural finding behind both: **`ci.yml` reported `success` whenever its Cypress jobs were
`skipped`.** `deployment_status` fires for many states and both environments, and the test jobs are
`if:`-guarded, so a run that tested nothing was green. Across **198 retained runs (2025-06-30 →
2026-08-05) every `success` was a skipped-jobs run.** A workflow that is green when it runs nothing
will never tell you it has stopped working. That is why the rot went unnoticed for 13 months.

## What was wrong, and what this branch does

### 1. `ci.yml` reported green when nothing ran — FIXED
New `Test gate` job (`if: always()`), which switches explicitly on deployment state and environment:

| deployment_status | required |
|---|---|
| `success` + `Preview` | test_setup, ui-tests, rejected-tests, gnosis-safe-tests all `success` |
| `success` + `Production` | test_setup + ui-tests `success`; other two may `skip` |
| `success` + any other env | **fail** — an unrecognised env means an unknown set of jobs silently skipped |
| `error` / `failure` | **fail** — this SHA has no coverage and must not show a green gate |
| `pending` / `in_progress` / `queued` / `inactive` | pass quietly, but still fail if a job ran and failed |

`test_setup` gained the same `if:` guard as its dependants.

> **Operational prerequisite:** this only binds once **"Test gate" is added as a required status
> check** in branch protection. The three test jobs must NOT be required directly — they legitimately
> skip. Residual caveat, documented in the workflow: during the pending window, before the
> success-event run's gate check exists, branch protection can transiently show green.

### 2. `BasePage` silently discarded caller timeouts — FIXED
`hasText` and friends did `cy.get(sel, { timeout: 60000 }).filter(':visible').should(...)`. Cypress
applies a timeout to *that command only*; the chained `.filter()`/`.eq()`/`.first()` — and therefore
the `.should()` retry budget — fell back to `defaultCommandTimeout` (15s). Callers asking for 45s or
60s silently got 15s.

Not theoretical: the hourly wrap-page assertions pass `{ timeout: 60000 }` and CI reported
*"Timed out retrying after 15000ms"*. `doesNotExist` has no chained query, which is why its
`120000ms` was honoured — the discrepancy in the logs is what exposed it.

Added `BasePage.carryTimeout()` and propagated it through **every** link in each chain. This was
suite-wide: it plausibly accounts for a share of this suite's long-standing "flakiness".

### 3. Hourly balance assertions compared against a stale fixture — FIXED
`WrapPage` asserted rendered balances against hardcoded `nativeTokenBalances.json`. The
"staticBalanceAccount" `0x8ac9C6D444D12d20BC96786243Abaae8960D27e2` is no longer static — it has been
drained (polygon is now exactly `0`) and drifts with gas. The app was right; the test was stale.

Replaced with live `eth_getBalance` / `realtimeBalanceOfNow().availableBalance` reads
(`tests/cypress/support/helpers/liveBalances.ts`) compared with a derived tolerance. Fixture deleted.

The tolerance deliberately **caps the display-derived term against the chain value**
(`max(|chain| * 1e-4, min(halfUnitInLastPrintedPlace, |chain| * 7.5e-4))`). Without the cap it is
circular: a UI wrongly printing `0` prints zero decimals and thereby grants itself ±0.5, swallowing
the exact failure the check exists to catch. `MAX_RELATIVE` is bounded below by the app's own
worst-case rounding error from `getDecimalPlacesToRoundTo` (5.05e-4 at a band edge) and above by the
tightest regression that must fail (0.9989 rendered as "1" = 1.1e-3).

**Zero balances are fine, and funding is not required.** This scenario is a *smoke test* —
"Smoke testing RPC and Graph in Wrap page" — that switches network, renders the page, opens the
token selection and checks the token list populates. Asserting `Balance: 0` on an unfunded network
still proves the app fetched and rendered a balance instead of hanging or erroring. The balance is
the vehicle, not the goal.

That is also the original intent, not an accident: in the deleted fixture, avalanche, bsc and celo
were `0` from its first commit in **February 2023**, and base, scroll, degen and sepolia were `0`
from the day each was added. Only six networks were ever deliberately funded — avalanche-fuji,
gnosis, polygon, optimism, arbitrum-one, opsepolia — and that set was stable for three and a half
years.

So the run warns only when one of *those six* reads 0 (`NETWORKS_EXPECTED_TO_HOLD_A_BALANCE`), which
is real information: polygon has since drained to exactly 0. Topping it up restores non-zero
coverage; it is a nice-to-have, never a prerequisite for green.

### 4. Clear Macro relay fee gate — TESTS REALIGNED, wallet still unfunded
This is **only** stream *scheduling*: exactly three scenarios — "Creating a stream with just start
date", "…just end date", "…with start and end date" (`@platformNeeded @gaslessRelayEnabled`) — on
four networks (polygon, optimism, arbitrum-one, bsc). 12 tests.

They expected `'Transaction Rejected'` but the app correctly shows
`You need 0.3 USDCx to pay the fee, but you have 0 USDCx…` — the relay fee gate fires before any
signature, because test account `john` holds **0 USDCx**. The app is not broken.

Everything else in those jobs passes: creating, modifying and cancelling a plain stream, wrapping,
unwrapping, approvals and subscriptions all still reach the wallet and get rejected as designed.
Scheduling is the only path forced through the relay (`isSchedulerRelayForced`,
`SendStream.tsx:600`), which is why it is the only path that hits the gate.

> The two extra `rejected-tests (1, bsc)` failures — "Creating a new stream" / "Modifying a stream",
> failing on a disabled Send button — are **not** this. Neither touches the scheduler, so no relay
> term in `isSendDisabled` applies, and both PASS on polygon/optimism/arbitrum-one against the same
> unfunded wallet. bsc-specific; most likely `isFlowScheduleFetching`/`isActiveFlowFetching` never
> settling, i.e. the unexplained cluster below.

The assertion now accepts either an exact rejection or a *well-formed* fee gate (required fee > 0, a
genuine shortfall, consistent symbols), covering all message variants in `executeClearMacro.ts`
including the Permit2 wording and the `"the fee token"` fallback symbol.

> **KNOWN COVERAGE HOLE**, documented at the assertion: with the wallet at 0 USDCx the rejection
> branch is dead on relay networks, and the gate branch only checks *internal consistency* — a
> fee-balance read that reported every wallet as 0 would pass while blocking every user.
> **Operational action:** fund the `TX_ACCOUNT_*` wallets with a few USDCx on
> polygon/optimism/arbitrum-one/bsc, or set `NEXT_PUBLIC_DISABLE_CLEAR_MACRO=true` on Preview.

### 5. Accounting-export drift — FIXED
Export now emits 19 columns and upstream added Optimism stream periods; fiat values also shifted
~0.017% from a price re-index. Fixtures re-recorded from the live API (and the CSV regenerated by
replicating the app's column logic, validated byte-for-byte against the existing rows — not by
pasting CI output, which would bake in any real regression). Fiat columns compare within tolerance;
every non-fiat column, the header, row count and per-row column count stay exact, and each fiat field
must be *present and finite* so a dropped field fails rather than coercing to `0 == 0`.

Also fixed `addCustomFilter`: MUI X v9 hides `.MuiDataGrid-menuIcon` unless the header is `:hover`ed,
which Cypress cannot simulate; the old force-click-then-click-visible toggled the menu shut.

### 6. Telemetry for the unexplained cluster — ADDED (diagnostic, not a fix)
`tests/cypress/support/telemetry.js` records, per failed spec: console errors, uncaught exceptions,
and **requests that started and never settled** — the key signal. Uploaded as CI artifacts.

It patches `window.fetch` / `XMLHttpRequest` on `window:before:load` rather than using a catch-all
`cy.intercept`, deliberately: the suite has ~13 intercepts using `req.continue()` body rewriting, and
a catch-all route would join that handler chain and add proxy overhead across a 41-job matrix —
exactly the load profile under suspicion. Patching below the Cypress proxy leaves intercepts
untouched. URLs are redacted for credential-looking parameters before being written to artifacts.

### 7. Close-ended stream fixture — REPOINTED at a live stream

The stream behind *"Scheduled stream showing correct details"* ran to completion on 2026-07-22, so
*"The streamed amount is flowing"* could never pass again. Its sender `0x9Be85A79…` is **not one of
the six test accounts** and its key is in neither `cypress.env.json` nor CI — that stream was
hand-made from a personal wallet in July 2024 and was never reproducible by anyone else.

Replaced with a stream between accounts the suite controls:

| | |
|---|---|
| sender | `ongoingStreamAccount` `0xEb85888b…` (funded with 30 fTUSDx) |
| receiver | `bob` `0x9B6157d4…` |
| token / network | fTUSDx on OP Sepolia |
| flow rate | `380517503805` wei/s ≈ 1 fTUSDx/month |
| scheduled end | 2028-08-04, ~6 months before projected liquidation |
| tx | `0xa61b769f…fa11` |

`ongoingStreamAccount` was chosen over a transactional account on purpose: `john` and friends
create, modify and cancel streams throughout `rejected-tests`, so a permanent stream from one of
them could interfere. This account is only asserted on opsepolia for **fDAIx**, and Superfluid
balances and liquidation dates are per-token, so an fTUSDx stream does not touch it. Dashboard
navigation is by `data-cy={network}{token}`, not positional, so the extra token row is harmless.

**Buffer and total scheduled amount are no longer pinned.** They are derived — the protocol deposit,
and `flowRate * (endDate - startDate)` matching `totalToBeStreamedIfScheduled` in the stream details
page — so pinning them meant re-creating the stream required recomputing them by hand, which is
precisely why this scenario stayed red instead of being repaired. They now come from
`CFAv1Forwarder.getFlowInfo` and `FlowScheduler.getFlowSchedule`
(`tests/cypress/support/helpers/liveStreams.ts`), compared numerically with a tolerance capped
against the chain value.

The fixture now carries only the stream's identity, so the next person to re-create it updates four
fields and the assertions follow.

## Still unexplained — do not assume this branch fixes it

A cluster of ~12 jobs fails with pages that hang on loading skeletons forever
(`waitForSpookySkeletonsToDisapear`, 120s) and activity lists that never populate. **Cause unknown.**

Established: onset between **2026-07-29T11:09Z and 2026-08-04T13:18Z**, appearing simultaneously on
three unrelated branches with no intervening `master` commit — so it is not any one branch's code.
A full 41-job Preview run at the final MUI v9 tree (`9f92252d`, 07-29) had **zero** skeleton hits,
which rules out a deterministic MUI-v9 regression. #885 did not fix it (24 jobs / 45 hits after).

Open hypotheses, none confirmed: shared RPC/subgraph gateway degradation; Vercel Preview build drift;
Cypress intercept/harness failure; non-hermetic CI toolchain (`ci.yml` pins moving action tags,
`node 20.x`, bare `pnpm i` then `pnpm add --force`); harness-generated load (41 concurrent jobs
against one Preview deployment).

**Next step is the telemetry from item 6, not a patch.**

## Deliberately not fixed

- **`gnosis-safe-tests`** (6 failures, `iframe[title="Superfluid Dashboard"]` never found) — red in
  every run sampled back to 2026-06-24. Ruled out: manifest CORS, `X-Frame-Options`/CSP, Vercel
  deployment protection (disabled). Needs driving `app.safe.global` in a real browser. **No assertion
  was weakened to make it pass.**
- **Dashboard empty state** (`no-balance-wrap-button`) — the empty card now depends on 6 mainnet
  subgraph queries settling within 30s (the active-network list grew). All 6 respond fine on demand;
  may belong to the unexplained cluster. Not weakened.
- **IDA subscription assertions** — verified correct against live subgraph state; the failure was the
  15s timeout bug (item 2), not a wrong expectation.

## Verification performed

`tests/` typecheck ends at exactly the 2 pre-existing `@superfluid-finance/metadata` errors. Both
workflows parse. The gate's shell logic was extracted and executed across 17 state/environment
combinations; the tolerance formula was executed against live-measured chain values plus required
regressions; the fee-gate regex against 7 real message shapes and 4 near-misses.

**Cypress itself was not run** — it needs a live deployment and secrets. Every assertion change is
verified by typecheck plus standalone reproduction of the pure logic, not end-to-end.

## Review

Implemented by parallel agents, then reviewed adversarially and independently by a Fable subagent and
by Codex CLI (via Pal `clink`, `role=codereviewer`), both prompted to refute. They converged on the
same top defects, all fixed before this was opened:

1. The new balance helper **repeated the very timeout bug** item 2 exists to fix (`.filter()` without
   the timeout) — would have re-shipped the 15s flake in the motivating assertion.
2. The tolerance was **circular** (see item 3).
3. `.first()` re-dropped the carried timeout in `clickFirstVisible`, affecting ≥7 call sites.
4. The gate **failed open** on unrecognised environments and on terminal deployment failures.
5. `?? 0` let a missing fiat field pass as `0 == 0`.
6. The CSV path was still byte-exact while the JSON path had been loosened — the workstream summary
   claimed otherwise; the code disagreed and the code won.

An earlier diagnosis claim that this suite had MUI-v9 class-rename fallout was **wrong and
retracted**: the MUI class list in those logs is how Cypress prints the subject element, not a
selector. The only MUI-class selector in the suite is `GnosisSafe.ts:10`, still valid in v9.
