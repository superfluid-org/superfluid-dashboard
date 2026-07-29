# MUI migration — final steps: X v8 → v9, then core v7 → v9

## Overview

Completes the staged MUI v6 → v9 migration described in `docs/plans/mui-v6-to-v9-upgrade.md`.
That document is the **authority on scope and risk**; this one is the executable task list. Read it
before starting and keep it updated as you go — it is what carries this project across agents.

| step | what | state |
|---|---|---|
| 1 | MUI X v7 → v8 | merged, PR #878 → `8d1d7e43` |
| 2 | core v6 → v7 (landed 7.3.11) | merged, PR #880 → `91b99ec5` |
| 3 | MUI X v8 → v9 (landed 9.10.1) | **merged**, PR #881 → `f46d58d4` — this plan, Part A, done |
| **4** | **core v7 → v9** | **this plan, Part B — the remaining work** |

**Problem it solves.** The repo ships **two full copies of Material UI** — ours plus
`@mui/material@9.2.0` pulled in by `@lifi/wallet-management`. Deduplicating one out of the bundle is
the strongest repo-specific win and it **only lands at step 4**; steps 1–3 buy the dependency chain
and nothing else. Secondary: ~30% faster `sx` (≈670 usages here), real tree-shaking via the v7 ESM
`exports` layout, and an accessibility pass.

**Not a motivation:** React 19 support. Core has declared `react: ^17 || ^18 || ^19` since 6.0. Do
not cite it.

Based on `origin/master` at `91b99ec5`. **PRs merge to `master`, not `main`.**

### How this plan is executed

Run with `ralphex --worktree`, which requires the repo to be **on the default branch and clean** —
the plan file itself may be uncommitted, since ralphex stages it, copies it into the worktree and
commits it there. Ralphex creates `.ralphex/worktrees/<plan-name>` and derives the branch name from
this file unless `--branch` overrides it.

**Part A and Part B are two separate ralphex runs producing two PRs**, matching #878 / #880.
Ralphex runs one plan on one branch, so do not try to carry both parts through a single run:

1. **Run 1 — Part A (Tasks 1–8).** Ends at a PR for step 3. Stop there.
2. Merge that PR; answer the browser-support gate (Task 9).
3. **Run 2 — Part B (Tasks 9–18).** Start again from a clean, freshly-pulled `master` so the new
   worktree contains merged step 3. Tasks 1–8 are already `[x]` and get skipped.

Not bureaucracy: step 4 is only worth starting once step 3 is **merged and green in CI**, because
step 3 rewrites the picker DOM that step 4's selector sweep then builds on.

## Context (from discovery)

**Current versions on `master` at `f46d58d4`** (i.e. what Part B starts from): `@mui/material` /
`icons-material` / `system` / `utils` at `7.3.11` (pinned exact), `@mui/lab` at `7.0.1-beta.25`,
`@mui/x-data-grid` and `@mui/x-date-pickers` at **`9.10.1`** (pinned exact, landed by step 3),
`date-fns` v2.30.0, React 19, Next 16 (Pages Router). App version `65.0.0`.

*(The `^8.29.x` X versions named elsewhere in this file describe the pre-step-3 state and are
history, not the current tree. Verify against `package.json`, not against this prose.)*

**Published targets (verified 2026-07-28):** `@mui/x-data-grid` and `@mui/x-date-pickers` are both
at **9.10.1** `latest`, peering on `@mui/material ^7.3.0 || ^9.0.0` — satisfied by 7.3.11, which is
exactly what step 2 existed to deliver. Core `latest` is 9.2.0.

**Files at the centre of step 3:**
- Pickers (5 instances): `src/features/accounting/AccountingExportForm.tsx` ×2,
  `src/features/send/stream/SendStream.tsx` ×2, `src/features/vesting/CreateVestingForm.tsx` ×1
- `src/components/PickerField/mobileTapPicker.tsx` — the shared mobile tap-to-open component
- `tests/cypress/pageObjects/pages/{ExportPage,SendPage,VestingPage}.ts` and the shared
  `Common.inputDateIntoField` helper
- `src/features/accounting/AccountingExportPreview.tsx` — one of only 2 DataGrid files

**Repo-specific luck that keeps step 4 from being brutal** (from the master plan): zero
`makeStyles` / `withStyles` / `Hidden` / deep imports; only **2 DataGrid files** and no Pro/Premium,
so the at-scale DataGrid pain in mui-x#20711 does not apply; `@mui/lab` in exactly one file
(`src/pages/token/[_network]/[_token].tsx`).

## Development Approach

> **⚠️ READ THIS BEFORE TASK 1 — this repo does not have unit tests, and you must not create them.**
>
> There is **no jest and no vitest** — no config, no script, no runner. `tests/` is **Cypress-only**
> (with its own `package.json` and `pnpm-lock.yaml`), `contracts/` is forge. Cypress **is** the
> functional gate. Do not scaffold a unit-test framework; adding one is a separate architectural
> decision and is explicitly out of scope for this plan.
>
> Wherever the normal workflow says *"write tests"*, the equivalent obligation here is
> **the verification gate below**, and it is not optional.

### The verification gate

Every task that changes code ends with, in order:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm build` — **not optional.** Step 1's adapter bug passed `tsc` cleanly and only
   `next build --webpack` caught it.
4. The **Cypress A/B** for the specs that task touches (see below).

### A/B, against a production build

**CI runs Cypress against a deployed production build, and `pnpm dev` cannot observe a whole class
of failure.** Step 2's entire risk — v7 gating the icon `data-testid` behind
`NODE_ENV !== 'production'` — was invisible against the dev server and would have broken 45
selectors in CI. So: `pnpm build && pnpm start`, both sides, same machine.

**"Green" is not the bar.** Several specs fail on `master` for unrelated reasons. The bar is
**"the failure set is identical by name, or strictly smaller"**. Step 2's evidence was 214 tests /
21 failing / identical failure names on both sides. Match that rigour.

Local e2e needs `tests/cypress.env.json` — **gitignored, not in this worktree, and never to be
committed**. Copy it from the main checkout:

```
~/Library/Mobile Documents/com~apple~CloudDocs/WORKSPACE/superfluid/repos.tmp/superfluid-dashboard/tests/cypress.env.json
```

Verify with `git check-ignore` after copying. Without it every wallet-connected scenario dies at the
connect step. Runs take 5–20 min; tag-filter to cut that down, e.g.
`--env network=polygon,TAGS="@rejected and @gaslessRelayEnabled"`.

### Standing rules

- **Pin exact MUI versions, never `^`.** `@mui/material@9.1.0` shipped genuinely broken (ESM
  directory-import failure, mui/material-ui#48636, fixed only in 9.1.2); a caret range would have
  pulled it in. Step 2 pinned exact. Do the same.
- **Codemods need hand-review — including the X ones.** `@mui/x-codemod v8.0.0/preset-safe` touched
  9 files and only **4 changes were real**: it reformatted a 620-line file to no effect and
  relocated two trailing comments onto the wrong clauses in a file with *no MUI content*. Always
  `git diff -w --ignore-blank-lines` to find the real changes, and revert the rest.
- **Test-harness breakage is the dominant failure mode and it is silent.** It has now bitten twice —
  step 1 (`{selectall}{del}`, nine CI jobs) and step 2 (icon `data-testid` in production builds).
  Assume there is a third variant and go looking for it *before* you are surprised by CI.
- Complete each task fully before the next. Small, focused commits.
- **Update this plan file when scope changes.** Mark `[x]` immediately, `➕` for newly discovered
  tasks, `⚠️` for blockers.
- Do **not** bump `date-fns` (stays v2 — no step has a date-fns peer gate). Do **not** bundle the
  CSS-variables theme migration: `cssVariables` defaults to false in core v9 and is **not** forced;
  the master plan's §Top risk retraction is correct, do not re-add it.

## Testing Strategy

- **Unit tests:** none exist and none are to be added — see the callout above.
- **E2E (Cypress):** the real gate. Any change to picker DOM, keyboard interaction, class tokens or
  icon rendering must be A/B'd against a **production** build. Selector changes go in the *same
  task* as the code change that necessitates them.
- **Build as a test:** `pnpm build` is a functional check here, not a packaging step.

## Progress Tracking

- Mark completed items `[x]` immediately when done
- `➕` prefix for newly discovered tasks
- `⚠️` prefix for issues/blockers
- Keep this plan in sync with the work actually done, and mirror durable findings into
  `docs/plans/mui-v6-to-v9-upgrade.md`

---

# Part A — Step 3: MUI X v8 → v9

### Task 1: Capture the pre-change Cypress baseline
- [x] copy `tests/cypress.env.json` from the main checkout (path above); confirm `git check-ignore` reports it ignored
- [x] `pnpm install`, then `pnpm build && pnpm start`
- [x] run `ExportPage`, `SendPage` and `VestingPage` specs against the production build
- [x] record total / failing counts **and every failing scenario name** into this file under Task 1
- [x] confirm the recorded failures match the known-unrelated set (see "Do not chase" below); flag with ⚠️ if they do not

**Task 1 baseline (2026-07-28, production build `pnpm build && pnpm start`, unchanged code at `d1f757bc`):**

| spec | tests | passing | failing |
|---|---|---|---|
| ExportPage | 12 | 4 | **8** |
| SendPage | 21 | 15 | **6** |
| VestingPageOne | 16 | 15 | **1** |
| VestingPageTwo | 19 | 19 | 0 |
| VestingPageThree | 13 | 13 | 0 |
| VestingPageV2 | 1 | 1 | 0 |
| **total** | **82** | **67** | **15** |

Failing scenario names — all match the known-unrelated set (ExportPage 8, SendPage 6, VestingPageOne 1):
- ExportPage: Changing price granularity and accounting periods (examples #1–#4); Selecting multiple
  addresses and exporting the data; Selecting a counterparty and exporting the data; Date range of
  the reports; Exporting and validating CSV
- SendPage: Stream tables - stream with just start date; Stream tables - stream with start and end
  date; Stream tables - stream with end date; Modifying a streams start date; Modifying a stream
  with just end date; Modifying a stream with start and end date ( not started yet )
- VestingPageOne: Change network button showing up if user is not on opsepolia

Operational note: a first run produced 10/12 ExportPage and 21/21 SendPage failures (all with a
Next.js "attempted to hard navigate to the same URL" invariant). Cause: an orphaned `next start`
from an earlier session held port 3000 and served a stale build over the freshly rebuilt `.next`
chunks — `pnpm start` had died on EADDRINUSE. Check `lsof -iTCP:3000 -sTCP:LISTEN` before every
A/B run; that invariant error is the signature of a stale-server mismatch, not an app bug.

### Task 2: Verify the step-3 premise before changing anything
- [x] confirm `enableAccessibleFieldDOMStructure` is actually **removed** in X v9 — check the installed v9 package source and the official v8→v9 migration guide, not the plan's prose (the master plan flags this as *unverified*)
- [x] confirm `@mui/x-data-grid@9` and `@mui/x-date-pickers@9` peer ranges against the installed core 7.3.11
- [x] re-inventory the picker-driven Cypress selectors against the current tree: `ExportPage.ts` `DATE_RANGES`, `VestingPage.ts` `DATE_INPUT`, `SendPage.ts` `END_DATE` + ``hasValue(`${END_DATE} input`)``, and `Common.inputDateIntoField` — counts were measured 2026-07-27 and may have drifted
- [x] check whether v9 changes the `{selectall}{del}` field-clearing behaviour that broke step 1
- [x] record findings in this file; if the premise is wrong, mark ⚠️ and **stop for a human** rather than working around it

**Task 2 findings (2026-07-28, verified against the published `@mui/x-date-pickers@9.10.1` tarball, not prose):**

- **Premise CONFIRMED — proceed.** `enableAccessibleFieldDOMStructure` is removed in v9. The
  v9.10.1 source (`internals/hooks/useField/useField.mjs`) warns at runtime if the prop is passed:
  *"The `enableAccessibleFieldDOMStructure` prop has been removed. The accessible DOM structure is
  now the default and only option."*, pointing at
  https://mui.com/x/migration/migration-pickers-v8/ . So Task 4's pin removal is mandatory, not
  optional — the prop is a no-op plus a console warning in v9.
- **Peer ranges OK.** Both `@mui/x-data-grid@9.10.1` and `@mui/x-date-pickers@9.10.1` peer on
  `@mui/material ^7.3.0 || ^9.0.0` and `@mui/system ^7.3.0 || ^9.0.0` — satisfied by the installed
  7.3.11. `date-fns ^2.25.0 || ^3.2.0 || ^4.0.0` still admits our 2.30.0. React `^17 || ^18 || ^19`
  fine. **9.10.1 is still `latest`** — Task 3 pins exactly that.
- **Selector inventory (re-measured, no drift in kind, exact sites):**
  - `ExportPage.ts:12` `DATE_RANGES = '[data-cy=date-ranges] input'` — used at :242 `clear()`,
    :243 `type()`, :248 `click()`. Targets a real editable `<input>` today (the ×2 pinned legacy
    fields in `AccountingExportForm.tsx`); under the v9 accessible DOM the only `<input>` is the
    **hidden mirror input** (no visibility, value-string only, `useFieldHiddenInputProps`), so
    `clear`/`type` against it will fail the actionability check. `[data-cy=date-ranges]` is a
    `Stack` wrapping both range fields (`AccountingExportForm.tsx:184`), indexed 0 / -1.
  - `VestingPage.ts:21` `DATE_INPUT = '[data-cy=date-input] input'` — used at :277 via
    `Common.inputDateIntoField`. `data-cy` lives on the picker's textField slot
    (`CreateVestingForm.tsx:394`).
  - `SendPage.ts:71` `END_DATE = '[data-cy=end-date]'` (+ `END_DATE_BORDER` `fieldset` at :72,
    `isVisible` :652, ``hasValue(`${END_DATE} input`)`` :688) and `START_DATE = '[data-cy=start-date]'`
    at :69 (+ `fieldset` border at :70) — both fed through `Common.inputDateIntoField` (:611, :615).
    The :688 value assertion reads the **hidden input's** value string in the accessible DOM — the
    hidden input's `value` is the formatted value string, so the assertion may keep working, but the
    format is `getHiddenInputValueFromSections`, which must be checked against the typed format.
  - `Common.ts:775` `inputDateIntoField` — `.should('be.visible')` at :802 then `this.type()` at
    :803. Both break against a hidden mirror input; needs the Task 5 rewrite (likely: type into the
    section spans, or set the hidden input via `.invoke('val')` + input event, or drive sections by
    keyboard).
  - **No `.Mui*` picker class tokens anywhere in `tests/`** (grep for `MuiPickers|MuiDateCalendar|
    MuiClock|MuiMultiSection|PickersDay|MuiCalendar` is empty) — the picker selector surface is
    exactly the `data-cy` hooks plus `input` descendants above. Nothing else to sweep in Task 5.
- **`{selectall}{del}` in v9:** unchanged risk profile; do **not** reintroduce the prefix. v9's
  accessible field handles a *real* Ctrl/Cmd+A keydown (`useFieldRootProps.mjs`: `setSelectedSections('all')`)
  and `Delete` with all-selected calls `clearValue()` — but Cypress `{selectall}` is not a Ctrl+A
  keydown (it's a selection command), so it still selects nothing meaningful in the section DOM, and
  `{del}` then clears at most the active section, exactly the step-1 failure mode. The current
  prefix-free `inputDateIntoField` approach (type the full formatted value) remains correct in
  spirit; only its target element must change (Task 5).
- **Task 4 premise also re-confirmed in v9 source:** `useFieldSectionContentProps.mjs:157` sets
  `contentEditable: !isContainerEditable && !disabled && !readOnly` — `readOnly` still suppresses
  section editing under the accessible DOM, so the mobile tap-to-open mechanism survives with only
  the base-component swap.

### Task 3: Bump MUI X to v9
- [x] set `@mui/x-data-grid` and `@mui/x-date-pickers` to the **exact** v9 version (9.10.1 unless Task 2 found newer), no caret
- [x] `pnpm install`; confirm the app graph resolves to a single X major
- [x] run `npx @mui/x-codemod@latest v9.0.0/preset-safe src/`, then `git diff -w --ignore-blank-lines` and **revert everything that is not a real change**
- [x] review the 2 DataGrid sites (`AccountingExportPreview.tsx` + the other) against the v8→v9 DataGrid migration guide — note `autoHeight` is **not** deprecated, that was a false finding
- [x] run the verification gate (typecheck, lint, build)

**Task 3 findings (2026-07-28):**

- Pinned both X packages to exact `9.10.1` (still `latest`); lockfile resolves a **single** X major,
  both peering on the installed core 7.3.11.
- **Codemod: 8 files "ok", only 1 real change class.** The only genuine edits were the five
  `enableAccessibleFieldDOMStructure={false}` removals (Task 4's first checkbox — the codemod does
  it as part of `preset-safe` since the prop no longer exists in v9). Everything else was noise,
  reverted wholesale: comment relocation in `viemTransactionErrors.ts` (a file with **no MUI
  content** — same failure mode as the v8 codemod), no-op paren-wrapping in `_document.tsx` and
  `AutoWrapEnableDialogContentSection.tsx`, a semicolon in `DefaultActivityRow.tsx`, JSX text
  mangling (`&apos;` → `'`, broken indentation) in `SendStream.tsx`, and a whitespace-only reprint
  of `VestingScheduleTable.tsx`. Reverted all of it and hand-applied the five prop removals cleanly.
- **DataGrid v8→v9 review: nothing applies.** Both DataGrid sites are `AccountingExportPreview.tsx`
  and the `MuiDataGrid` theme overrides in `theme.ts` (+ the `themeAugmentation` type import) — no
  other file imports `@mui/x-data-grid`. The v9 guide's breaking changes are: `experimentalFeatures`
  charts flag (Premium-only), `filterPanelColumns` locale key rename (unused), and
  `virtualScrollerContent` DOM moves (no selector in `src/` or `tests/` touches it). `autoHeight`
  unchanged, kept. The existing `if (gridApiContext.current)` guard and v8-signature `valueGetter`s
  are already v9-correct.
- ➕ **Task 6 watch item:** v9 formats pagination numbers by default (`paginationDisplayedRows`).
  No Cypress assertion reads the pagination caption today (`ExportPage.ts` only uses
  `.MuiDataGrid-cell` / header / panel tokens, all unchanged in v9), but if a new failure mentions
  row-count text, this is the first suspect.

### Task 4: Remove the `enableAccessibleFieldDOMStructure={false}` pin
- [x] remove the prop from all 5 picker instances (`AccountingExportForm.tsx` ×2, `SendStream.tsx` ×2, `CreateVestingForm.tsx` ×1) — done in Task 3: the v9 `preset-safe` codemod removes it (the prop no longer exists), kept as a real change there
- [x] rebase `src/components/PickerField/mobileTapPicker.tsx` off `PickersTextField` instead of `@mui/material`'s `TextField` — the pin was the only reason it used the latter
- [x] confirm the mobile mechanism survives: `readOnly` still suppresses editing under the accessible DOM (`useFieldSectionContentProps` sets `contentEditable: !disabled && !readOnly`), so only the base component changes
- [x] re-verify mobile tap-to-open by forcing the mobile variant on desktop Chrome with `desktopModeMediaQuery="@media (min-width: 100000px)"` — viewport size alone cannot do this, MUI switches on `@media (pointer: fine)`. Field tap must open `[role=dialog]`; the calendar icon must still open exactly once; desktop fields must stay editable and must **not** open on field click
- [x] run the verification gate

**Task 4 findings (2026-07-28):**

- `MobileTapTextField` now renders `PickersTextField` (root export of `@mui/x-date-pickers`),
  typed `PickersTextFieldProps`; `onClick` arrives via its `FormControl` root, so the tap-to-open
  handler is unchanged. All five consumers' `slotProps.textField` payloads (`helperText`,
  `fullWidth`, `onBlur`, `autoComplete`, `data-cy`) typecheck against the new base — no consumer
  changes needed.
- **Mobile mechanism verified against the production build** (`pnpm build && pnpm start`, one-off
  Cypress spec on `/accounting`, Electron/Chromium, not committed):
  - Desktop (real `pointer: fine`): sections render `contenteditable=true`; clicking the field
    content opens **no** `[role=dialog]`; the calendar icon opens exactly one dialog; Esc closes it.
  - Mobile variant (forced): **zero** `contenteditable=true` sections (the `readOnly` lever works
    under the accessible DOM); tapping a field section opens exactly one `[role=dialog]`; the
    calendar icon also opens exactly one dialog — no double-toggle.
- Verification-method note: forcing the mobile variant was done by stubbing `win.matchMedia` in
  `cy.visit`'s `onBeforeLoad` so `(pointer: fine)` never matches — equivalent to the
  `desktopModeMediaQuery` prop trick but with zero app-code changes. CDP
  `Emulation.setEmulatedMedia` (pointer/hover features) does **not** reach the Cypress AUT iframe —
  the desktop variant kept rendering — so don't reach for it in Task 6 either. Also: this machine
  has no Chrome binary; Cypress runs Electron (Chromium), same as the Task 1 baseline.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm build` all green.

### Task 5: Migrate the picker Cypress selectors to the section-based DOM
- [x] rewrite `Common.inputDateIntoField` — its `.should('be.visible')` then `.type()` cannot work against the v8+ hidden mirror input, and its `{selectall}{del}` prefix is what caused step 1's nine CI failures. Do not reintroduce that prefix
- [x] update `ExportPage.ts` `DATE_RANGES`, `VestingPage.ts` `DATE_INPUT`, `SendPage.ts` `END_DATE` and the ``${END_DATE} input`` value assertion
- [x] prefer app-owned `data-cy` hooks over MUI implementation details, following the convention step 2 established for icons
- [x] sweep for any other picker-DOM-dependent selector Task 2 surfaced
- [x] run the verification gate

**Task 5 findings (2026-07-28):**

- New `BasePage.setPickersFieldValue(fieldSelector, value)`: asserts the field container is
  visible, then writes the full formatted value into the **hidden mirror input** via the native
  `HTMLInputElement.prototype.value` setter + a bubbling `input` event (the mirror's `onChange`
  parses a full value string — this is the v9-supported autofill path), then asserts
  `hasValue(<field> input, value)` so a rejected parse cannot pass silently. `.type()`/`.clear()`
  are impossible: the only `<input>` is visually hidden and fails Cypress actionability.
- `Common.inputDateIntoField` now takes the field **container** selector and delegates to
  `setPickersFieldValue`. No `{selectall}{del}` prefix, no separate `clear()` — both prior
  failure modes stay excluded, and the whole write is one command so mid-command re-render
  detachment can't bite.
- Selector changes: `VestingPage.DATE_INPUT` dropped its ` input` suffix (container now);
  `SendPage` needed **no code change** — `START_DATE`/`END_DATE` were already containers and the
  ``${END_DATE} input`` assertions read the hidden mirror, whose value is the same formatted
  string the helper writes. `ExportPage.DATE_RANGES` (a Stack wrapping both fields, indexed
  0/-1) is replaced by app-owned hooks: new `data-cy="export-start-date"` / `"export-end-date"`
  on the two `AccountingExportForm.tsx` textField slots; `changeExportEndDate` still only
  clicks (focus-shift to commit the start date — the historical "autofills 0s" comment kept).
- Sweep: no other picker-DOM selector exists in `tests/` (re-grepped `.Mui` picker tokens —
  only `ExportPage.FILTER_INPUT_FIELDS`, which is DataGrid filter-panel DOM, unchanged in v9).
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm build` green; tests-package `tsc` errors are all
  pre-existing viem/ox `node_modules` noise, page objects compile clean.
- **Cypress A/B against the production build** (orphaned `next start` on :3000 killed first —
  the Task 1 trap fired again): failure set **strictly smaller** than the Task 1 baseline.

  | spec | tests | passing | failing (baseline) |
  |---|---|---|---|
  | ExportPage | 12 | 4 | **8** (8, identical names) |
  | SendPage | 21 | 16 | **5** (6 — "Modifying a stream with just end date" now passes) |
  | VestingPageOne | 16 | 15 | **1** (1, same: Change network button) |
  | VestingPageTwo | 19 | 19 | 0 (0) |
  | VestingPageThree | 13 | 13 | 0 (0) |
  | VestingPageV2 | 1 | 1 | 0 (0) |
  | **total** | **82** | **68** | **14** (15) |

  Every failing name is in the baseline set; no new failures.

### Task 6: A/B verify step 3
- [x] `pnpm build && pnpm start`, re-run `ExportPage`, `SendPage` and `VestingPage` **together** — step 1 ran only `ExportPage` and that is exactly how nine CI regressions got through
- [x] run any spec touching the DataGrid column menu / pagination — `ExportPage` is the only spec touching DataGrid DOM (`COLUMN_HEADERS`, `HEADER_TRIPLE_DOTS` column menu, `data-field` header clicks); included in the run
- [x] compare against the Task 1 baseline: **failure set identical by name, or strictly smaller** — strictly smaller (14 vs 15)
- [x] record the before/after table in this file
- [x] ⚠️ if any new failure appears, diagnose it before proceeding — none appeared; every failing name is in the baseline set

**Task 6 findings (2026-07-28, single Cypress run of all six specs together, fresh `pnpm build && pnpm start`, port 3000 verified free beforehand):**

| spec | tests | passing | failing (Task 1 baseline) |
|---|---|---|---|
| ExportPage | 12 | 4 | **8** (8, identical names) |
| SendPage | 21 | 16 | **5** (6 — "Modifying a stream with just end date" passes again) |
| VestingPageOne | 16 | 15 | **1** (1, same: Change network button) |
| VestingPageTwo | 19 | 19 | 0 (0) |
| VestingPageThree | 13 | 13 | 0 (0) |
| VestingPageV2 | 1 | 1 | 0 (0) |
| **total** | **82** | **68** | **14** (15) |

- Failing names, all in the Task 1 known-unrelated set: ExportPage — price granularity/accounting
  periods examples #1–#4, multiple addresses export, counterparty export, date range, CSV export;
  SendPage — stream tables (just start date / start+end / end date), modifying a streams start
  date, modifying a stream with start and end date (not started yet); VestingPageOne — change
  network button.
- Matches the Task 5 partial A/B exactly; running all six specs together (the step-1 lesson)
  changed nothing. The Task 3 pagination watch item did not fire — no failure mentions row-count
  text. DataGrid column-menu interactions in ExportPage's 4 passing scenarios behaved normally.

### Task 7: Bring `docs/plans/mui-v6-to-v9-upgrade.md` up to date
- [x] add the missing **§Step 2 outcome** section — reconstruct from PR #880's body, which is currently the *only* record of that step (no session file was written)
- [x] add the `{selectall}{del}` finding to §Step 1 outcome — the plan still does not record it, and it is the most reusable lesson in the project
- [x] add a **§Step 3 outcome** section: what shipped, what was verified and how, and every place this plan's prose turned out to be wrong
- [x] resolve the two §Open questions if Task 2 answered them — "can v6 skip v7" marked resolved-as-moot (step 2 shipped via the v7 stop, which X v9's `^7.3.0` peer made load-bearing anyway); the Emotion SSR question stays explicitly open, assigned to step 4 (Task 2 did not touch that surface)

**Task 7 findings (2026-07-28):** §Step 2 outcome reconstructed from PR #880's body (merge
`91b99ec5`) — versions/lab co-bump, Grid → `GridLegacy` pins, `createPalette` augmentation move,
the 45-icon `data-testid` production gate and the 214/21/identical A/B. §Step 1 outcome gained the
`{selectall}{del}` lesson (Cypress `{selectall}` is not a Ctrl+A keydown; write the full formatted
value instead — still true in v9 per the Task 2 source read). §Step 3 outcome records the 9.10.1
bump, pin removal, `PickersTextField` rebase, hidden-mirror-input selector strategy, the 82/15→14
A/B, and four prose corrections (END_DATE needed no change; codemod noise recurred identically;
the stale-server port-3000 trap; the pagination watch item that never fired). Header "Not started"
updated to "steps 1–3 implemented".

### Task 8: Ship step 3
- [x] review the full diff; confirm `tests/cypress.env.json` is **not** staged — reviewed the whole branch diff vs `origin/master` (12 files); `cypress.env.json` is gitignored (`tests/.gitignore:7`) and appears nowhere in `git log --all`
- [x] commit and push this ralphex worktree's branch — pushed as `origin/mui-x-v9-and-core-v9`
- [x] open a PR to **`master`** describing the bump, the pin removal and the selector migration, with the A/B table as evidence — follow #880's PR body as the format precedent — **PR #881** (https://github.com/superfluid-org/superfluid-dashboard/pull/881)
- [x] **STOP — this is the end of ralphex run 1.** Do not start Part B in this run: it needs step 3 merged and the browser gate answered (Task 9), and it ships as its own PR from a fresh worktree off updated `master`

---

# Part B — Step 4: core v7 → v9

*The real project: this is where the bundle dedup is finally realised. Everything before it was
clearing the dependency chain.*

### Task 9: ⚠️ Browser-support gate — requires a human decision
- [x] state plainly in this file that core v9 raises the browser floor to **Chrome 117 / Safari 17 / Firefox 121** — stated: **upgrading `@mui/material` to v9 drops support for any browser older than Chrome 117, Safari 17, or Firefox 121.** Users on older browsers will get a broken or unstyled dashboard
- [x] **stop and ask the human** to confirm against analytics. The master plan calls this
      non-negotiable: *"probably fine for a crypto dashboard, but check."* An agent cannot check
      analytics — do not assume, do not proceed on a guess — asked and answered, see below
- [x] record the answer and who gave it before continuing

**Answer: ACCEPTED.** Given by **Kaspar Kallas on 2026-07-28**, on the reasoning that the floor is
MUI's own published requirement rather than anything this repo invented, and that this product's
users run current browsers.

**Recorded honestly: this was not checked against analytics.** No browser-version data was pulled;
the decision rests on the owner's knowledge of the userbase. If a support report ever arrives from a
user on an older browser, this is the decision to revisit — the symptom would be a broken or
unstyled dashboard rather than an error message, which is easy to misdiagnose.

**The gate is now closed and Part B is unblocked.** A later agent must not re-ask this.

⚠️ **Ralphex run 1 halted here (2026-07-28).** Two blockers, both by design:
1. **PR #881 (step 3) is still OPEN, not merged** — Task 10's precondition ("worktree off a
   `master` that already contains merged step 3") fails, and Task 8 marks this commit as the end
   of run 1. Part B must ship from a fresh worktree via a second ralphex run.
2. **The analytics check needs a human.** Confirm the Chrome 117 / Safari 17 / Firefox 121 floor
   against real usage data, record the answer and who gave it above, then merge #881 and start
   ralphex run 2 for Tasks 9–18.

### Task 10: Bump core to v9
- [ ] confirm this is **ralphex run 2**, in a worktree off a `master` that already contains merged step 3 — if step 3's PR is not merged, mark ⚠️ and stop
- [ ] capture a fresh production-build Cypress baseline, as in Task 1 — Part A's baseline is stale by now
- [ ] set `@mui/material`, `@mui/system`, `@mui/icons-material`, `@mui/utils` to **exact 9.2.0** (past the broken 9.1.0); co-bump `@mui/lab` to the version peering on core 9
- [ ] `pnpm install`; expect a large volume of type errors — that is normal and is what Tasks 11–13 clear
- [ ] record the initial `pnpm typecheck` error count in this file as the burn-down number

### Task 11: System props → `sx`
- [ ] run `npx @mui/codemod@latest v9.0.0/system-props src/`
- [ ] **hand-diff the output.** The codemod has known silent-skip bugs (mui/material-ui#48269): it keys off import statements, misses auto-imports, and a same-named non-MUI import silently skips the whole file. Expect ~**839 attributes on 572 elements across ~129 files**; the codemod itself touched 133 files of which 4 were printer-only
- [ ] sweep manually for files the codemod skipped — the heaviest are `pages/ui-lab.tsx` (58), `pages/stream/[_network]/[_stream].tsx` (48), `tokenAccess/TokenAccessRow.tsx` (31); commonest props are `gap` (260), `alignItems` (250), `color` (160), `justifyContent` (88)
- [ ] `git diff -w --ignore-blank-lines` and revert all reprint noise
- [ ] run the verification gate

### Task 12: Legacy slot props → `slotProps`
- [ ] convert the ~**141** direct JSX assignments: `primaryTypographyProps` ×61 (28 files) and `secondaryTypographyProps` ×38 (19 files) → `slotProps.primary` / `slotProps.secondary`; `PaperProps` ×18; `inputProps` ×12; `InputProps` ×9; `componentsProps` ×2; `MenuProps` ×1
- [ ] note there are **no** direct JSX `InputLabelProps` / `TransitionProps` in `src` — those names appear only in a local type and in theme defaults; do not chase them
- [ ] re-measure before trusting these counts (measured 2026-07-27); an earlier estimate of "75" omitted `ListItemText` entirely and was ~2× off
- [ ] run the verification gate

### Task 13: Theme and removed component APIs
- [ ] remove the override keys deleted in v9 from `src/features/theme/theme.ts`: `MuiButton.outlinedSecondary` (~:724), Chip `avatarMedium` / `iconMedium` / `deleteIconMedium` (~:900-906), combined Alert `standard*` (~:930-939), `MuiListItemText.primaryTypographyProps` (~:991-996), Menu/Popover `PaperProps` + `TransitionProps` defaults (~:1033-1054), Tooltip `PopperProps` (~:1170-1174), CardHeader `subheaderTypographyProps` (~:1199-1203) — line numbers are from 2026-07-27, locate by key not by line
- [ ] replace removed component props: `Avatar` `imgProps` at `token/TokenIcon.tsx:151-159`; `Drawer` `SlideProps` + `PaperProps` at `transactionDrawer/TransactionDrawer.tsx:36-46`
- [ ] rename the removed duplicate icon export `AddCircleOutline` → `AddCircleOutlined` at `pages/ui-lab.tsx`, `tokenWrapping/TokenListItem.tsx`, `send/stream/SendStream.tsx`
- [ ] **do not** switch to the CSS-variables theme — `cssVariables` defaults to false and is not forced; `getModeStyleCB`, the separate `LIGHT_THEME`/`DARK_THEME` objects and `palette.mode` all keep working unchanged
- [ ] run the verification gate

### Task 14: Cypress class-token sweep
- [ ] update the **51 MUI / PrivateSwitchBase class tokens across 10 page objects**. The headline break: v9 splits `.MuiButton-textPrimary` into `.MuiButton-text.MuiButton-colorPrimary`, and the same split pattern applies across other variant+color compounds
- [ ] this is **silent breakage** — a stale token matches nothing and reads as a missing element, not as a selector error. Grep for every `.Mui`-prefixed token in `tests/` and check each against the v9 DOM
- [ ] prefer app-owned `data-cy` hooks where a token is load-bearing, per the step-2 convention
- [ ] run the verification gate

### Task 15: Confirm the dedup actually happened
- [ ] verify `pnpm-lock.yaml` no longer resolves two `@mui/material` majors — the `@lifi/wallet-management` copy at 9.x should now converge with ours
- [ ] run `pnpm dedupe` and confirm it collapses the duplicate (it could not before: `dedupe` cannot merge across majors, which is why steps 1–3 delivered no dedup)
- [ ] record the before/after bundle impact in this file
- [ ] ⚠️ if the copies do **not** converge, say so explicitly — the migration's headline justification would then be unrealised and the human needs to know

### Task 16: Full A/B verification of step 4
- [ ] `pnpm build && pnpm start`; run the **full** Cypress suite, not a subset
- [ ] compare against the Task 10 baseline: failure set identical by name or strictly smaller
- [ ] record the before/after table
- [ ] verify the two `GridLegacy` dialogs still render correctly — Approvals → *Add Permissions*, Auto-wrap → *Add Token*. **Nothing automated covers their layout**; this needs a rendered check
- [ ] ⚠️ report any new failure rather than absorbing it

### Task 17: Verify acceptance criteria
- [ ] every requirement in the Overview is implemented
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` all green
- [ ] full Cypress suite A/B'd against a production build on both sides, results recorded
- [ ] no `^` ranges on any MUI package
- [ ] `tests/cypress.env.json` is not committed anywhere in the branch history
- [ ] `date-fns` is still v2 and the three `AdapterDateFnsV2` imports are untouched

### Task 18: [Final] Documentation and ship
- [ ] add **§Step 4 outcome** to `docs/plans/mui-v6-to-v9-upgrade.md`, and mark the overall migration complete
- [ ] correct every place the master plan turned out to be wrong — it has been wrong at least once per step, and recording that is what makes the next migration cheaper
- [ ] update `README.md` / `AGENTS.md` if any convention changed (e.g. the step-2 rule that new e2e selectors must add an explicit `data-cy`, since MUI icons no longer carry a free `data-testid` in production)
- [ ] commit, push, open the step-4 PR to **`master`** with the A/B table and the dedup evidence

---

## Technical Details

**Version targets**

| package | from | to |
|---|---|---|
| `@mui/x-data-grid` | `^8.29.1` | exact `9.10.1` |
| `@mui/x-date-pickers` | `^8.29.0` | exact `9.10.1` |
| `@mui/material` / `system` / `icons-material` / `utils` | `7.3.11` | exact `9.2.0` |
| `@mui/lab` | `7.0.1-beta.25` | the release peering on core 9 |
| `date-fns` | 2.30.0 | **unchanged** |

**The adapter trap.** `@mui/x-date-pickers/AdapterDateFns` silently flipped meaning at the v8
boundary: the unsuffixed name targets date-fns v3/v4 from v8 onward, and `AdapterDateFnsV2` is the
v2 adapter. The three sites (`AccountingExportForm.tsx`, `CreateVestingForm.tsx`, `SendStream.tsx`)
are on `AdapterDateFnsV2` and **must stay there** while date-fns is v2. `tsc` does **not** catch a
wrong adapter — `next build --webpack` does, failing on `enUS`, `longFormatters`, `parse`, `isValid`,
`format` imports. If date-fns ever moves to v4, revert those three to `AdapterDateFns`.

**Why the mobile picker needs two levers at different layers** (relevant to Task 4): `readOnly` must
arrive as a *field-internal* prop via `slotProps.textField` as a function of `FieldOwnerState`,
gating on `ownerState.pickerVariant === 'mobile'` — setting `readOnly` on the *picker* instead flips
`triggerStatus` to `'disabled'` and greys out the calendar icon. Opening on tap needs
`usePickerContext().setOpen`, only available below the picker's provider, hence the custom
`textField` slot; it guards on `event.isDefaultPrevented()` because the open-picker icon button
calls `preventDefault`, which is what prevents a double-toggle.

## Do not chase

- **Known-unrelated Cypress failures**, all failing identically on `master` from live-data fixture
  drift: `ExportPage` (8), `SendPage` (6 late scenarios), `StreamDetailsPage` (3), `AddressBook` (2),
  `IndividualTokenPage` (1), `VestingPageOne` (1). Step 2's baseline was 214 tests / 21 failing.
- **`gnosis-safe-tests`** — external. Safe never creates the iframe; Polygon gets an Infura 403
  inside `app.safe.global`.
- **The scheduled *Production* Cypress workflow** — red on `master` for unrelated `AllNetworkTests`
  wrap-page RPC assertions. The **Dev CI/CD runs on `master`** are the correct baseline.
- **`VestingPage.FORWARD_BUTTON`** — a documented **dead probe**. It targets an icon nothing on the
  vesting page renders, so the `deleteScheduleIfNecessary` block it guards has never run. Step 2
  deliberately left it non-matching. Fixing it means starting a delete flow that has never executed;
  that belongs in its own change.
- **`autoHeight` on DataGrid** — not deprecated. `@mui/x-data-grid@8.29.1` has zero `@deprecated`
  tags, no runtime warning, and the prop is actively consumed by `useGridDimensions`. A previous
  report flagged it in error.

## Post-Completion

*No checkboxes — these need a human or an external system.*

**Requires a human decision before Part B can start**
- **Browser-support floor.** Core v9 requires Chrome 117 / Safari 17 / Firefox 121. Must be checked
  against real analytics. This is Task 9 and it is a hard gate.

**Manual verification**
- The two `GridLegacy` dialogs — Approvals → *Add Permissions*, Auto-wrap → *Add Token*. Nothing
  automated covers their layout; step 2's PR asked a reviewer to eyeball them and step 4 changes the
  surface again.
- Mobile picker behaviour on a **real touch device**. The forced-media-query trick reproduces it on
  desktop Chrome, which is enough to catch regressions but is not the real thing.
- `DateTimePicker` desktop confirmation UX. Since v8 it requires an explicit Cancel/OK action bar on
  Send start/end date and Vesting start date instead of auto-closing. This was **accepted in step 1
  and never product-reviewed.** If someone asks to restore v7 behaviour: a bare `closeOnSelect` is
  **not** equivalent — v7 derived it from `wrapperVariant === 'desktop'`, i.e. false on mobile.
  Derive it from the same desktop media query or split into explicit Desktop/Mobile variants.
- `{selectall}{del}` no longer clears a picker field **for real users**, in both DOM modes. Upstream
  v8 behaviour, not introduced by this work. "Select all, delete" is a reasonable user action and
  nobody has decided whether to care.

**Separate projects, deliberately excluded**
- **CSS-variables theme.** Genuinely worthwhile — SSR-safe theming, no flash-of-wrong-theme, mode
  switching as pure CSS instead of a React re-render, and it would replace the hand-rolled
  `getModeStyleCB` with a supported mechanism. It is **opt-in and not forced by v9**. Do it on its
  own merits, not inside a dependency migration.
- **`date-fns` v2 → v4.** Not forced by any step. A real migration: broad app usage, the v3
  deep-import removal, and a **separate `tests/package.json` + `tests/pnpm-lock.yaml`** also pinned
  to `^2.30.0`, so the Cypress package must move with it.
- **Pigment CSS / zero-runtime.** Opt-in and a v10 concern. Emotion stays the default engine in v9.

**Open questions the master plan never resolved**
- Is the Pages Router `extractCriticalToChunks` SSR pattern (`src/pages/_document.tsx` +
  `src/features/theme/createEmotionCache.ts`) still *documented* for v9? `@mui/material-nextjs@9`
  peer deps still include `@emotion/server`, which is suggestive but not proof. Verify at
  https://mui.com/material-ui/integrations/nextjs/ . Note `@mui/material-nextjs` is **not installed**
  here — adding it is a deliberate SSR decision, not a co-bump.

## Key references

- Core v9 migration: https://mui.com/material-ui/migration/upgrade-to-v9/
- MUI X v8 → v9 migration: https://mui.com/x/migration/
- 9.1.0 broken minor: https://github.com/mui/material-ui/issues/48636
- `system-props` codemod bugs: https://github.com/mui/material-ui/issues/48269
- DataGrid at-scale pain (does **not** apply here): https://github.com/mui/mui-x/issues/20711
- Master plan: `docs/plans/mui-v6-to-v9-upgrade.md`
- Step 1: PR #878 · Step 2: PR #880 (its body is the only record of step 2)
