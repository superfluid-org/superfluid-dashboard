# Transaction dialog loading → success transition polish

## Problem
After the progress indicator rework (MUI spinner + ring-close success hand-off), the
relaying→success flip still read as sudden and "unanimated": the dialog jumped size, the
success text/button teleported in, the final ring looked thinner than the spinner, and the
green success ripple barely registered.

## Root causes found
1. **MUI Stack `spacing` resets child margins.** With `useFlexGap: false` (the default),
   Stack emits `& > :not(style):not(style) { margin: 0 }` (specificity 0,1,2), which beats
   any child `sx` margin (0,1,0) — see `@mui/system/esm/Stack/createStack.js`. Every
   margin ever put on the dialog's Stack children (`mb: 4` on the old spinner Box, `my: 2`
   on the success headline and `loadingInfo`) was silently dead. **Inside a spacing Stack,
   space with padding, never margin.**
2. **DialogContent clips the ripple.** `.MuiDialogTitle-root + .MuiDialogContent-root
   { padding-top: 0 }` (2 classes) beats `sx={{ p: 4 }}` (1 class), and DialogContent is a
   scroll container — so the indicator sat flush against a clip edge and the ripple's top
   arc was cut off.
3. **Ring weight mismatch.** `txRingClose` narrowed the ring 6.5 → 5px to match the old
   `OutlineIcon` badge; the MUI spinner renders ≈6.55px (80 × 3.6/44), so success looked
   thinner than loading.
4. **No choreography.** Headline swap, OK-button mount, and the paper's instant resize all
   landed at t=0, swamping the 350ms badge animation.

## What was done
- `TransactionProgressIndicator`: ring stays 6.5px; slower beats (ring close 420ms, arrow
  pop delayed 220ms); a bigger ripple (2px border, scale 0.9→1.5, opacity 0.7→0, 900ms,
  fires at 320ms as the ring lands) — a double-wave variant was prototyped behind a lab
  A/B toggle and the user picked the single ripple, so the second wave was removed;
  reduced-motion is now opacity-only crossfades (shared `reducedMotionCss` applied under
  both the media query and a lab-only `data-force-reduced-motion` attribute /
  `forceReducedMotion` prop).
- New `src/features/common/AnimatedHeight.tsx`: ResizeObserver-driven height glide
  (~300ms) that settles back to `height: auto`; suppresses observer fires while animating
  (the flex chain makes content track the pinned height); `transitionend` + safety-timeout
  settle; disabled under reduced motion and in the fullscreen dialog mode. Mounted around
  `TransactionDialogCore`.
- `TransactionDialog`: indicator wrapped in an identical padded Box at the Stack's first
  slot in BOTH branches (`pt: 3` = ripple headroom vs. the 20px overshoot; padding because
  of root cause 1; identical type/position so the indicator's DOM node survives the flip —
  a remount would kill the ring-close continuity). Success text/actions enter via
  `SuccessReveal` (delayed fade/rise, 150ms/280ms) so the badge leads.
- `/dev-relay-loaders`: new "Dialog transition rehearsal" section — the real indicator +
  real Dialog building blocks at real dialog size (the variant cards' fixed-height mocks
  can't show size changes), with toggles for height animation, forced reduced motion, and
  loadingInfo presence (a single/double-ripple A/B toggle existed until the single ripple
  was chosen).

## Gotchas worth remembering
- **Transformed descendants extend ancestor scroll containers' scrollable overflow.** The
  MUI Dialog paper is `overflow-y: auto` by default, so the success entrance's
  `translateY` (last child of the paper, poking past its bottom edge mid-animation)
  flashed a paper scrollbar; with classic scrollbars that narrows the content, rewraps
  text, and shakes the auto-height paper. Fixed with `overflow: hidden` on the paper —
  it never scrolls itself (DialogContent does). Relatedly, `AnimatedHeight` must pin the
  inner content's `flex-shrink` to 0 while gliding: otherwise growing flex-squeezes
  DialogContent below its content height and IT flashes a scrollbar. The lab initially
  hid both artifacts because a plain Paper is `overflow: visible` (not a scroll
  container) — the rehearsal Paper now uses `overflow: hidden` for parity.
- Emotion resolves `keyframes` objects only when interpolated into **object-style**
  `animation`/`animationName` values (or tagged css templates). Interpolating one into a
  plain template string returned from a styled callback stringifies to an `_EMO_…`
  sentinel that leaks into production CSS (`processStyleValue` in `@emotion/serialize`
  only unwraps it for those two keys).
- Literal `@keyframes foo` names inside styled template strings are emitted globally —
  the `tx*`/`bsp*` prefixes in the indicator/lab are the collision-avoidance convention.
- React reconciliation across the dialog's return branches: keep
  `Fragment > [Title, Content, actions?] > Stack > [PaddedBox > Indicator, …]` with
  wrappers added symmetrically at slot 0; branch-only elements go at later slots.
- Cypress (`broadcasted-icon`, `ok-button`, …) auto-retries visibility/clicks, so
  sub-second opacity entrances are safe; never use `visibility: hidden` for them.

## Retrospective
The "success has no animation" report was almost misdiagnosed as a reduced-motion issue;
the real culprits were clipping + everything moving at once. The dead-margin discovery
(root cause 1) invalidated an earlier one-line "add whitespace" fix on this branch that
had silently done nothing — worth checking computed styles before trusting `sx` spacing
inside Stacks.
