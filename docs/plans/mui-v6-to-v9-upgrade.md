# MUI v6 → v9 upgrade

> Forward-looking ticket (researched 2026-07-21, **re-verified 2026-07-27**). Not started. Scope
> estimate: **2–4 focused weeks**, most of it concentrated in `src/features/theme/theme.ts` and the
> Cypress page objects. Decomposes into four **separately mergeable, order-dependent** stages
> (§Sequencing) — step 4 is the real project. The 2–4 week figure predates two offsetting
> corrections: the forced CSS-variable theme rewrite was **removed** from scope (§Top risk), while
> step 1/2 functional and Cypress work was **added**. Re-estimate before committing.
>
> **Step 1 is IMPLEMENTED (2026-07-27)** — branch `feat/mui-x-v7-to-v8`, commit `5a0051b7`,
> [PR #878](https://github.com/superfluid-org/superfluid-dashboard/pull/878). Everything §Sequencing
> step 1 predicted was real except the year/month action-bar claim (corrected below). It also
> surfaced three things this plan did not anticipate, one of which adds mandatory work to **step 3**:
> the `enableAccessibleFieldDOMStructure={false}` pin, a mobile tap regression (**fixed in the same
> PR** — see §Step 1 outcome item 2), and picker Cypress breakage well beyond `ExportPage.ts`.
> Step 1 was **not** a one-day bump. See §Step 1 outcome.
>
> **Re-verification (2026-07-27).** Still true: core 6.5.0 / X 7.29.x / date-fns 2.30.0 installed;
> X v8 peers accept core `^6.0.0`; X v9 requires core `^7.3.0 || ^9.0.0`; the LiFi duplicate
> `@mui/material@9.2.0` is still in the lockfile (dedup argument intact); `sx` count accurate at 675.
> Corrected: **date-fns is not a forced co-bump** (§Date-fns); **CSS variables are not forced by
> core v9**, removing the claimed `theme.ts` rewrite (§Top risk); counts re-measured in §Costs;
> steps are order-dependent, and bundle dedup lands only at step 4. Current X `latest` is 9.10.1.

## Why

We run `@mui/material@^6.5.0`. Latest is **9.2.0** — two core majors behind (there is **no MUI
core v8**; core went 7 → 9 to realign numbering with MUI X). The trigger for looking into this:

- **We already ship two full copies of Material UI.** `pnpm-lock.yaml` resolves both
  `@mui/material@6.5.0` (ours) and `@mui/material@9.2.0` (a direct dep of
  `@lifi/wallet-management@4.1.2`). Converging on 9 deduplicates one copy out of the bundle — a
  benefit unique to this repo, absent from any migration guide.

**Not a reason (debunked during research):** React 19 support. `@mui/material` has declared
`react: ^17 || ^18 || ^19` since 5.18/6.0 — v6 officially supports React 19. We are **not** on an
unsupported combination. Do not cite React 19 as motivation.

## Benefits

MUI itself calls v9 a *foundations* release — no visual redesign. Concrete wins:

- **Bundle dedup** (above) — the strongest repo-specific win.
- **~30% faster `sx` prop** (mui/material-ui PR #44254). We have ~670 `sx=` usages in a
  data-dense dashboard, so this is the perf win most likely to be felt.
- **CSS-variables theme** — SSR-safe theming, no flash-of-wrong-theme, mode switching as pure CSS
  instead of a React re-render. Would replace our hand-rolled `getModeStyleCB(mode)` pattern with a
  supported mechanism. **Opt-in and not part of this migration** — `cssVariables` defaults to false
  in v9. Treat as a separate project (§Top risk).
- **v7 ESM `exports` layout** — real tree-shaking, unambiguous bundler resolution.
- **Accessibility pass** — roving tabindex on Tabs/MenuList/Stepper, semantic Stepper markup,
  Backdrop no longer over-applying `aria-hidden`.
- Minor: two new components (`NumberField`, `Menubar`), `color-mix()` derived colors, TS tweaks.

Non-benefits to set expectations: Pigment CSS / zero-runtime is **opt-in only and a v10 concern**;
Emotion stays the default engine in v9 (confirmed via peer deps) — no forced styling migration.

**No MUI X licensing downside.** Community tier lost nothing between X v7 and v9 (Data Grid data
source actually moved *into* free). We use no Pro/Premium packages. (The licensing doc page still
wrongly lists column resizing as Pro — stale doc, contradicted by the pricing page.)

## Costs

| Area | Scale | Difficulty |
|---|---|---|
| `src/features/theme/theme.ts` | 1,261 lines · 34 `styleOverrides` · 22 `defaultProps` · 14 custom variants · 13 custom typography variants · custom `palette.other` | **Targeted edits, not a rewrite** (§Top risk). Removed override keys: `MuiButton.outlinedSecondary` (:724), Chip `avatarMedium`/`iconMedium`/`deleteIconMedium` (:900-906), combined Alert `standard*` (:930-939), `MuiListItemText.primaryTypographyProps` (:991-996), Menu/Popover `PaperProps`+`TransitionProps` defaults (:1033-1054), Tooltip `PopperProps` (:1170-1174), CardHeader `subheaderTypographyProps` (:1199-1203) |
| System props → `sx` | **839 attributes on 572 elements across 129 files** (measured 2026-07-27 by running `@mui/codemod v9.0.0/system-props` on a scratch tree and diffing ASTs with the transform's own component/prop rules; the codemod touched 133 files, 4 printer-only). Worst offenders: `pages/ui-lab.tsx` 58, `pages/stream/[_network]/[_stream].tsx` 48, `tokenAccess/TokenAccessRow.tsx` 31. Top props: `gap` 260, `alignItems` 250, `color` 160, `justifyContent` 88 | Mechanical, but the codemod has silent-skip bugs — see below |
| Cypress selectors | **51 MUI/PrivateSwitchBase class tokens across 10 page objects**, plus **45 icon `data-testid` selectors across 13 files**. Breakage is spread across steps, not concentrated in 4: picker classes break in **step 1** (done — 2 tokens fixed), picker **field-DOM** `input` selectors break in **step 3** when the step-1 pin is removed (`ExportPage` `DATE_RANGES`, `VestingPage` `DATE_INPUT`, `SendPage` `END_DATE`, + the `Common.inputDateIntoField` helper), icon test-ids in **step 2** (v7 drops the default `data-testid` in production icon bundles), class-name splits in **step 4** | **Silent breakage.** v9 splits `.MuiButton-textPrimary` → `.MuiButton-text.MuiButton-colorPrimary` |
| Legacy slot props | **141** direct JSX assignments (measured 2026-07-27): `primaryTypographyProps` ×61 (28 files), `secondaryTypographyProps` ×38 (19 files), `PaperProps` ×18 (18), `inputProps` ×12 (9), `InputProps` ×9 (5), `componentsProps` ×2 (2), `MenuProps` ×1. **No** direct JSX `InputLabelProps`/`TransitionProps` exist in `src` — those names appear only in a local type and in theme defaults. The old "75" **omitted `ListItemText` entirely**: v9 moves `primaryTypographyProps`/`secondaryTypographyProps` to `slotProps.primary`/`.secondary`, 99 sites across **28 unique files** | Mechanical but ~2× the assumed volume |
| Emotion SSR `_document.tsx` | 1 file | See open question below |
| Forced co-bumps | `@mui/lab`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-date-pickers` | Sequencing constraint |
| `date-fns` v2→v4 | 3 adapter imports + app-wide usage + separate `tests/` lockfile | **Not forced** — optional, own slice. See §Date-fns |

### Top risk — RETRACTED 2026-07-27: CSS variables are not forced by core v9

This section previously called the CSS-variables switch the migration's top risk, and marked
`theme.ts` a forced **Rewrite** on that basis. **That is wrong, and it inflated the whole estimate.**

Published `@mui/material@9.2.0` `createTheme` still destructures `cssVariables = false`. With
`cssVariables` false and no `colorSchemes`, it returns the no-vars theme path and "behaves exactly
as v5". This repo passes `palette.mode` to `createTheme`, builds separate `LIGHT_THEME` and
`DARK_THEME` objects, and hands the selected one to `ThemeProvider`
(`src/features/theme/theme.ts:76-91`, `src/features/theme/MuiProvider.tsx:8-31`).

So a straight v7 → v9 upgrade does **not** make `palette.mode` static, does **not** need
`forceThemeRerender`, and does **not** require replacing `getModeStyleCB`. Moving to a single
CSS-variable theme is a worthwhile but **separate, opt-in architecture project**. Do not bundle it
with the dependency migration.

Real `theme.ts` work remains, but it is deprecated-prop and override-key removal (see §Costs), not a
CSS-variable rewrite.

### Hard gate
v9 raises the browser floor to **Chrome 117 / Safari 17 / Firefox 121**. Check analytics before
committing to step 4. Probably fine for a crypto dashboard, but non-negotiable.

### Repo-specific luck (keeps this from being brutal)
- Already React 19 + Next 16 (Pages Router → dodges the Next 16 `AppRouterCacheProvider` bug).
- Mostly on `Grid2` → dodges **both** Grid renames, but **three** legacy `Grid` sites remain, not
  one: `vesting/agora/ActionsList.tsx` (imports both), plus
  `tokenAccess/dialog/UpsertTokenAccessForm.tsx` and
  `auto-wrap/dialogs/AutoWrapAddTokenDialogSection.tsx` — the latter two already use
  container-with-non-`item`-children markup, so a v7 named-import flip can silently alter layout.
- Codebase is clean of legacy APIs: **zero** `makeStyles` / `withStyles` / `Hidden` / deep
  imports. (The `Hidden*` names in `DownloadButton`/`ReadFileButton` are our own `styled()`
  components, not MUI's removed `<Hidden>`.)
- **2 DataGrid files, no Pro/Premium, no `valueFormatter`/`rowSelectionModel`/`GridToolbar`
  churn** — dodges the scenario ([mui-x#20711](https://github.com/mui/mui-x/issues/20711)) that
  made this migration brutal for others (200 grid usages, 700 `valueFormatter`s, codemods
  useless, hand-written shims).
- `@mui/lab` in exactly **one** file (`src/pages/token/[_network]/[_token].tsx` — `TabContext`,
  `TabList`, both still lab-only in v9). Low code cost but a hard dependency gate (pinned to a v6
  beta).

## Sequencing

Stages are **separately mergeable in this order**, not independent — step 3 has a hard dependency on
step 2 landing core ≥ 7.3.0. "1–3 are low-risk" was too generous; see the functional and test work
called out in steps 1 and 2. **Bundle dedup is not realised until core reaches v9 (step 4)** — it is
not a benefit of steps 1–3.

1. **MUI X v7 → v8** — legal on core v6 (X v8 peers allow `^6.0.0`). **Keep `date-fns` at v2**;
   change the three `AdapterDateFns` imports to `AdapterDateFnsV2` (see §Date-fns below). Does *not*
   drag date-fns. **Not a one-day lockfile bump** — this step also carries:
   - `src/features/accounting/AccountingExportPreview.tsx:368-394` supplies a custom `toolbar` slot
     with no `showToolbar`. X v8 requires `showToolbar` for it to render; without it the export UI
     silently disappears.
   - `tests/cypress/pageObjects/pages/ExportPage.ts:22-23` uses `.MuiPickersYear-yearButton` and
     `.MuiPickersMonth-monthButton`. X v8 renames these to the `MuiYearCalendar-button` /
     `MuiMonthCalendar-button` families — **these selectors break in step 1, not step 4.**
   - Picker behaviour changes: ~~two-step year/month pickers (`AccountingExportForm.tsx:185-222`)
     hit v8's multi-view confirmation and action-bar default changes~~ — **wrong, see §Step 1
     outcome**; `DateTimePicker` sites (`SendStream.tsx`, `CreateVestingForm.tsx`) now require
     explicit confirmation rather than auto-closing — **confirmed**.
   - v8 makes the section-based accessible field DOM the default; these sites pass
     `slotProps.textField`, so DOM-dependent Cypress selectors must be run, not assumed.
     **Ran them: they break.** Deferred via a pin — see §Step 1 outcome and step 3.
2. **Core v6 → v7** — must land on **core ≥ 7.3.0**, not merely "v7", or step 3 is illegal.
   (+ lab / icons / system. **`@mui/material-nextjs` is NOT installed** — adding it is a deliberate
   SSR decision, not a co-bump; the repo uses a custom Pages Router Emotion setup in
   `src/pages/_document.tsx` + `src/features/theme/createEmotionCache.ts`.) Fix the private
   `@mui/material/styles/createPalette` augmentation path in `theme.ts`, convert the 2
   `componentsProps` sites (`AddressCopyTooltip.tsx`, `BalanceCriticalIndicator.tsx`).
   **Three legacy `Grid` import sites, not one** — `vesting/agora/ActionsList.tsx:1,183-186`
   (imports both `Grid` and `Grid2`), `tokenAccess/dialog/UpsertTokenAccessForm.tsx:1-13,209-242`,
   and `auto-wrap/dialogs/AutoWrapAddTokenDialogSection.tsx:3-15,62-110`. The latter two are the
   risky ones: their markup already looks partly like the newer API (container with children
   lacking `item`), so a named-import flip can silently alter layout.
   **v7 removes the default `data-testid` from `@mui/icons-material` production bundles** — this
   repo has **45 icon `data-testid` selectors across 13 files** in the Cypress page objects, and the
   test scripts exercise a production build. That is step 2 acceptance criteria, not step 4.
3. **MUI X v8 → v9** — only legal once core ≥ **7.3** (published peer is `^7.3.0 || ^9.0.0`, so
   core v6 is out). **Hard dependency on step 2** — not independently shippable.
   **This step is no longer "just a bump" — step 1 pushed real work into it (added 2026-07-27):**
   - **Remove `enableAccessibleFieldDOMStructure={false}` from all 5 picker instances**
     (`AccountingExportForm.tsx` ×2, `SendStream.tsx` ×2, `CreateVestingForm.tsx` ×1). The prop is
     reported removed in X v9, making this mandatory rather than optional. *Unverified against a v9
     package — confirm against the v9 migration guide before scheduling.*
   - **Migrate the picker-driven Cypress selectors to the section-based accessible DOM.** This is
     the work step 1 deferred, and it is wider than the two class tokens step 1 fixed:
     `ExportPage.ts` `DATE_RANGES`, `VestingPage.ts` `DATE_INPUT`, `SendPage.ts` `END_DATE` +
     `hasValue(`${END_DATE} input`)`, and the shared `Common.inputDateIntoField` helper itself
     (it does `.should('be.visible')` then `.type()`, which cannot work against the v8+ hidden
     mirror input). Budget this as its own slice, not a line item.
   - Re-run `SendPage`, `VestingPage` and `ExportPage` specs together — step 1 only ran `ExportPage`.
4. **Core v7 → v9** — the real project. Gated on the browser-support bump. Run
   `npx @mui/codemod@latest v9.0.0/system-props` **and hand-diff its output** across the 113
   files ([#48269](https://github.com/mui/material-ui/issues/48269): it keys off import
   statements, misses auto-imports, and a same-named non-MUI import silently skips the whole
   file). Sweep the Cypress class-name selectors. **Also required, and not previously inventoried:**
   an explicit deprecated-API / theme-override pass — the removed `theme.ts` override keys listed in
   §Costs, plus removed component props (`Avatar` `imgProps` at `token/TokenIcon.tsx:151-159`,
   `Drawer` `SlideProps`+`PaperProps` at `transactionDrawer/TransactionDrawer.tsx:36-46`), and the
   removed duplicate icon export **`AddCircleOutline` → `AddCircleOutlined`** at
   `pages/ui-lab.tsx:1`, `tokenWrapping/TokenListItem.tsx:1`, `send/stream/SendStream.tsx:2`.

## Step 1 outcome — implemented 2026-07-27

Commit `5a0051b7`, [PR #878](https://github.com/superfluid-org/superfluid-dashboard/pull/878).
`@mui/x-data-grid` 7.29.13→8.29.1, `@mui/x-date-pickers` 7.29.4→8.29.0. Core stayed 6.5.0,
date-fns stayed 2.30.0 — both confirmed correct, X v8 peers on `date-fns ^2.25.0 || ^3.2.0 || ^4.0.0`.

**Verified:** `tsc` clean, `eslint` clean, `next build --webpack` passes (the check that actually
catches a wrong adapter import — §Date-fns is right that `tsc` does not). `ExportPage.feature` run
on **both v7 and v8 with identical results** (4 passing / 8 failing), so the 8 failures are
attributable to pre-existing fixture drift (live accounting API returns 17 stream periods where the
fixture expects 14) rather than the upgrade. Independently reviewed by Codex CLI: no Critical/High.

**Note for future steps: there are no JS unit tests in this repo** — no jest/vitest config or
script. `tests/` is Cypress-only, `contracts/` is forge. Cypress *is* the functional gate, which is
why picker DOM changes are disproportionately expensive here.

### What this plan got right
The three named step-1 items were all real and all landed: `AdapterDateFnsV2` (§Date-fns is
accurate in full, including that the failure is build-time not silent), `showToolbar` on
`AccountingExportPreview` (without it the export UI does silently vanish), and the
`MuiPickersYear`/`MuiPickersMonth` → `MuiYearCalendar-button`/`MuiMonthCalendar-button` rename.

### Correction: the year/month `DatePicker` is NOT affected on desktop
§Sequencing step 1 claimed the two-step year/month pickers in `AccountingExportForm.tsx` "hit v8's
multi-view confirmation and action-bar default changes". **They do not.** In 8.29.0,
`DesktopDatePicker.js:46` pins `closeOnSelect: defaultizedProps.closeOnSelect ?? true` and passes
`steps: null`, which yields `DEFAULT_STEP_NAVIGATION` (`hasSeveralSteps: false`). `usePicker.js:218`
then returns `[]` for the default action bar, so it renders no Cancel/OK and still auto-closes after
the month view. Multiple *views* are not multiple *steps* — `steps` is a distinct v8 concept
(date-vs-time), and `DatePicker` always passes `null`. Confirmed empirically: the *Date range of the
reports* Cypress scenario passes unchanged.

### Three things this plan did not anticipate

1. **`enableAccessibleFieldDOMStructure={false}` pin (5 sites) — and it must come out before v9.**
   v8 defaults this to `true` (`internals/hooks/useField/useField.js:12`), replacing the field's
   editable `<input>` with a `visuallyHidden` + `aria-hidden` + `tabIndex={-1}` form mirror. Every
   picker-driven Cypress selector targets that input. Step 1 pinned the v7 DOM to keep the step
   shippable; **this is deferral, not avoidance** — it retains v7's weaker screen-reader behaviour
   and, per the Codex review, the prop is removed in v9. Work moved to step 3.
2. **Mobile tap regression — not covered by the pin. FIXED in PR #878.** v7's `useMobilePicker`
   forced the field `readOnly` and opened the modal on tap. v8's `useMobilePicker.js` (101 lines)
   does neither — no `readOnly` anywhere in the file, field props add only `id`. It is an
   intentional upstream change (CHANGELOG 8.0.0-alpha.8: *"The field is now editable if rendered
   inside a mobile Picker"*, #15671). So on touch, tapping a date field focused it and raised the
   keyboard; only the calendar icon opened the picker. Affected **all five** pickers.

   Reproduced in a browser before fixing, by forcing the mobile variant on a desktop Chrome with
   `desktopModeMediaQuery="@media (min-width: 100000px)"` (viewport size alone cannot do this — MUI
   switches on `@media (pointer: fine)`): clicking the field focused the `<input>`, typing `05`
   produced `05/YY`, and no `[role=dialog]` appeared.

   Fix: `src/components/PickerField/mobileTapPicker.tsx`, used by all five sites. **Two levers at
   different layers** — this is the part that is easy to get wrong:
   - `readOnly` must arrive as a *field-internal* prop, so it goes through `slotProps.textField`
     (as a function of `FieldOwnerState`, gating on `ownerState.pickerVariant === 'mobile'`).
     `readOnly` is in `SHARED_FIELD_INTERNAL_PROP_NAMES` (`hooks/useSplitFieldProps.js:13`) and
     field internal props are spread last, so it overrides picker context. Setting `readOnly` on
     the *picker* instead would flip `triggerStatus` to `'disabled'` (`usePicker.js:207`) and grey
     out the calendar icon.
   - opening on tap needs `usePickerContext().setOpen`, only available below the picker's provider
     → a custom `textField` slot component. It guards on `event.isDefaultPrevented()` because the
     open-picker icon button calls `preventDefault`, which is what stops a double-toggle.

   Verified after the fix: forced-mobile fields are `readOnly` and open the dialog on field tap;
   the icon still opens exactly once; the desktop control fields stay editable (`05/25`), non-
   readonly, and do not open on field click. `ExportPage.feature` held its 4-passing baseline with
   *Date range of the reports* (which types into a desktop date field) still passing.

   **Step 3 must revisit this component:** it renders `@mui/material`'s `TextField` because the
   `enableAccessibleFieldDOMStructure={false}` pin is still in place. Once the pin is removed the
   base must become `PickersTextField`. `readOnly` still suppresses editing under the accessible
   DOM (`useFieldSectionContentProps.js` sets `contentEditable: !disabled && !readOnly` and
   `tabIndex: -1`), so the mechanism survives — only the base component changes.
3. **A bare `closeOnSelect` is NOT an equivalent restoration of v7 `DateTimePicker` behaviour.**
   The confirmed change is real: `DesktopDateTimePicker` leaves `closeOnSelect` unset, so the
   default action bar becomes `['cancel','nextOrAccept']` and it no longer auto-closes (Send
   start/end date, Vesting start date). But v7 defaulted `closeOnSelect` to
   `wrapperVariant === 'desktop'` — i.e. **false on mobile**. Setting `closeOnSelect` flat would
   change mobile behaviour too. Restoring v7 properly means deriving it from the same desktop media
   query, or splitting into explicit Desktop/Mobile variants.

### Codemod: budget for reverting most of its output
`npx @mui/x-codemod@latest v8.0.0/preset-safe src/` touched **9 files; only 4 changes were real**.
Reverted: a 620-line reformat of `VestingScheduleTable.tsx` that `git diff -w --ignore-blank-lines`
shows changes *nothing*; an edit to `viemTransactionErrors.ts` (no MUI content at all) that
relocated two trailing comments onto the wrong clauses; and three files of jscodeshift reprint noise
(stray parens around JSX, unescaped `&apos;` → `'`). The §Sequencing step-4 warning to hand-diff
codemod output applies to the **X codemods too**, not just `v9.0.0/system-props`.

### Not a finding: `autoHeight` is not deprecated
An earlier draft of the step-1 report flagged `AccountingExportPreview`'s `autoHeight` as deprecated
in v8. **It is not.** `@mui/x-data-grid@8.29.1` `models/props/DataGridProps.d.ts` contains **zero**
`@deprecated` tags, `autoHeight`'s JSDoc is a plain recommendation, there is no runtime deprecation
warning, and the prop is actively consumed by `useGridDimensions` and `propValidation`. No action.

## Date-fns — not a forced co-bump (corrected 2026-07-27)

An earlier revision of this plan listed `date-fns` v2→v4 as forced by step 1. **It is not.**
`@mui/x-date-pickers@8.29.0` declares `date-fns: ^2.25.0 || ^3.2.0 || ^4.0.0`, and v9 still declares
the same. No step in this migration has a date-fns peer gate.

What actually changes is **which major the unsuffixed adapter targets** — v8 verified from its
published `exports` map, v7 from its published subpath directories (v7 has no package-level
`exports` field, so it cannot be read the same way):

| import | v7 | v8 |
|---|---|---|
| `@mui/x-date-pickers/AdapterDateFns` | date-fns **v2** | date-fns **v3/v4** |
| `@mui/x-date-pickers/AdapterDateFnsV3` | date-fns v3 | *removed* |
| `@mui/x-date-pickers/AdapterDateFnsV2` | *does not exist* | date-fns **v2** |

The suffix moved from the new adapter to the legacy one, so the unsuffixed name silently flips
meaning across the v8 boundary.

**TypeScript does not catch it; this repo's production build does.** `tsc --noEmit` passes — the v8
declaration exposes an adapter class over `Date`/`MuiPickersAdapter` and does not encode "requires
date-fns >= 3.2" in a form the app type-checker can prove, and `skipLibCheck` keeps dependency
declaration internals out of the gate. But `next build --webpack` **fails** during compilation with
attempted-import errors for `enUS`, `longFormatters`, `parse`, `isValid` and `format` from date-fns
v2 subpaths (verified 2026-07-27 against an isolated repro on this repo's toolchain: x-date-pickers
8.29.0, date-fns 2.30.0, core 6.5.0, TS 5.9 `moduleResolution: bundler`, Next 16.2.10). Loading the
CJS adapter in dev instead reaches MUI's explicit "date-fns v2.x is not compatible" runtime guard.
So the failure mode is bundler-dependent — build-time here, runtime elsewhere — but it is **not**
silent in this repo. `@mui/x-date-pickers/AdapterDateFns` stays a valid path in both majors, so
these three sites keep resolving and keep type-checking:

- `src/features/accounting/AccountingExportForm.tsx`
- `src/features/vesting/CreateVestingForm.tsx`
- `src/features/send/stream/SendStream.tsx`

(The v2 adapter uses deep *default* imports — `date-fns/addDays/index.js`; the v8 unsuffixed adapter
uses *named* imports from subpaths like `date-fns/addDays`. Both use subpaths, so "v3 removed deep
paths in favour of root named exports" is not the distinction.) This is almost certainly how the
original "forced co-bump" claim arose: the breakage is real, the inferred cause was not.

**Decision: keep date-fns at v2 for step 1**, changing those three imports to `AdapterDateFnsV2`.
Treat v2→v4 as an independent slice, orderable before or after step 1 — the import churn is
identical either way (one edit to the same three lines), so sequence it on risk, not cost:

- ~~Step 1 alone is a lockfile bump plus three one-line import changes. It ships in a day.~~
  **Corrected 2026-07-27 — this contradicted §Sequencing step 1 ("Not a one-day lockfile bump") in
  this same document, and the implementation proved §Sequencing right.** Step 1 as shipped was the
  three imports *plus* `showToolbar`, two Cypress class renames, five `enableAccessibleFieldDOMStructure`
  pins, a codemod whose output had to be 5/9 reverted, a v7-vs-v8 Cypress baseline to attribute
  pre-existing failures, and two unresolved behaviour regressions. The *date-fns sequencing argument
  below still holds* — it just doesn't rest on step 1 being trivial.
- date-fns v2→v4 is a genuine migration: broad app usage, the v3 deep-import removal, and a
  **separate `tests/package.json` + `tests/pnpm-lock.yaml`** also pinned to `^2.30.0`, so the Cypress
  package has to move with it.

Bundling them turns the smallest shippable slice into a repo-wide date migration that satisfies no
peer gate. Do date-fns v4 on its own merits — timezone support, ESM, active maintenance — whenever
there is appetite, and revert those three imports to `AdapterDateFns` at that point.

## Do regardless of any migration
**Pin exact MUI versions** instead of `^`. `@mui/material@9.1.0` shipped genuinely broken
([#48636](https://github.com/mui/material-ui/issues/48636) — ESM directory-import failure, fixed
only in 9.1.2 two weeks later); a caret range would have pulled it in. 9.2.0 is past it.

## Open questions to resolve before step 4
- Is the Pages Router `extractCriticalToChunks` SSR pattern (`src/pages/_document.tsx` +
  `src/features/theme/createEmotionCache.ts`) still **documented** for v9? `@mui/material-nextjs@9`
  peer deps still include `@emotion/server`, which is suggestive but not proof. Verify at
  https://mui.com/material-ui/integrations/nextjs/ .
- Can v6 skip v7 entirely, or is the v7 stop mandatory? Unconfirmed.

## Recommendation
Do steps 1–3 in order to clear the dependency chain, without committing to step 4. Defer step 4 and
decide it separately.

**Corrected 2026-07-27 — this section previously overstated the case twice:**

- It said steps 1–3 "start extracting value (bundle dedup, X features)". **Bundle dedup does not
  happen in steps 1–3.** It requires root core at v9, i.e. step 4. Steps 1–3 buy the dependency
  chain and X features only; if dedup is the motivation, step 4 *is* the project.
- It weighed step 4 against "a `theme.ts` rewrite plus a Cypress selector sweep". There is no forced
  `theme.ts` rewrite (§Top risk), so step 4 is **cheaper** than this section assumed — while steps
  1–2 are **more expensive** (picker behaviour, `showToolbar`, icon test-ids, three Grid sites).
  The net is a flatter curve than the original four-step story implied.

The note about in-flight send-form UI work still holds, but for a weaker reason: v9 does not rewrite
the theme surface, so the overlap is ordinary merge conflict risk rather than duplicated migration
work.

## Key references
- Core v9 migration: https://mui.com/material-ui/migration/upgrade-to-v9/
- Core v7 migration: https://mui.com/material-ui/migration/upgrade-to-v7/
- MUI X v8 / v9 migration: https://mui.com/x/migration/migration-data-grid-v7/ (+ v8→v9)
- 9.1.0 broken minor: https://github.com/mui/material-ui/issues/48636
- system-props codemod bugs: https://github.com/mui/material-ui/issues/48269
- DataGrid at-scale pain (does not apply to us): https://github.com/mui/mui-x/issues/20711
