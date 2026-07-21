import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { NextPage } from "next";
import { ReactNode, useState } from "react";
import TooltipWithIcon from "../features/common/TooltipWithIcon";

/**
 * Design scratchpad for the Send Stream form. Not linked from anywhere in the
 * app — reachable only at /ui-lab. Everything below is a non-functional mock:
 * it deliberately does NOT import SendStream, so trying a treatment here never
 * risks the real transaction path. Once a variant is chosen it gets promoted
 * into the real components and this page can be deleted.
 */

// # Mock data — mirrors the screenshot under discussion.

const MOCK = {
  tokenSymbol: "BUILDx",
  receiverAlias: "DEGENx/ETHx TOREX",
  receiver: "0x68E5E539374353445b03Ec87D2Abfe2C791dEebc",
  receiverShort: "0x68E5…dEebc",
  flowRateText: "100 BUILDx/month",
  endDateText: "Dec 20, 2026",
  buffer: "0.5479 BUILDx",
  balance: "2,894,977",
  balanceAfterBuffer: "2,894,976 BUILDx",
  feeText: "0.3 USDCx",
  feeUpTo: "0.5 USDCx",
  usdcxBalance: "2.39",
  usdcBalance: "14.02",
};

type VariantKey = "ledger" | "sentence" | "footer";
/**
 * - "above"   — label stacked over the control.
 * - "float"   — MUI's default: label rests inside the empty field and animates
 *               up into the notch on focus/fill. The pattern NN/g and GOV.UK
 *               argue against, because the resting label reads as a value.
 * - "notched" — label permanently in the notch (`InputLabelProps.shrink`), with
 *               a placeholder underneath. Same look as "float" once a field has
 *               content, but it never animates and never sits where a value
 *               would, so the usability critique of floating labels doesn't
 *               apply. It's a static label that happens to live on the border.
 *
 * "notched" also makes the button-picker emulation honest: a hand-positioned
 * label on the border IS the whole pattern when nothing moves, so the receiver
 * and token controls match the real inputs exactly rather than approximating
 * them — which is not true in "float" mode, where they can't animate.
 */
type LabelMode = "above" | "float" | "notched";

/** What Field hands a native MUI input so it renders in the current mode. */
type MuiFieldProps = {
  label?: ReactNode;
  InputLabelProps?: { shrink: boolean };
};
type LabelStyleKey = keyof typeof LABEL_STYLES;

/**
 * Weight/colour treatments for above-field labels.
 *
 * The theme's text.secondary is #12141E at 60% — a near-black, not a grey — so
 * a 14px/500 label in it carries nearly as much weight as the value beneath.
 * "Faint" and "Caps" both back off; Caps does it by shrinking rather than
 * lightening, which keeps contrast up (a real concern once labels are the only
 * thing naming a field).
 */
const LABEL_STYLES = {
  medium: {
    name: "Medium",
    note: "14/500 — current",
    sx: { fontSize: 14, fontWeight: 500, letterSpacing: "0.17px" },
  },
  quiet: {
    name: "Quiet",
    note: "13/400 — lighter weight",
    sx: { fontSize: 13, fontWeight: 400 },
  },
  small: {
    name: "Small",
    note: "12/500 — recedes by size, keeps weight",
    sx: { fontSize: 12, fontWeight: 500, letterSpacing: "0.1px" },
  },
  caps: {
    name: "Caps",
    note: "11/600 uppercase, tracked",
    sx: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
    },
  },
};

/**
 * Where an above-field label's left edge sits.
 *
 * "flush" aligns it to the control's border box (x=0) — a clean outer edge,
 * and what the branch does. "text" indents it by the input's own padding so
 * the label lines up with the VALUE it names rather than with the box around
 * it. The 14px offset matches OutlinedInput's default padding-left; button
 * controls inset their content slightly differently, so the two won't agree
 * perfectly — worth checking the receiver and token rows specifically.
 */
type LabelAlign = "flush" | "text";

/**
 * Vertical gap between a label and its control, in px.
 *
 * This is proximity grouping: the gap WITHIN a field must read as clearly
 * smaller than the gap BETWEEN fields, or labels start looking equidistant
 * from the control above and the one below. Top-level blocks sit 20–36px
 * apart depending on the Whitespace knob, so anything at or below ~6px keeps
 * the ratio unambiguous.
 *
 * Tightening matters more once labels are indented to the value: at that point
 * the label reads as part of the field rather than a thing floating above it,
 * and the spacing should say so.
 */
const LABEL_GAPS = [8, 6, 4, 2];

/**
 * The width the send card actually ships at — `maxWidth: "600px"` on the Card
 * in SendPageLayout.tsx. Keep these in sync: the single-variant view exists to
 * judge spacing and alignment, and both are width-dependent.
 */
const SINGLE_CARD_MAX_WIDTH = 600;

/**
 * Applies the label style/colour knobs to notch-mode fields.
 *
 * Two things have to move together. MUI's shrunk label is the real text, sized
 * by `scale(0.75)`; the gap it sits in is cut by a `<legend>` that re-renders
 * the same label at `font-size: 0.75em`. Restyle only the label and the cut
 * stays the old width — text overhangs the border or floats in a gap.
 *
 * So: drop the scale and set an explicit size on the label, then give the
 * legend the identical metrics (size, weight, tracking, transform — all of
 * which affect measured width) so the cut matches what's drawn in it.
 *
 * Applied to a common ancestor rather than per-field, so it can't be clobbered
 * by an individual TextField's own `sx`.
 */
function notchedLabelSx(style: LabelStyleKey, color: LabelColorKey) {
  const font = LABEL_STYLES[style].sx;
  return {
    "& .MuiInputLabel-root": {
      ...font,
      color: LABEL_COLORS[color].value,
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(1)",
      // Mask the border rather than cut it — see the legend rule below.
      backgroundColor: "var(--lab-card-surface, #FFFFFF)",
      paddingLeft: "4px",
      paddingRight: "4px",
    },
    // Collapse MUI's cut. A real TextField interrupts its own border with a
    // <legend>, while the button pickers can only mask theirs with a painted
    // rectangle — two mechanisms that look identical on a white card and
    // diverge the moment the input and the card stop being the same colour
    // (e.g. a filled input). Masking is the one both control types can do, so
    // both use it and they cannot drift apart.
    "& .MuiOutlinedInput-notchedOutline legend": { maxWidth: 0 },
  };
}

type LabelColorKey = keyof typeof LABEL_COLORS;

/**
 * Label colour, independent of size/weight — the two are separate levers and
 * pairing them into presets hides the combination that actually works.
 *
 * All values are the theme's own ink (#12141E) at varying alpha rather than
 * arbitrary greys, so they stay consistent with text.primary/secondary and
 * shift correctly if the ink ever changes. Alphas below ~45% start failing
 * WCAG AA (4.5:1) on white at small sizes — "Ghost" is included to see the
 * bottom of the range, not as a serious candidate.
 */
const LABEL_COLORS = {
  secondary: { name: "Secondary", note: "60% — theme text.secondary", value: "text.secondary" },
  muted: { name: "Muted", note: "52% — a step lighter", value: "#12141E85" },
  grey: { name: "Grey", note: "45% — reads as grey, near the AA floor", value: "#12141E73" },
  ghost: { name: "Ghost", note: "38% — below AA, reference only", value: "#12141E61" },
  primary: { name: "Ink", note: "87% — theme text.primary", value: "text.primary" },
};
type WarningStyle = "tint" | "outlined" | "plain";
type SpacingKey = keyof typeof SPACINGS;
type GaslessState = keyof typeof GASLESS_STATES;
/** Where the switch sits on the Stream Scheduling row. See SchedulingRow. */
type ToggleLayout = "left" | "right";

/**
 * How the Stream Scheduling region is marked off.
 *
 * Once the tinted card went away, something had to take over its job of saying
 * "required inputs end here, optional capability starts". A rule above the row
 * did that — but it's unpaired, so when the section is COLLAPSED it groups the
 * toggle with everything below it rather than enclosing it; and it's a one-off,
 * since gasless does the same semantic job with a border instead.
 *
 * - "none"      — spacing alone (already 3–4× the within-field gap)
 * - "above"     — the single rule, as originally added
 * - "bracket"   — rules above and below, so the region encloses in both states
 * - "container" — a bordered box matching gasless, one mechanism for both
 *                 optional toggles. Costs alignment: the box's padding insets
 *                 the date fields from the inputs above them.
 */
type SchedulingFrame = "none" | "above" | "bracket" | "container";

/**
 * Shape of the action buttons — the CTA and the inline approve.
 *
 * The theme currently runs one system: 8px on inputs and buttons alike, a step
 * tighter than the 12px cards they sit in (see `shape` in theme.ts). "pill"
 * breaks buttons out of that system deliberately, so radius encodes what a
 * control IS: square-ish things you type into, round things you press. The fee
 * chips are already pills, so there's precedent for round = act/select.
 *
 * Applied only to action buttons — the receiver and token pickers are Buttons
 * too, but they behave as inputs and must keep matching the fields around them.
 */
type ButtonShape = "default" | "pill";

const actionShapeSx = (shape: ButtonShape) =>
  shape === "pill" ? { borderRadius: "999px" } : undefined;

/**
 * Whether an enabled optional-capability container takes the primary accent on
 * its border, or stays neutral and lets the switch and icon carry the state.
 *
 * Applies to BOTH the scheduling container and the gasless strip — they're the
 * same kind of control, so this has to be one decision rather than two.
 *
 * The warning border on gasless `required` is deliberately NOT covered: that
 * one isn't decorating an active state, it's flagging a blocked submit, and it
 * has to keep pulling attention whichever way this knob is set.
 */
type ActiveAccent = "primary" | "neutral";

const accentBorder = (
  theme: Theme,
  accent: ActiveAccent,
  active: boolean
) =>
  active && accent === "primary"
    ? theme.palette.primary.main
    : theme.palette.other.outline;

/**
 * Whether input controls sit on the card's surface or in a recessed well.
 *
 * "outlined" is today's: fields are defined purely by a 1px border. "filled"
 * adds a faint recess so a field reads as something you put a value INTO, not
 * just an outlined region — the affordance survives even when the border is
 * low-contrast, which matters in dark mode where hairlines disappear first.
 * "fillOnly" drops the border and lets the fill do all the work.
 *
 * Covers the receiver and token pickers too. They're Buttons, but they're
 * styled as inputs and must not diverge from the fields beside them.
 *
 * Note the interaction with notched labels: the notch cut has to stay the CARD
 * colour, not the fill, because the label sits ON the border between the two.
 */
type InputSurface = "outlined" | "filled" | "fillOnly" | "raised";

/**
 * The card's own surface, as a solid colour.
 *
 * Exposed as a CSS variable so the emulated notch label can mask the border
 * with whatever the card actually is, without threading surface state through
 * every Field. In dark mode this is background.paper (#151619) already blended
 * with the elevation-1 overlay (3% white) rather than the raw token, because
 * the label needs one solid colour, not a colour plus a gradient.
 */
const cardSurface = (theme: Theme, surface: InputSurface) => {
  if (theme.palette.mode === "dark") {
    return surface === "raised" ? "#151619" : "#1C1D20";
  }
  return surface === "raised" ? "#F7F8FA" : "#FFFFFF";
};

type InputFillKey = keyof typeof INPUT_FILLS;

/**
 * How strong the input recess is, independent of whether it keeps a border.
 *
 * Light-mode values are the theme's own ink (#12141E) at low alpha so they
 * stay consistent if the ink changes — except "brand", which is the updated
 * palette's Light Grey. That one isn't a guess: brand-design.md lists #F7F8FA
 * as the foundation grey used for "text, form fields, backgrounds, dividers",
 * so it is the designated form-field surface.
 *
 * Dark mode inverts — a recess there is a light overlay, not a dark one, since
 * the canvas is already near-black. Note these sit on top of the card's own 3%
 * elevation overlay, so the effective step is the difference between them.
 */
const INPUT_FILLS = {
  soft: { name: "Soft", note: "2% ink / 3% white", light: "rgba(18, 20, 30, 0.02)", dark: "rgba(255, 255, 255, 0.03)" },
  brand: { name: "Brand grey", note: "#F7F8FA — palette's form-field grey", light: "#F7F8FA", dark: "rgba(255, 255, 255, 0.05)" },
  medium: { name: "Medium", note: "4% ink / 6% white", light: "rgba(18, 20, 30, 0.04)", dark: "rgba(255, 255, 255, 0.06)" },
  strong: { name: "Strong", note: "7% ink / 9% white", light: "rgba(18, 20, 30, 0.07)", dark: "rgba(255, 255, 255, 0.09)" },
  // Neutral grey IS the conventional disabled fill, so a grey-filled enabled
  // input reads as switched off. Tinting toward the theme's blue-grey
  // (#8292AD, already the action/info hue) keeps the recess while stepping
  // off the disabled convention — a tinted well reads as a field, a grey one
  // reads as inert.
  tint: { name: "Cool tint", note: "#8292AD wash — avoids the disabled look", light: "rgba(130, 146, 173, 0.10)", dark: "rgba(130, 146, 173, 0.16)" },
};

const inputSurfaceSx =
  (surface: InputSurface, fillKey: InputFillKey) => (theme: Theme) => {
  const dark = theme.palette.mode === "dark";

  // Inverted: the CARD carries the tint and the inputs sit on top of it. White
  // never reads as disabled, and it leaves grey free to actually mean disabled
  // — which the recessed version spends on enabled fields.
  if (surface === "raised") {
    return {
      backgroundColor: cardSurface(theme, "raised"),
      backgroundImage: "none",
      "& .MuiOutlinedInput-root, & [class*='MuiButton-input']": {
        backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "#FFFFFF",
      },
    };
  }

  if (surface === "outlined") return {};
  const entry = INPUT_FILLS[fillKey];
  const fill = dark ? entry.dark : entry.light;
  return {
    "& .MuiOutlinedInput-root, & [class*='MuiButton-input']": {
      backgroundColor: fill,
      ...(surface === "fillOnly"
        ? { "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" } }
        : {}),
    },
    ...(surface === "fillOnly"
      ? { "& [class*='MuiButton-input']": { borderColor: "transparent" } }
      : {}),
  };
};

type CtaColorKey = keyof typeof CTA_COLORS;

/**
 * Candidate surfaces for the primary CTA, with measured WCAG contrast against
 * their own label colour.
 *
 * `#10BB35` is the app's current primary. It sits in the mid-luminance dead
 * zone where NEITHER white nor black text is legible — 2.6:1 with white, which
 * fails even the 3:1 UI-component floor. That, rather than taste, is why it
 * has never worked as a button colour.
 *
 * The updated brand palette (see the superfluid skill's brand-design.md) ships
 * two greens at opposite ends instead, so each has a text colour that works:
 * Rich Green for white-label surfaces, Primary Green for black-label ones.
 *
 * Blue and near-black free green entirely for semantics (streaming, positive,
 * success), which no green CTA can do — but note the brand guide designates
 * blue a sparing accent, so blue-as-primary contradicts it.
 */
const CTA_COLORS = {
  current: {
    name: "Green (current)",
    note: "#10BB35 · white · 2.6:1 — fails AA",
    bg: "#10BB35",
    fg: "#FFFFFF",
    hover: "#0B8225",
  },
  rich: {
    name: "Rich Green",
    note: "#0A6643 · white · 7.0:1 — new palette",
    bg: "#0A6643",
    fg: "#FFFFFF",
    hover: "#084F34",
  },
  lime: {
    name: "Lime + black",
    note: "#86EE1E · black · 13.5:1 — new palette, as used today",
    bg: "#86EE1E",
    fg: "#080909",
    hover: "#77D51B",
  },
  blue: {
    name: "Blue",
    note: "#2323FF · white · 7.6:1 — brand accent, not a designated primary",
    bg: "#2323FF",
    fg: "#FFFFFF",
    hover: "#1A1ACC",
  },
  // Not an invented colour: a step along the brand's own Tertiary Blue →
  // Dark Blue (#0A0A47) ramp, ~25% of the way. Same hue family, less chroma
  // pressure at full-CTA width, and contrast improves rather than degrades.
  blueDeep: {
    name: "Blue (deep)",
    note: "#1C1CD1 · white · 9.8:1 — same ramp, calmer at large area",
    bg: "#1C1CD1",
    fg: "#FFFFFF",
    hover: "#15159E",
  },
  // The brand's Light Blue. Like the lime, it's a high-luminance surface, so
  // it takes dark text — the pale/dark-label pairing rather than the
  // saturated/white-label one. Softest option in the set by a wide margin.
  bluePale: {
    name: "Blue (pale)",
    note: "#9EAEFF · black · 9.5:1 — brand Light Blue, dark label",
    bg: "#9EAEFF",
    fg: "#080909",
    hover: "#8B9DFF",
  },
  // The palest blue that can still carry WHITE text. White at 4.5:1 caps the
  // surface at relative luminance 0.183; this sits at 0.158 (5.05:1). Anything
  // genuinely pale is far above that ceiling — Light Blue is 0.448 — so "pale
  // AND white text" is not a colour that exists, only a lighter blue that is
  // still fundamentally mid-tone.
  blueMuted: {
    name: "Blue (muted)",
    note: "#5566CC · white · 5.05:1 — as pale as white text allows",
    bg: "#5566CC",
    fg: "#FFFFFF",
    hover: "#4757B8",
  },
  black: {
    name: "Near-black",
    note: "#080909 · white · 19.9:1 — inverts in dark mode",
    bg: "#080909",
    fg: "#FFFFFF",
    hover: "#2A2C2E",
    // A near-black button on the #151619 dark-theme canvas is nearly
    // invisible — 1.2:1 against its own background. The neutral CTA has to
    // invert with the theme, which is exactly how Vercel/Linear handle it.
    dark: { bg: "#F7F8FA", fg: "#080909", hover: "#E9E9E9" },
  },
};

/**
 * Shape + surface for the primary CTA. Theme-aware: an entry may carry a
 * `dark` override for palettes that cannot survive both canvases with one hex.
 */
const ctaSx = (shape: ButtonShape, color: CtaColorKey) => (theme: Theme) => {
  const entry = CTA_COLORS[color];
  const c =
    theme.palette.mode === "dark" && "dark" in entry && entry.dark
      ? entry.dark
      : entry;
  return {
    ...actionShapeSx(shape),
    backgroundColor: c.bg,
    color: c.fg,
    "&:hover": { backgroundColor: c.hover },
  };
};

/**
 * How the flow-rate period is attached to the amount.
 *
 * "split" is what the branch does: two sibling controls in a grid, seams
 * joined by a negative margin and half-rounded corners. It only holds together
 * while both controls are exactly the same height — which they stop being
 * under MUI notched labels, because the amount field gets a label (and its
 * notch geometry) while the bare period Select does not, so the two no longer
 * agree on the row height and the Select stretches past it.
 *
 * "inside" sidesteps the whole class of problem: ONE outlined field, with the
 * period as a borderless Select in its end adornment. One outline, one label,
 * one height — nothing left to keep in sync.
 */
type UnitLayout = "split" | "inside";

/** Where the token balance goes. See BalanceLine. */
type BalanceLayout = "under" | "helper" | "inField";

/**
 * How the token picker and the rate relate.
 *
 * "tokenFirst" is the branch's order. "rateFirst" swaps the columns, which
 * puts the token picker directly above the right-aligned balance helper — the
 * figure then sits under the control it describes instead of across the row
 * from it — and matches the amount-left / token-right convention most crypto
 * send forms use.
 *
 * "fused" is where that reasoning ends up if followed all the way: amount,
 * token and period are one phrase ("100 BUILDx / month"), so they become one
 * field with the token and period as adornments. Collapses the two-column row
 * into a single labelled control.
 */
type RowOrder = "tokenFirst" | "rateFirst" | "fused";

/**
 * Every state the real ClearMacroRelayOption can land in, so each can be
 * eyeballed rather than reasoned about. Mirrors the branches in
 * ClearMacroRelayOption.tsx — if one is added there, add it here too.
 */
const GASLESS_STATES = {
  off: { name: "Off", note: "Toggle off — no fee, no selector" },
  on: { name: "On", note: "Exact quote, paying from USDCx" },
  quoting: {
    name: "Quoting",
    note: "scheduleFlow before the quote lands — worst-case 'up to' fee",
  },
  usdc: { name: "Pay w/ USDC", note: "Permit2 path, allowance already granted" },
  approval: {
    name: "Needs approval",
    note: "Permit2 path, one-time USDC approval still required",
  },
  shortUsdcx: { name: "Low USDCx", note: "Selected token can't cover the fee" },
  shortUsdc: { name: "Low USDC", note: "Permit2 path, underlying can't cover" },
  required: {
    name: "Required, off",
    note: "Scheduling forces the relay — warning accent, submit blocked",
  },
  unavailable: {
    name: "Unavailable",
    note: "Confirmed smart-contract wallet — muted explanatory strip",
  },
};

/**
 * Card breathing room. `edge` is the main card's padding — the dominant lever
 * for how airy the form reads — and `section` is the gap between the form's
 * top-level blocks, scaled with it so the two don't drift out of proportion.
 */
const SPACINGS = {
  compact: { name: "Compact", edge: 24, section: 2.5 },
  default: { name: "Default", edge: 32, section: 3 },
  roomy: { name: "Roomy", edge: 40, section: 3.5 },
  airy: { name: "Airy", edge: 56, section: 4.5 },
};

const VARIANTS: Record<VariantKey, { name: string; blurb: string }> = {
  ledger: {
    name: "A · Quiet ledger",
    blurb:
      "Summary line, then only the figures you can't derive from the form. Risk block closes it out.",
  },
  sentence: {
    name: "B · Summary sentence",
    blurb:
      "No table. Plain-language sentences carry the action and the balance; the risk block carries the buffer.",
  },
  footer: {
    name: "C · Attached footer",
    blurb:
      "One bordered block, four stacked sections: summary → figures → risk → gasless, then the button.",
  },
};

// # Page

const UiLab: NextPage = () => {
  const [scheduling, setScheduling] = useState(true);
  const [gasless, setGasless] = useState<GaslessState>("on");
  const [liquidationSoon, setLiquidationSoon] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);
  const [variant, setVariant] = useState<VariantKey>("footer");
  const [labelMode, setLabelMode] = useState<LabelMode>("notched");
  const [labelStyle, setLabelStyle] = useState<LabelStyleKey>("medium");
  const [labelAlign, setLabelAlign] = useState<LabelAlign>("flush");
  const [labelGap, setLabelGap] = useState<number>(6);
  const [labelColor, setLabelColor] = useState<LabelColorKey>("secondary");
  const [warningStyle, setWarningStyle] = useState<WarningStyle>("tint");
  const [spacing, setSpacing] = useState<SpacingKey>("default");
  const [toggleLayout, setToggleLayout] = useState<ToggleLayout>("right");
  const [schedulingFrame, setSchedulingFrame] = useState<SchedulingFrame>("above");
  const [buttonShape, setButtonShape] = useState<ButtonShape>("pill");
  const [ctaColor, setCtaColor] = useState<CtaColorKey>("current");
  const [activeAccent, setActiveAccent] = useState<ActiveAccent>("neutral");
  const [inputSurface, setInputSurface] = useState<InputSurface>("filled");
  const [inputFill, setInputFill] = useState<InputFillKey>("brand");
  const [unitLayout, setUnitLayout] = useState<UnitLayout>("inside");
  const [balanceLayout, setBalanceLayout] = useState<BalanceLayout>("under");
  const [rowOrder, setRowOrder] = useState<RowOrder>("rateFirst");

  const shared = {
    scheduling,
    gasless,
    liquidationSoon,
    labelMode,
    labelStyle,
    labelAlign,
    labelGap,
    labelColor,
    warningStyle,
    spacing,
    toggleLayout,
    schedulingFrame,
    buttonShape,
    ctaColor,
    activeAccent,
    inputSurface,
    inputFill,
    unitLayout,
    balanceLayout,
    rowOrder,
  };
  const shown: VariantKey[] = sideBySide
    ? (Object.keys(VARIANTS) as VariantKey[])
    : [variant];

  return (
    <Container maxWidth={false} sx={{ my: 4, maxWidth: 1600 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Send Stream — consequences panel &amp; footer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The inputs are identical in all three. Only the region below them
        differs.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ md: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <Knob label="Field labels">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={labelMode}
              onChange={(_e, v) => v != null && setLabelMode(v)}
            >
              <ToggleButton value="above">Above</ToggleButton>
              <ToggleButton value="notched">Notched</ToggleButton>
              <ToggleButton value="float">Floating</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`Whitespace — ${SPACINGS[spacing].edge}px edges`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={spacing}
              onChange={(_e, v) => v != null && setSpacing(v)}
            >
              {(Object.keys(SPACINGS) as SpacingKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {SPACINGS[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`Label style — ${LABEL_STYLES[labelStyle].note}`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={labelStyle}
              onChange={(_e, v) => v != null && setLabelStyle(v)}
            >
              {(Object.keys(LABEL_STYLES) as LabelStyleKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {LABEL_STYLES[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`Label colour — ${LABEL_COLORS[labelColor].note}`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={labelColor}
              onChange={(_e, v) => v != null && setLabelColor(v)}
            >
              {(Object.keys(LABEL_COLORS) as LabelColorKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {LABEL_COLORS[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`Label gap — ${labelGap}px`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={labelGap}
              onChange={(_e, v) => v != null && setLabelGap(v)}
            >
              {LABEL_GAPS.map((g) => (
                <ToggleButton key={g} value={g}>
                  {g}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Label alignment">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={labelAlign}
              onChange={(_e, v) => v != null && setLabelAlign(v)}
            >
              <ToggleButton value="flush">Flush (box)</ToggleButton>
              <ToggleButton value="text">Indented (value)</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Flow rate period">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={unitLayout}
              onChange={(_e, v) => v != null && setUnitLayout(v)}
            >
              <ToggleButton value="inside">In field</ToggleButton>
              <ToggleButton value="split">Split</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Token / rate order">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={rowOrder}
              onChange={(_e, v) => v != null && setRowOrder(v)}
            >
              <ToggleButton value="tokenFirst">Token left</ToggleButton>
              <ToggleButton value="rateFirst">Token right</ToggleButton>
              <ToggleButton value="fused">Fused</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Balance">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={balanceLayout}
              onChange={(_e, v) => v != null && setBalanceLayout(v)}
            >
              <ToggleButton value="under">Under token</ToggleButton>
              <ToggleButton value="helper">Helper row</ToggleButton>
              <ToggleButton value="inField">In field</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`CTA colour — ${CTA_COLORS[ctaColor].note}`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={ctaColor}
              onChange={(_e, v) => v != null && setCtaColor(v)}
            >
              {(Object.keys(CTA_COLORS) as CtaColorKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {CTA_COLORS[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label={`Input fill — ${INPUT_FILLS[inputFill].note}`}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={inputFill}
              onChange={(_e, v) => v != null && setInputFill(v)}
            >
              {(Object.keys(INPUT_FILLS) as InputFillKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {INPUT_FILLS[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Input surface">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={inputSurface}
              onChange={(_e, v) => v != null && setInputSurface(v)}
            >
              <ToggleButton value="outlined">Outlined</ToggleButton>
              <ToggleButton value="filled">Filled</ToggleButton>
              <ToggleButton value="fillOnly">Fill only</ToggleButton>
              <ToggleButton value="raised">Raised</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Active accent (both containers)">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={activeAccent}
              onChange={(_e, v) => v != null && setActiveAccent(v)}
            >
              <ToggleButton value="primary">Primary border</ToggleButton>
              <ToggleButton value="neutral">Neutral</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Action buttons">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={buttonShape}
              onChange={(_e, v) => v != null && setButtonShape(v)}
            >
              <ToggleButton value="default">8px</ToggleButton>
              <ToggleButton value="pill">Pill</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Scheduling frame">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={schedulingFrame}
              onChange={(_e, v) => v != null && setSchedulingFrame(v)}
            >
              <ToggleButton value="none">None</ToggleButton>
              <ToggleButton value="above">Rule above</ToggleButton>
              <ToggleButton value="bracket">Bracketed</ToggleButton>
              <ToggleButton value="container">Container</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Scheduling switch">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={toggleLayout}
              onChange={(_e, v) => v != null && setToggleLayout(v)}
            >
              <ToggleButton value="left">Left</ToggleButton>
              <ToggleButton value="right">Right (as gasless)</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Knob label="Risk block">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={warningStyle}
              onChange={(_e, v) => v != null && setWarningStyle(v)}
            >
              <ToggleButton value="tint">Tint</ToggleButton>
              <ToggleButton value="outlined">Outlined</ToggleButton>
              <ToggleButton value="plain">Plain</ToggleButton>
            </ToggleButtonGroup>
          </Knob>

          <Divider
            flexItem
            orientation="vertical"
            sx={{ display: { xs: "none", md: "block" } }}
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={sideBySide}
                onChange={(_e, v) => setSideBySide(v)}
              />
            }
            label={<Typography variant="body2">Compare all</Typography>}
          />
          {!sideBySide && (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={variant}
              onChange={(_e, v) => v != null && setVariant(v)}
            >
              {(Object.keys(VARIANTS) as VariantKey[]).map((k) => (
                <ToggleButton key={k} value={k}>
                  {VARIANTS[k].name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={scheduling}
                onChange={(_e, v) => setScheduling(v)}
              />
            }
            label={<Typography variant="body2">Scheduling</Typography>}
          />
          <Knob label={`Gasless — ${GASLESS_STATES[gasless].note}`}>
            <Select
              size="small"
              value={gasless}
              onChange={(e) => setGasless(e.target.value as GaslessState)}
              sx={{ minWidth: 180 }}
            >
              {(Object.keys(GASLESS_STATES) as GaslessState[]).map((k) => (
                <MenuItem key={k} value={k}>
                  {GASLESS_STATES[k].name}
                </MenuItem>
              ))}
            </Select>
          </Knob>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={liquidationSoon}
                onChange={(_e, v) => setLiquidationSoon(v)}
              />
            }
            label={
              <Typography variant="body2">Liquidation near</Typography>
            }
          />
        </Stack>
      </Paper>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
        alignItems="flex-start"
      >
        {shown.map((key) => (
          <Stack
            key={key}
            spacing={1.5}
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              // Comparing, the columns share the row. Alone, the card must
              // stay at the width it actually ships at — a form stretched to
              // 1600px tests a layout the app never renders, and every
              // spacing judgement made against it would be wrong.
              maxWidth: sideBySide ? "none" : SINGLE_CARD_MAX_WIDTH,
            }}
          >
            <Box>
              <Typography variant="h6">{VARIANTS[key].name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {VARIANTS[key].blurb}
              </Typography>
            </Box>
            <MockSendForm variant={key} {...shared} />
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

export default UiLab;

function Knob(props: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {props.label}
      </Typography>
      {props.children}
    </Box>
  );
}

// # Field labelling
//
// Two modes. "above" is what the branch does today: a FormLabel stacked over
// the control. "mui" is MUI's canonical outlined-input treatment — the label
// sits in a notch cut into the field's top border.
//
// The catch: only TextField/Select support that natively. The receiver and
// token pickers are Buttons (`variant="input"`), so in MUI mode they get a
// hand-positioned label that reproduces the notch geometry. That emulation is
// the main thing to judge — if the two control types don't line up
// convincingly here, they won't in the real form either.

/**
 * Wraps a control with a label, in whichever mode is active.
 *
 * `render` receives the label to hand to a native MUI input (or undefined in
 * "above" mode, where the label is drawn externally instead). Set `notch` for
 * controls that can't take a `label` prop — they get the emulated notch.
 */
function Field(props: {
  label: string;
  tooltip?: string;
  mode: LabelMode;
  notch?: boolean;
  labelStyle: LabelStyleKey;
  labelAlign: LabelAlign;
  labelGap: number;
  labelColor: LabelColorKey;
  render: (muiProps: MuiFieldProps) => ReactNode;
}) {
  if (props.mode === "above") {
    const style = LABEL_STYLES[props.labelStyle];
    return (
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          sx={{
            mb: `${props.labelGap}px`,
            pl: props.labelAlign === "text" ? "14px" : 0,
          }}
        >
          {/* Colour applied after the preset so the two knobs compose. */}
          <FormLabel
            sx={{
              m: 0,
              ...style.sx,
              color: LABEL_COLORS[props.labelColor].value,
            }}
          >
            {props.label}
          </FormLabel>
          {props.tooltip && (
            <TooltipWithIcon
              title={props.tooltip}
              IconProps={{ sx: { fontSize: 16 } }}
            />
          )}
        </Stack>
        {props.render({})}
      </Box>
    );
  }

  // The tooltip rides INSIDE the notch, immediately after the label text —
  // MUI's `label` takes a ReactNode and renders it into the hidden <legend>
  // too, so the notch still measures itself correctly. Parking the icon to the
  // right of the control instead (the obvious first move) lines every ⓘ up at
  // the far edge of the card, detached from the label it explains and at a
  // different offset per row.
  const labelNode = props.tooltip ? (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {props.label}
      <TooltipWithIcon
        title={props.tooltip}
        IconProps={{ sx: { fontSize: 14, display: "block" } }}
      />
    </Box>
  ) : (
    props.label
  );

  const control = props.notch ? (
    <Box sx={{ position: "relative" }}>
      <Typography
        component="label"
        sx={{
          position: "absolute",
          // Matches the real inputs exactly: their shrunk label is translated
          // 14px from the border box with 4px of mask padding, so the text
          // starts at 14px. left:10 + 4px padding lands in the same place.
          top: -8,
          left: 10,
          px: "4px",
          zIndex: 1,
          lineHeight: 1.2,
          // The label paints over the border, so it must match the surface it
          // sits on — the CARD, not bare paper, and the card's colour changes
          // with the input-surface mode. The card publishes its own solid
          // colour as a CSS variable so this stays correct without threading
          // surface state through every Field.
          backgroundColor: "var(--lab-card-surface, #FFFFFF)",
          // Same font metrics the real fields get, so the two control types
          // carry identical labels rather than merely similar ones.
          ...LABEL_STYLES[props.labelStyle].sx,
          color: LABEL_COLORS[props.labelColor].value,
          // The tooltip inside stays clickable; the label text does not need
          // to be, since these controls open a dialog on click anyway.
          pointerEvents: "none",
          "& > *": { pointerEvents: "auto" },
        }}
      >
        {labelNode}
      </Typography>
      {props.render({})}
    </Box>
  ) : (
    props.render({
      label: labelNode,
      // The only difference between the two notch modes: pinning shrink stops
      // the label ever resting inside the field as a pseudo-value.
      ...(props.mode === "notched"
        ? { InputLabelProps: { shrink: true } }
        : {}),
    })
  );

  return <>{control}</>;
}

// # Shared mock pieces

/**
 * The inputs — identical across all three variants. Scheduling is a quiet
 * disclosure rather than a tinted card: with the preview slimmed down the tint
 * is no longer needed to separate it from a competing box, and dropping it
 * frees green to mean "commit action" again.
 */
function InputSection(props: {
  scheduling: boolean;
  labelMode: LabelMode;
  labelStyle: LabelStyleKey;
  labelAlign: LabelAlign;
  labelGap: number;
  labelColor: LabelColorKey;
  toggleLayout: ToggleLayout;
  schedulingFrame: SchedulingFrame;
  activeAccent: ActiveAccent;
  unitLayout: UnitLayout;
  balanceLayout: BalanceLayout;
  rowOrder: RowOrder;
}) {
  const [schedulingOn, setSchedulingOn] = useState(true);
  const open = props.scheduling && schedulingOn;
  const m = props.labelMode;

  const periodSelect = (
    <Select
      value={2628000}
      variant="standard"
      disableUnderline
      sx={{
        color: "text.secondary",
        "& .MuiSelect-select": { py: 0, backgroundColor: "transparent" },
      }}
    >
      <MenuItem value={86400}>/ day</MenuItem>
      <MenuItem value={2628000}>/ month</MenuItem>
    </Select>
  );

  const tokenColumn = (
    <Stack key="token" sx={{ minWidth: 0 }}>
      <Field
        label="Super Token"
        mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
        notch
        render={() => (
          <Button
            variant="input"
            fullWidth
            startIcon={<TokenIconStandIn />}
            endIcon={<ExpandMoreIcon />}
          >
            {props.balanceLayout === "inField" ? (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1,
                }}
              >
                <span>{MOCK.tokenSymbol}</span>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ ml: "auto" }}
                  translate="no"
                >
                  {MOCK.balance}
                </Typography>
              </Box>
            ) : (
              MOCK.tokenSymbol
            )}
          </Button>
        )}
      />
      {props.balanceLayout === "under" && <BalanceLine sx={{ mt: 0.75 }} />}
    </Stack>
  );

  const rateField = (
    <Field
      key="rate"
      label="Flow Rate"
      mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
      render={(p) =>
        props.unitLayout === "inside" ? (
          <TextField
            fullWidth
            {...p}
            defaultValue="100"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{periodSelect}</InputAdornment>
              ),
            }}
          />
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "6fr 4fr" }}>
            <TextField
              {...p}
              defaultValue="100"
              sx={{
                ".MuiOutlinedInput-notchedOutline": {
                  borderRadius: "8px 0 0 8px",
                  borderRight: 0,
                },
              }}
            />
            <Select
              value={2628000}
              sx={{
                marginLeft: "-1px",
                ".MuiOutlinedInput-notchedOutline": {
                  borderRadius: "0 8px 8px 0",
                },
              }}
            >
              <MenuItem value={86400}>/ day</MenuItem>
              <MenuItem value={2628000}>/ month</MenuItem>
            </Select>
          </Box>
        )
      }
    />
  );

  // Amount, token and period as one phrase in one field. The token picker is
  // still a dialog-opening Button — it just lives in the adornment now.
  const fusedField = (
    <Field
      key="fused"
      label="Flow Rate"
      mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
      render={(p) => (
        <TextField
          fullWidth
          {...p}
          defaultValue="100"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  divider={
                    <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
                  }
                >
                  {/* The real TokenDialogButton carries a 24px TokenIcon, so
                      the adornment has to swallow icon + symbol + chevron
                      before the period selector even starts. This is the
                      fused layout's actual weight, not a text-only version. */}
                  <Button
                    size="small"
                    startIcon={<TokenIconStandIn />}
                    endIcon={<ExpandMoreIcon />}
                    sx={{ minWidth: 0, color: "text.primary", fontWeight: 500 }}
                  >
                    {MOCK.tokenSymbol}
                  </Button>
                  {periodSelect}
                </Stack>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );

  // Notch modes carry no label row above the control, so each field is ~20px
  // shorter — the between-field gap tightens to match, otherwise the
  // compactness the notch buys gets spent back as dead space.
  return (
    <Stack
      spacing={m === "above" ? 3 : 2.5}
      sx={
        m === "above"
          ? undefined
          : notchedLabelSx(props.labelStyle, props.labelColor)
      }
    >
      <Field
        label="Receiver"
        tooltip="Must not be an exchange address"
        mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
        notch
        render={() => (
          <Button
            variant="input"
            fullWidth
            startIcon={<SearchIcon />}
            endIcon={<KeyboardArrowDownIcon />}
          >
            {MOCK.receiverAlias}
          </Button>
        )}
      />

      <Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm:
                props.rowOrder === "fused"
                  ? "1fr"
                  : props.rowOrder === "rateFirst"
                    ? "2fr 1fr"
                    : "1fr 2fr",
            },
            gap: 2.5,
            // The split control's two halves must agree on height, so stop the
            // grid from stretching either to the row.
            alignItems: "start",
          }}
        >
          {/* Emitted in visual order rather than reordered with CSS `order`,
              so keyboard tab order stays in sync with what's on screen. */}
          {props.rowOrder === "fused"
            ? [fusedField]
            : props.rowOrder === "rateFirst"
              ? [rateField, tokenColumn]
              : [tokenColumn, rateField]}
        </Box>

        {/* Spans both columns and sits hard right — under the token picker
            once the columns are swapped, which is what it describes. */}
        {props.balanceLayout === "helper" && (
          <BalanceLine sx={{ mt: 1, justifyContent: "flex-end" }} withSymbol />
        )}
      </Box>

      <Box
        {...(props.schedulingFrame === "container"
          ? { component: Paper, variant: "outlined" as const }
          : {})}
        sx={(theme) => ({
          ...(props.schedulingFrame === "container"
            ? {
                px: 2,
                py: 1.5,
                borderRadius: "12px",
                borderColor: accentBorder(theme, props.activeAccent, open),
                transition: theme.transitions.create("border-color"),
              }
            : {}),
        })}
      >
        {(props.schedulingFrame === "above" ||
          props.schedulingFrame === "bracket") && <Divider sx={{ mb: 2 }} />}
        {/* "right" mirrors the gasless row: icon leads at the content's left
            edge, switch lands at the far right, so the two optional-capability
            toggles read as the same kind of control. */}
        <Stack direction="row" alignItems="center" gap={1}>
          {props.toggleLayout === "left" && (
            <Switch
              size="small"
              checked={open}
              onChange={(_e, v) => setSchedulingOn(v)}
              disabled={!props.scheduling}
            />
          )}
          <TimerOutlined
            sx={{
              fontSize: 18,
              color: open ? "primary.main" : "text.secondary",
            }}
          />
          <Typography variant="body2">Stream Scheduling</Typography>
          {/* Sits against the label, matching the field tooltips in the notch.
              Pushed to the far right it lines up with the switch instead, and
              reads as a second control rather than a note on the label. */}
          <TooltipWithIcon
            title="Schedule start and end dates for future or fixed-duration streams"
            IconProps={{ sx: { fontSize: 16, display: "block" } }}
          />
          <Box sx={{ flex: 1 }} />
          {props.toggleLayout === "right" && (
            <Switch
              size="small"
              checked={open}
              onChange={(_e, v) => setSchedulingOn(v)}
              disabled={!props.scheduling}
              sx={{ mr: "-6px" }}
            />
          )}
        </Stack>
        <Collapse in={open} mountOnEnter unmountOnExit>
          <Stack gap={2.5} sx={{ pt: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Field
                label="Start Date"
                mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
                render={(p) => (
                  <TextField
                    fullWidth
                    {...p}
                    placeholder="MM/DD/YYYY hh:mm"
                  />
                )}
              />
              <Field
                label="End Date"
                mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
                render={(p) => (
                  <TextField
                    fullWidth
                    {...p}
                    defaultValue="12/20/2026 12:56"
                  />
                )}
              />
            </Box>
            <Field
              label="Total Stream"
              tooltip="The approximate amount that will be streamed until the scheduler cancels the stream."
              mode={m}
      labelStyle={props.labelStyle}
      labelAlign={props.labelAlign}
      labelGap={props.labelGap}
      labelColor={props.labelColor}
              render={(p) => (
                <TextField fullWidth {...p} defaultValue="≈ 500" />
              )}
            />
          </Stack>
        </Collapse>
        {/* Closes the region so the block reads as enclosed whether or not
            it's expanded — the unpaired rule only groups correctly when open. */}
        {props.schedulingFrame === "bracket" && <Divider sx={{ mt: 2 }} />}
      </Box>
    </Stack>
  );
}

/**
 * Stands in for the real TokenIcon (24px) so the token picker's footprint in
 * the mock matches what it actually costs — this matters most in the "fused"
 * layout, where the icon competes for adornment space.
 */
function TokenIconStandIn() {
  return (
    <Box
      sx={(theme) => ({
        width: 24,
        height: 24,
        borderRadius: "50%",
        flexShrink: 0,
        border: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      })}
    />
  );
}

/**
 * Balance + the wrap shortcut. Kept as one component so every placement gets
 * the same content and the "+" never drifts away from the figure it belongs to.
 */
function BalanceLine(props: { sx?: SxProps<Theme>; withSymbol?: boolean }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={[{ minWidth: 0 }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    >
      <Typography variant="body2" color="text.secondary" noWrap translate="no">
        Balance: {MOCK.balance}
        {props.withSymbol ? ` ${MOCK.tokenSymbol}` : ""}
      </Typography>
      <Tooltip title="Wrap more">
        <IconButton
          size="small"
          sx={{
            p: 0,
            backgroundColor: "transparent",
            "&:hover": { color: "primary.main", backgroundColor: "transparent" },
          }}
        >
          <AddCircleOutline sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/**
 * The gasless option, moved ABOVE the button — it can gate the submit, so it
 * must be read first. Standalone it keeps a border; `attached` variants sit
 * inside a bordered block already and take padding only.
 */
function GaslessLine(props: {
  state: GaslessState;
  attached?: boolean;
  buttonShape: ButtonShape;
  ctaColor: CtaColorKey;
  activeAccent: ActiveAccent;
}) {
  const s = props.state;
  const enabled = !["off", "required", "unavailable"].includes(s);
  const usdcSelected = ["usdc", "approval", "shortUsdc"].includes(s);
  const feeText = s === "quoting" ? `up to ${MOCK.feeUpTo}` : MOCK.feeText;

  // The icon column is 18px + an 8px gap in every other section of the footer,
  // so the bolt leads here too and the switch moves to the far right. Leading
  // with the switch put the label at a different indent from every neighbouring
  // section, which is what read as misalignment.
  const indent = "26px";

  if (s === "unavailable") {
    return (
      <Stack
        {...(props.attached ? {} : { component: Paper, variant: "outlined" })}
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ px: 2, py: 1.5, ...(props.attached ? {} : { borderRadius: "12px" }) }}
      >
        <BoltRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Gasless transactions aren&apos;t available for this wallet type
        </Typography>
        <TooltipWithIcon
          title="Gasless transactions currently only support regular wallet accounts. Transactions from this wallet are sent the normal way instead."
          IconProps={{ sx: { fontSize: 16 } }}
        />
      </Stack>
    );
  }

  return (
    <Stack
      {...(props.attached ? {} : { component: Paper, variant: "outlined" })}
      gap={0.75}
      sx={(theme) => ({
        px: 2,
        py: 1.5,
        ...(props.attached
          ? {}
          : {
              borderRadius: "12px",
              // The warning state overrides the accent knob: it flags a
              // blocked submit rather than decorating an active one.
              borderColor:
                s === "required"
                  ? theme.palette.warning.main
                  : accentBorder(theme, props.activeAccent, enabled),
              transition: theme.transitions.create("border-color"),
            }),
      })}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <BoltRoundedIcon
          fontSize="small"
          sx={{
            fontSize: 18,
            color: enabled
              ? "primary.main"
              : s === "required"
                ? "warning.main"
                : "text.secondary",
          }}
        />
        <Typography variant="body2">Gasless</Typography>
        {/* Against the label — matching the scheduling row and the notched
            field tooltips — and BEFORE the fee, which comes and goes with
            state. Trailing the fee, the icon would shift position every time
            the strip changed state. */}
        <TooltipWithIcon
          title="You sign a message instead of paying gas. The transaction is submitted for you and the network fee is covered. A service fee is charged only if it succeeds."
          IconProps={{ sx: { fontSize: 16, display: "block" } }}
        />
        {enabled && (
          <Typography variant="body2" color="text.secondary" translate="no" noWrap>
            · {feeText} fee
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Switch size="small" checked={enabled} sx={{ mr: "-6px" }} />
      </Stack>

      {s === "required" && (
        <Typography
          variant="caption"
          color="error.main"
          sx={{ pl: indent, display: "flex", alignItems: "center", gap: 0.5 }}
        >
          Turn this on to schedule streams on Base.
        </Typography>
      )}

      {enabled && (
        <Stack gap={0.75} sx={{ pl: indent }}>
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Pay with
            </Typography>
            <FeeChip
              label={usdcSelected ? "USDCx" : `USDCx · ${MOCK.usdcxBalance}`}
              selected={!usdcSelected}
              error={s === "shortUsdcx"}
            />
            <FeeChip
              label={usdcSelected ? `USDC · ${MOCK.usdcBalance}` : "USDC"}
              selected={usdcSelected}
              error={s === "shortUsdc"}
            />
          </Stack>

          {s === "shortUsdcx" && (
            <Typography variant="caption" color="error">
              Not enough USDCx to cover the fee.
            </Typography>
          )}
          {s === "shortUsdc" && (
            <Typography variant="caption" color="error">
              Not enough USDC to cover the fee.
            </Typography>
          )}
          {s === "approval" && (
            <Button
              size="small"
              variant="outlined"
              fullWidth
              sx={actionShapeSx(props.buttonShape)}
            >
              Approve USDC (one time)
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function FeeChip(props: { label: string; selected: boolean; error?: boolean }) {
  return (
    <Chip
      size="small"
      label={<span translate="no">{props.label}</span>}
      variant={props.selected ? "filled" : "outlined"}
      color={props.selected ? (props.error ? "error" : "primary") : undefined}
      sx={{
        height: 20,
        "& .MuiChip-label": { px: 1, fontSize: "0.75rem" },
        ...(props.selected
          ? {}
          : { color: "text.secondary", borderColor: "divider" }),
      }}
    />
  );
}

/**
 * Buffer figure + risk acknowledgement as ONE unit.
 *
 * Previously these were two separate elements that each stated the amount (a
 * preview row and a yellow alert), so the number appeared twice and neither
 * explained why it mattered. Fusing them states it once, where the user is
 * being asked to accept it.
 *
 * `style` controls how hard it pushes: "tint" is a soft amber wash, "outlined"
 * a hairline border with no fill, "plain" nothing but the icon and the bolded
 * clause. The left-border stripe is gone — it read as an alert bar, which
 * overstated a condition the user is simply acknowledging.
 *
 * `showAmount` is false where the figure is already adjacent (variant C's stat
 * row), so the block explains without repeating.
 */
function BufferRisk(props: {
  showAmount?: boolean;
  style: WarningStyle;
  /** Fills a divided section: square corners, no inset. */
  sectioned?: boolean;
}) {
  return (
    <Stack
      gap={0.25}
      sx={(theme) => ({
        px: 2,
        py: 1.5,
        ...(props.style === "tint"
          ? { backgroundColor: alpha(theme.palette.warning.main, 0.06) }
          : {}),
        ...(props.style === "outlined"
          ? { border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}` }
          : {}),
        ...(props.sectioned
          ? {}
          : { borderRadius: props.style === "plain" ? 0 : "8px" }),
        ...(props.style === "plain" ? { px: 0 } : {}),
      })}
    >
      {/* The icon is its own column; the paragraph AND the checkbox share the
          second one, so the checkbox lines up with the text above it rather
          than with the icon. */}
      <Stack direction="row" alignItems="flex-start" gap={1}>
        <WarningAmberRoundedIcon
          sx={{ fontSize: 18, color: "warning.main", mt: "2px" }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.primary">
            {props.showAmount ? (
              <>
                <Typography
                  component="span"
                  variant="body2mono"
                  fontWeight={600}
                  translate="no"
                >
                  {MOCK.buffer}
                </Typography>{" "}
                is locked as a buffer.{" "}
              </>
            ) : (
              <>This buffer is returned when you cancel. </>
            )}
            <Typography component="span" variant="body2" fontWeight={600}>
              You lose it
            </Typography>{" "}
            if your balance runs out before you cancel the stream.
          </Typography>
          <FormControlLabel
            // Cancels the Checkbox's own 9px padding so its glyph — not its hit
            // area — sits flush with the paragraph's left edge.
            sx={{ ml: "-9px", mt: 0.25 }}
            control={<Checkbox size="small" defaultChecked />}
            label={
              <Typography variant="body2" fontWeight={500}>
                I understand.
              </Typography>
            }
          />
        </Box>
      </Stack>
    </Stack>
  );
}

/**
 * The action summary — the single claim the user is agreeing to, composed from
 * inputs scattered across three separate controls above.
 *
 * Deliberately NOT a mirror of the field layout: the receiver field shows an
 * address-book alias, so this is the only place the actual destination address
 * is visible. Wrong-address is the unrecoverable failure mode here, so the
 * address is the emphasized element, not the rate.
 */
function ActionSummary(props: { full?: boolean; scheduling: boolean }) {
  return (
    <Typography variant="body2" color="text.secondary">
      Streaming{" "}
      <Typography
        component="span"
        variant="body2"
        color="text.primary"
        translate="no"
      >
        {MOCK.flowRateText}
      </Typography>{" "}
      to{" "}
      <Typography
        component="span"
        variant="body2mono"
        fontWeight={600}
        color="text.primary"
        translate="no"
        sx={{ wordBreak: "break-all" }}
      >
        {props.full ? MOCK.receiver : MOCK.receiverShort}
      </Typography>
      {props.scheduling ? (
        <>
          {" "}
          until{" "}
          <Typography
            component="span"
            variant="body2"
            color="text.primary"
            translate="no"
          >
            {MOCK.endDateText}
          </Typography>
        </>
      ) : (
        <>
          {" "}
          with{" "}
          <Typography component="span" variant="body2" color="text.primary">
            no end date
          </Typography>
        </>
      )}
      .
    </Typography>
  );
}

/**
 * The soft gray wash behind the summary. Neutral rather than tinted: it marks
 * "this is the thing you're confirming" without spending a semantic color, so
 * green stays the commit action and amber stays the risk.
 */
const summaryBackgroundSx = (theme: Theme) => ({
  backgroundColor: alpha(theme.palette.text.primary, 0.03),
});

/** One label/value row in the ledger variant. */
function Row(props: {
  label: ReactNode;
  value: ReactNode;
  error?: boolean;
  strong?: boolean;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      sx={{ py: 1 }}
    >
      <Typography variant="body2" color="text.secondary">
        {props.label}
      </Typography>
      <Typography
        variant="body2mono"
        fontWeight={props.strong ? 600 : 500}
        color={props.error ? "error.main" : "text.primary"}
        translate="no"
      >
        {props.value}
      </Typography>
    </Stack>
  );
}

// # Variants

interface ConsequencesProps {
  liquidationSoon: boolean;
  scheduling: boolean;
  warningStyle: WarningStyle;
}

/** A — Quiet ledger. */
function ConsequencesLedger(props: ConsequencesProps) {
  return (
    <Paper variant="outlined" sx={{ px: 2.5, py: 0.5, borderRadius: "12px" }}>
      <Stack divider={<Divider flexItem />}>
        {/* Negative inset so the wash bleeds to the panel's edges rather than
            floating as an inner box with its own margins. */}
        <Box
          sx={[
            { py: 1.5, px: 2.5, mx: -2.5 },
            summaryBackgroundSx,
          ]}
        >
          <ActionSummary full scheduling={props.scheduling} />
        </Box>
        <Row label="Balance after buffer" value={MOCK.balanceAfterBuffer} />
        {props.liquidationSoon && (
          <Row label="Balance runs out" value="Aug 3, 2026" error />
        )}
        <Box sx={{ py: 1.5 }}>
          <BufferRisk showAmount style={props.warningStyle} />
        </Box>
      </Stack>
    </Paper>
  );
}

/** B — Summary sentence. */
function ConsequencesSentence(props: ConsequencesProps) {
  return (
    <Stack
      gap={1}
      sx={(theme) => ({
        px: 2.5,
        py: 2,
        borderRadius: "12px",
        backgroundColor: alpha(theme.palette.text.primary, 0.03),
      })}
    >
      <ActionSummary scheduling={props.scheduling} />
      <Typography variant="body2" color="text.secondary">
        This leaves <span translate="no">{MOCK.balanceAfterBuffer}</span>{" "}
        available.
      </Typography>
      <BufferRisk showAmount style={props.warningStyle} />
      {props.liquidationSoon && (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <WarningAmberRoundedIcon
            sx={{ fontSize: 16, color: "error.main" }}
          />
          <Typography variant="body2" color="error.main">
            At this rate your balance runs out on Aug 3, 2026.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

/**
 * C — Attached footer. One bordered block, read top to bottom as four
 * divided sections: what you're doing → what it costs → what you're accepting
 * → how it sends. The button closes it.
 */
function ConsequencesFooter(
  props: ConsequencesProps & {
    gasless: GaslessState;
    buttonShape: ButtonShape;
    ctaColor: CtaColorKey;
  activeAccent: ActiveAccent;
  }
) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: "12px", overflow: "hidden" }}>
      <Box sx={[{ px: 2, py: 1.5 }, summaryBackgroundSx]}>
        <ActionSummary scheduling={props.scheduling} />
      </Box>
      <Divider />

      <Stack
        direction="row"
        divider={<Divider flexItem orientation="vertical" />}
        gap={2.5}
        sx={{ px: 2, py: 1.5 }}
      >
        <Stack sx={{ minWidth: 0 }}>
          {/* inline-flex + centre, not inline text: an icon in a text flow
              sits on the baseline, which leaves it low against a 12px caption.
              Same construction as the notched field labels. 14px because the
              default overpowers the caption it belongs to. */}
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            Buffer locked
            <TooltipWithIcon
              title="A deposit taken when the stream starts and returned when you cancel it manually."
              IconProps={{ sx: { fontSize: 14, display: "block" } }}
            />
          </Typography>
          <Typography variant="body2mono" fontWeight={600} translate="no" noWrap>
            {MOCK.buffer}
          </Typography>
        </Stack>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            Balance after buffer
          </Typography>
          <Typography
            variant="body2mono"
            fontWeight={500}
            translate="no"
            noWrap
            color={props.liquidationSoon ? "error.main" : "text.primary"}
          >
            {MOCK.balanceAfterBuffer}
          </Typography>
        </Stack>
      </Stack>
      <Divider />

      {/* Amount omitted — the "Buffer locked" stat is directly above. */}
      <BufferRisk sectioned style={props.warningStyle} />
      <Divider />

      <GaslessLine state={props.gasless} attached buttonShape={props.buttonShape}
            ctaColor={props.ctaColor}
            activeAccent={props.activeAccent} />

      <Box sx={{ px: 2, pt: 0.5, pb: 2 }}>
        <Button
          variant="contained"
          size="xl"
          fullWidth
          sx={ctaSx(props.buttonShape, props.ctaColor)}
        >
          Send Stream
        </Button>
      </Box>
    </Paper>
  );
}

// # Mock form

function MockSendForm(props: {
  variant: VariantKey;
  scheduling: boolean;
  gasless: GaslessState;
  liquidationSoon: boolean;
  labelMode: LabelMode;
  labelStyle: LabelStyleKey;
  labelAlign: LabelAlign;
  labelGap: number;
  labelColor: LabelColorKey;
  warningStyle: WarningStyle;
  spacing: SpacingKey;
  inputSurface: InputSurface;
  inputFill: InputFillKey;
  toggleLayout: ToggleLayout;
  schedulingFrame: SchedulingFrame;
  buttonShape: ButtonShape;
  ctaColor: CtaColorKey;
  activeAccent: ActiveAccent;
  unitLayout: UnitLayout;
  balanceLayout: BalanceLayout;
  rowOrder: RowOrder;
}) {
  const consequences = {
    liquidationSoon: props.liquidationSoon,
    scheduling: props.scheduling,
    warningStyle: props.warningStyle,
  };
  const { edge, section } = SPACINGS[props.spacing];

  return (
    <Card
      elevation={1}
      sx={(theme) => ({
        p: `${edge}px`,
        width: "100%",
        "--lab-card-surface": cardSurface(theme, props.inputSurface),
        // Outlined Papers get background.paper but NOT the elevation-1 overlay
        // the card itself carries, so in dark mode every one of them reads
        // darker and bluer than the surface it sits on. They are meant to be
        // borders around the card's own surface, not separate surfaces —
        // so let the card show through instead of repainting it.
        "& .MuiPaper-outlined": {
          backgroundColor: "transparent",
          backgroundImage: "none",
        },
        // The period selector is a standard-variant Select living inside the
        // flow-rate field's adornment. MUI paints `.MuiSelect-select` on
        // :focus, and that focus persists after a value is picked — so the
        // period keeps a grey patch that the amount beside it doesn't have.
        // It sits on the field's own surface and must never paint its own.
        "& .MuiInputAdornment-root .MuiInputBase-root": {
          backgroundColor: "transparent",
        },
        "& .MuiInputAdornment-root .MuiSelect-select": {
          "&, &:focus, &:hover": { backgroundColor: "transparent" },
        },
        ...inputSurfaceSx(props.inputSurface, props.inputFill)(theme),
      })}
    >
      <Stack spacing={section}>
        <InputSection
          scheduling={props.scheduling}
          labelMode={props.labelMode}
          labelStyle={props.labelStyle}
          labelAlign={props.labelAlign}
          labelGap={props.labelGap}
          labelColor={props.labelColor}
          toggleLayout={props.toggleLayout}
          schedulingFrame={props.schedulingFrame}
          activeAccent={props.activeAccent}
          unitLayout={props.unitLayout}
          balanceLayout={props.balanceLayout}
          rowOrder={props.rowOrder}
        />

        {props.variant === "footer" ? (
          <ConsequencesFooter
            {...consequences}
            gasless={props.gasless}
            buttonShape={props.buttonShape}
            ctaColor={props.ctaColor}
            activeAccent={props.activeAccent}
          />
        ) : (
          <>
            {props.variant === "ledger" ? (
              <ConsequencesLedger {...consequences} />
            ) : (
              <ConsequencesSentence {...consequences} />
            )}
            <Stack gap={2}>
              <GaslessLine state={props.gasless} buttonShape={props.buttonShape}
            ctaColor={props.ctaColor}
            activeAccent={props.activeAccent} />
              <Button
                variant="contained"
                size="xl"
                sx={ctaSx(props.buttonShape, props.ctaColor)}
              >
                Send Stream
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
}
