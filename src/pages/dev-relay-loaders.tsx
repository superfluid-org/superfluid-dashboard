import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DrawRoundedIcon from "@mui/icons-material/DrawRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { NextPage } from "next";
import { FC, ReactNode, useEffect, useState } from "react";
import { RelayPhase } from "../MutationResult";

/**
 * TEMPORARY prototype page (not linked from the nav): renders the candidate Clear Macro
 * relay loading-state animations side by side with simulated phase transitions, so the
 * winning concept can be picked visually before it replaces the plain CircularProgress in
 * TransactionDialog. Delete this file once a concept has been chosen and implemented.
 */

/** The real RelayPhase union plus a pseudo-phase for the dialog's success view. */
type SimPhase = RelayPhase | "success";

const AUTO_PLAY_SEQUENCE: { phase: SimPhase; durationMs: number }[] = [
  { phase: "preparing", durationMs: 2500 },
  { phase: "awaiting-signature", durationMs: 4000 },
  { phase: "relaying", durationMs: 6500 },
  { phase: "success", durationMs: 3500 },
];

const PHASE_OPTIONS: { value: SimPhase; label: string }[] = [
  { value: "preparing", label: "Preparing" },
  { value: "awaiting-signature", label: "Awaiting signature" },
  { value: "relaying", label: "Relaying" },
  { value: "success", label: "Success" },
  { value: "fallback", label: "Fallback" },
  { value: "relay-status-unknown", label: "Still confirming" },
];

interface PhaseCopy {
  headline: string;
  subline?: string;
}

/** The proposed playful microcopy (part of what is being evaluated). */
const PROPOSED_COPY: Record<SimPhase, PhaseCopy> = {
  preparing: {
    headline: "Building your gasless route",
    subline: "Reading the chain and assembling one clear message.",
  },
  "awaiting-signature": {
    headline: "Your move: sign once",
    subline: "Check your wallet — one human-readable message, no gas to pay.",
  },
  relaying: {
    headline: "Bolt passed. Relay in motion.",
    subline: "The relay is submitting your transaction and paying the gas.",
  },
  success: {
    headline: "Gasless execution complete",
    subline: "Gas paid by you: 0. The relay covered it.",
  },
  // Degraded states stay sober on purpose — no jokes where trust is at stake.
  fallback: {
    headline: "Gasless route unavailable",
    subline:
      "Nothing was signed for the relay. Continue in your wallet — network fees apply.",
  },
  "relay-status-unknown": {
    headline: "Still confirming — don’t retry",
    subline:
      "Your signed transaction may still complete. We’ll keep checking in the background.",
  },
};

/** What TransactionDialog says today, for the baseline card. */
const CURRENT_COPY: Record<SimPhase, PhaseCopy> = {
  preparing: { headline: "Preparing gasless transaction..." },
  "awaiting-signature": { headline: "Waiting for your signature..." },
  relaying: { headline: "Relaying transaction..." },
  success: {
    headline: "Transaction broadcasted",
    subline: "Executed gaslessly via the Clear Macro relay.",
  },
  fallback: {
    headline: "Waiting for transaction approval...",
    subline:
      "Gasless relay unavailable — you’ll pay network fees for this transaction.",
  },
  "relay-status-unknown": {
    headline: "Your gasless transaction is still being confirmed",
    subline:
      "You signed it and we sent it to the relay, but couldn’t confirm it within the time limit. Please don’t retry.",
  },
};

/** Rotating loading-screen tips shown during the (up to 120s) relaying poll. */
const RELAY_TIPS = [
  "The relay pays the network gas — the fee comes out of the batch itself.",
  "You signed one human-readable message. That’s the “Clear” in Clear Macro.",
  "Your signature stays valid for 10 minutes — the relay only needs one good block.",
  "Streams flow every second. This part only happens once.",
];

const isLoadingPhase = (phase: SimPhase) =>
  phase === "preparing" || phase === "awaiting-signature" || phase === "relaying";

// ---------------------------------------------------------------------------------------
// 0. Baseline — what ships today (CircularProgress / outline icons).
// ---------------------------------------------------------------------------------------

const MockOutlineIcon: FC<{ children: ReactNode }> = ({ children }) => (
  <Box
    sx={(theme) => ({
      borderRadius: "50%",
      border: `5px solid ${theme.palette.primary.main}`,
      width: 80,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    })}
  >
    {children}
  </Box>
);

const BaselineVisual: FC<{ phase: SimPhase }> = ({ phase }) => {
  if (phase === "success") {
    return (
      <MockOutlineIcon>
        <ArrowUpwardRoundedIcon fontSize="large" color="primary" />
      </MockOutlineIcon>
    );
  }
  if (phase === "relay-status-unknown") {
    return (
      <MockOutlineIcon>
        <HourglassEmptyRoundedIcon fontSize="large" color="primary" />
      </MockOutlineIcon>
    );
  }
  return <CircularProgress size={80} />;
};

// ---------------------------------------------------------------------------------------
// 0b. Baseline + bolt core — the minimal delta: today's spinner with the relay bolt at its
//     center. The bolt vanishes on fallback (the gasless promise is what disappeared).
//     The spinner is a custom arc (same size/stroke as the success badge's border) so that
//     on success the SAME ring spins shut into the badge while the bolt pops into the arrow
//     — a seamless close two swapped components could never do.
// ---------------------------------------------------------------------------------------

const BoltSpinnerRoot = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 80px;
  height: 80px;

  .spinner { transition: opacity 150ms ease; }
  .ringSvg {
    position: absolute;
    inset: 0;
    overflow: visible;
  }
  .closeRing {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 6.5;
    stroke-linecap: round;
    /* Circumference of r=37.5 is ~235.6 — a 76% arc that sweeps shut on success. */
    stroke-dasharray: 180 55.6;
    opacity: 0;
    transform: rotate(-90deg);
    transform-box: view-box;
    transform-origin: center;
  }
  .icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.palette.primary.main};
  }
  .boltIcon { transition: opacity 250ms ease, transform 250ms ease; }
  .arrowIcon { opacity: 0; transform: scale(0.4); }
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    opacity: 0;
  }

  @keyframes bspRingClose {
    to { stroke-dasharray: 236 0; stroke-width: 5; }
  }
  @keyframes bspArrowPop {
    0% { opacity: 0; transform: scale(0.4); }
    60% { opacity: 1; transform: scale(1.18); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes bspSigPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.12); }
  }
  /* Same explosion as the Current Ring's success (ringRipple), which reads great. */
  @keyframes bspRipple {
    0% { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.45); opacity: 0; }
  }

  &[data-phase="success"] {
    /* The real MUI spinner cross-fades out while the close ring sweeps shut into the
       badge (stroke narrowing from the spinner's ~6.5px to the badge's 5px). */
    .spinner { opacity: 0; }
    .closeRing { opacity: 1; animation: bspRingClose 350ms ease-out 1 forwards; }
    .boltIcon { opacity: 0; transform: scale(0.4); }
    .arrowIcon { animation: bspArrowPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms 1 forwards; }
    .ripple { animation: bspRipple 900ms ease-out 200ms 1 forwards; }
  }
  &[data-phase="fallback"] {
    .boltIcon { opacity: 0; }
  }

  /* Awaiting-signature with an alternate center icon chosen: the bolt hands the center
     over to the "your move" icon (same morph as the success arrow), which then gently
     pulses until the signature lands. */
  .sigIcon { opacity: 0; transform: scale(0.4); }
  &[data-phase="awaiting-signature"][data-sig="alt"] {
    .boltIcon { opacity: 0; transform: scale(0.4); }
    .sigIcon {
      animation:
        bspArrowPop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) 1 forwards,
        bspSigPulse 1.8s ease-in-out 500ms infinite;
    }
  }
`
);

const SIGNATURE_ICON_OPTIONS = [
  { key: "bolt", label: "Bolt (same)", Icon: BoltRoundedIcon },
  { key: "pen", label: "Pen", Icon: DrawRoundedIcon },
  { key: "quill", label: "Quill", Icon: HistoryEduRoundedIcon },
  { key: "wallet", label: "Wallet", Icon: AccountBalanceWalletRoundedIcon },
  { key: "fingerprint", label: "Fingerprint", Icon: FingerprintRoundedIcon },
] as const;

type SignatureIconKey = (typeof SIGNATURE_ICON_OPTIONS)[number]["key"];

const BoltSpinnerVisual: FC<{ phase: SimPhase }> = ({ phase }) => {
  const [sigIconKey, setSigIconKey] = useState<SignatureIconKey>("wallet");
  if (phase === "relay-status-unknown") {
    return <BaselineVisual phase={phase} />;
  }
  const SigIcon = SIGNATURE_ICON_OPTIONS.find((o) => o.key === sigIconKey)!.Icon;
  return (
    <Stack alignItems="center" gap={1.5}>
      <BoltSpinnerRoot
        data-phase={phase}
        data-sig={sigIconKey === "bolt" ? "bolt" : "alt"}
      >
        <CircularProgress className="spinner" size={80} />
        <svg
          className="ringSvg"
          viewBox="0 0 80 80"
          width={80}
          height={80}
          aria-hidden="true"
        >
          <circle className="closeRing" cx="40" cy="40" r="37.5" />
        </svg>
        <Box className="ripple" />
        <Box className="icon boltIcon">
          <BoltRoundedIcon fontSize="large" />
        </Box>
        <Box className="icon sigIcon">
          {/* The wallet renders slightly smaller — its glyph is visually denser. */}
          <SigIcon sx={{ fontSize: sigIconKey === "wallet" ? 30 : 35 }} />
        </Box>
        <Box className="icon arrowIcon">
          <ArrowUpwardRoundedIcon fontSize="large" />
        </Box>
      </BoltSpinnerRoot>
      {/* Lab-only picker for the awaiting-signature center icon. */}
      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap" justifyContent="center">
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          Signing icon:
        </Typography>
        {SIGNATURE_ICON_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            size="small"
            clickable
            label={option.label}
            color={option.key === sigIconKey ? "primary" : undefined}
            variant={option.key === sigIconKey ? "filled" : "outlined"}
            onClick={() => setSigIconKey(option.key)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

// ---------------------------------------------------------------------------------------
// 1. Live Current Pipeline — one pipe, three nodes; the current flows to the active node,
//    pools at the signature, and a bolt shoots down the last segment while relaying.
// ---------------------------------------------------------------------------------------

const PipelineSvg = styled("svg")(
  ({ theme }) => `
  overflow: visible;

  .segBase {
    stroke: ${theme.palette.divider};
    stroke-width: 4;
    stroke-linecap: round;
  }
  .segDone {
    stroke: ${theme.palette.primary.main};
    stroke-width: 4;
    stroke-linecap: round;
    opacity: 0;
    transition: opacity 400ms ease;
  }
  .segFlow {
    stroke: ${theme.palette.primary.main};
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 6 8;
    opacity: 0;
  }
  .node {
    fill: ${theme.palette.background.paper};
    stroke: ${theme.palette.divider};
    stroke-width: 3;
    transition: fill 400ms ease, stroke 400ms ease;
  }
  .nodePulse {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 2;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }
  .label {
    font-size: 11px;
    fill: ${theme.palette.text.secondary};
    text-anchor: middle;
    transition: fill 400ms ease;
  }
  .boltGlyph {
    fill: ${theme.palette.primary.main};
    opacity: 0;
  }
  .check {
    fill: none;
    stroke: ${theme.palette.primary.contrastText};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    transition: opacity 300ms ease 200ms;
  }
  .ripple {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 2;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }

  @keyframes pipeFlow {
    to { stroke-dashoffset: -28; }
  }
  @keyframes pipePulse {
    0% { transform: scale(1); opacity: 0.6; }
    70%, 100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes pipeBoltTravel {
    0% { transform: translateX(0); opacity: 0; }
    12% { opacity: 1; }
    88% { opacity: 1; }
    100% { transform: translateX(80px); opacity: 0; }
  }
  @keyframes pipeRippleOut {
    0% { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes pipeBreathe {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 0.9; }
  }

  .nodeActive { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
  .labelActive { fill: ${theme.palette.text.primary}; font-weight: 600; }

  &[data-phase="preparing"] {
    .node1 { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
    .seg1Flow { opacity: 1; animation: pipeFlow 1.1s linear infinite; }
    .label1 { fill: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="awaiting-signature"] {
    .node1, .node2 { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
    .seg1Done { opacity: 1; }
    .seg1Flow { opacity: 0.5; animation: pipeFlow 2.6s linear infinite; }
    .pulse2 { animation: pipePulse 1.6s ease-out infinite; }
    .label2 { fill: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="relaying"] {
    .node1, .node2 { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
    .seg1Done { opacity: 1; }
    .seg2Flow { opacity: 1; animation: pipeFlow 0.55s linear infinite; }
    .boltGlyph { animation: pipeBoltTravel 1.4s ease-in-out infinite; }
    .label3 { fill: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="success"] {
    .node1, .node2, .node3 { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
    .seg1Done, .seg2Done { opacity: 1; }
    .check { opacity: 1; }
    .ripple { animation: pipeRippleOut 0.9s ease-out 1 forwards; }
    .label { fill: ${theme.palette.text.primary}; }
  }
  &[data-phase="fallback"] {
    opacity: 0.55;
  }
  &[data-phase="relay-status-unknown"] {
    .node1, .node2 { fill: ${theme.palette.primary.main}; stroke: ${theme.palette.primary.main}; }
    .seg1Done { opacity: 1; }
    .seg2Flow { opacity: 0.6; animation: pipeFlow 3s linear infinite; }
    .node3 { animation: pipeBreathe 2.4s ease-in-out infinite; }
    .label3 { fill: ${theme.palette.text.primary}; }
  }
`
);

const PipelineLoader: FC<{ phase: SimPhase }> = ({ phase }) => (
  <PipelineSvg data-phase={phase} viewBox="0 0 300 96" width={300} height={96}>
    <line className="segBase" x1="56" y1="40" x2="134" y2="40" />
    <line className="segBase" x1="166" y1="40" x2="244" y2="40" />
    <line className="segDone seg1Done" x1="56" y1="40" x2="134" y2="40" />
    <line className="segDone seg2Done" x1="166" y1="40" x2="244" y2="40" />
    <line className="segFlow seg1Flow" x1="56" y1="40" x2="134" y2="40" />
    <line className="segFlow seg2Flow" x1="166" y1="40" x2="244" y2="40" />

    <circle className="nodePulse pulse2" cx="150" cy="40" r="14" />
    <circle className="ripple" cx="260" cy="40" r="14" />
    <circle className="node node1" cx="40" cy="40" r="14" />
    <circle className="node node2" cx="150" cy="40" r="14" />
    <circle className="node node3" cx="260" cy="40" r="14" />

    {/* Bolt travels the second segment while relaying. */}
    <g transform="translate(160, 32.5)">
      <path className="boltGlyph" d="M7 0 L0 8.5 L5 8.5 L3.5 15 L11 6 L6.2 6 Z" />
    </g>
    <path className="check" d="M254 40 l4 4 l8 -9" />

    <text className="label label1" x="40" y="78">
      Prepare
    </text>
    <text className="label label2" x="150" y="78">
      Sign once
    </text>
    <text className="label label3" x="260" y="78">
      Relay
    </text>
  </PipelineSvg>
);

// ---------------------------------------------------------------------------------------
// 2. Superfluid Current Ring — an open circular stream of droplets orbiting a bolt.
//    Drop-in replacement for the current 80px spinner slot.
// ---------------------------------------------------------------------------------------

const CurrentRingRoot = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 96px;
  height: 96px;

  svg { overflow: visible; }

  .ring {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 4;
    stroke-linecap: round;
    /* Circumference of r=34 is ~213.6 — leave a ~56° opening. */
    stroke-dasharray: 180 33.6;
    transform-box: view-box;
    transform-origin: center;
    transform: rotate(-90deg);
  }
  .droplets {
    transform-box: view-box;
    transform-origin: center;
    animation: ringSpin 3s linear infinite;
  }
  .droplet { fill: ${theme.palette.primary.main}; }
  .trail { fill: ${theme.palette.primary.main}; opacity: 0; }

  .centerIcon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.palette.primary.main};
    transition: opacity 300ms ease;
  }
  .rippleBox {
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    opacity: 0;
  }

  @keyframes ringSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes ringBreathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes ringBoltPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.25); }
  }
  @keyframes ringClose {
    to { stroke-dasharray: 214 0; }
  }
  @keyframes ringRipple {
    0% { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.45); opacity: 0; }
  }

  .boltIcon { opacity: 1; }
  .checkIcon { opacity: 0; }

  &[data-phase="awaiting-signature"] {
    svg { animation: ringBreathe 2.4s ease-in-out infinite; }
    .droplets { animation-duration: 7s; }
    .boltIcon svg { animation: ringBoltPulse 1.6s ease-in-out infinite; }
  }
  &[data-phase="relaying"] {
    .droplets { animation-duration: 0.9s; }
    .trail { opacity: 0.35; }
  }
  &[data-phase="success"] {
    .droplets { animation-play-state: paused; opacity: 0; transition: opacity 400ms ease; }
    .ring { animation: ringClose 600ms ease-out 1 forwards; }
    .boltIcon { opacity: 0; }
    .checkIcon { opacity: 1; transition-delay: 250ms; }
    .rippleBox { animation: ringRipple 0.9s ease-out 1 forwards; }
  }
  &[data-phase="fallback"] {
    opacity: 0.55;
    .droplets { animation-play-state: paused; }
  }
  &[data-phase="relay-status-unknown"] {
    opacity: 0.75;
    .droplets { animation-duration: 12s; }
  }
`
);

const CurrentRingLoader: FC<{ phase: SimPhase }> = ({ phase }) => (
  <CurrentRingRoot data-phase={phase}>
    <svg viewBox="0 0 96 96" width={96} height={96}>
      <circle className="ring" cx="48" cy="48" r="34" />
      <g className="droplets">
        <circle className="droplet" cx="82" cy="48" r="4" />
        <circle className="trail" cx="80.5" cy="55" r="3" />
        <circle className="droplet" cx="48" cy="82" r="3.5" />
        <circle className="trail" cx="41" cy="80.5" r="2.5" />
        <circle className="droplet" cx="14" cy="48" r="4" />
        <circle className="trail" cx="15.5" cy="41" r="3" />
        <circle className="droplet" cx="48" cy="14" r="3.5" />
        <circle className="trail" cx="55" cy="15.5" r="2.5" />
      </g>
    </svg>
    <Box className="rippleBox" />
    <Box className="centerIcon boltIcon">
      <BoltRoundedIcon fontSize="large" />
    </Box>
    <Box className="centerIcon checkIcon">
      <CheckRoundedIcon fontSize="large" />
    </Box>
  </CurrentRingRoot>
);

// ---------------------------------------------------------------------------------------
// 3. Liquid Bolt Fill — the chip strip's bolt filling with a flowing liquid; pauses at a
//    threshold for the signature, snaps full when the relay takes over.
// ---------------------------------------------------------------------------------------

const BOLT_PATH = "M36 2 L8 46 L24 46 L20 78 L52 30 L33 30 L40 2 Z";
// Two-wave parallax along the liquid's surface (wavelength 20, repeated well past the clip).
const WAVE_PATH =
  "M-60 8 Q-55 2 -50 8 T-40 8 T-30 8 T-20 8 T-10 8 T0 8 T10 8 T20 8 T30 8 T40 8 T50 8 T60 8 T70 8 T80 8 T90 8 T100 8 T110 8 T120 8 V95 H-60 Z";

const LiquidBoltSvg = styled("svg")(
  ({ theme }) => `
  overflow: visible;
  transition: filter 500ms ease, opacity 400ms ease;

  .boltBg { fill: ${alpha(theme.palette.primary.main, 0.08)}; }
  .outline {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 2.5;
    stroke-linejoin: round;
  }
  .liquid {
    /* Waterline: translateY((1 - level) * 74); wave baseline sits at y=6 when full. */
    transform: translateY(41px);
    transition: transform 1000ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wave1 { fill: ${alpha(theme.palette.primary.main, 0.85)}; animation: liquidDrift 2.6s linear infinite; }
  .wave2 { fill: ${alpha(theme.palette.primary.main, 0.4)}; animation: liquidDrift 3.9s linear infinite reverse; }
  .threshold {
    stroke: ${theme.palette.primary.main};
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
    opacity: 0;
  }
  .ripple {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 2;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }
  .badge {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 2.5;
    stroke-linecap: round;
    /* Circumference of r=34 (~213.6), fully offset = invisible until drawn. */
    stroke-dasharray: 213.6;
    stroke-dashoffset: 213.6;
    opacity: 0;
    /* Start the draw from 12 o'clock. */
    transform: rotate(-90deg);
    transform-box: fill-box;
    transform-origin: center;
  }

  @keyframes liquidDrift {
    to { transform: translateX(40px); }
  }
  @keyframes liquidPop {
    0% { transform: scale(1); }
    45% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes liquidBadgeDraw {
    0% { opacity: 1; stroke-dashoffset: 213.6; }
    100% { opacity: 1; stroke-dashoffset: 0; }
  }
  @keyframes liquidThresholdPulse {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }
  @keyframes liquidRipple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2); opacity: 0; }
  }

  &[data-phase="awaiting-signature"] {
    .liquid { transform: translateY(24px); }
    .threshold { animation: liquidThresholdPulse 1.6s ease-in-out infinite; }
  }
  &[data-phase="relaying"] {
    .liquid { transform: translateY(0); transition-duration: 500ms; }
    filter: drop-shadow(0 0 7px ${alpha(theme.palette.primary.main, 0.55)});
  }
  &[data-phase="success"] {
    animation: liquidPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 1;
    .liquid { transform: translateY(0); }
    .ripple { animation: liquidRipple 0.9s ease-out 1 forwards; }
    .badge { animation: liquidBadgeDraw 550ms ease-out 120ms 1 forwards; }
  }
  &[data-phase="fallback"] {
    opacity: 0.55;
    .liquid { transform: translateY(63px); }
    .wave1, .wave2 { animation-play-state: paused; }
  }
  &[data-phase="relay-status-unknown"] {
    opacity: 0.75;
    .liquid { transform: translateY(8px); }
    .wave1 { animation-duration: 6s; }
    .wave2 { animation-duration: 9s; }
  }
`
);

const LiquidBoltLoader: FC<{ phase: SimPhase }> = ({ phase }) => (
  <LiquidBoltSvg data-phase={phase} viewBox="0 0 60 80" width={78} height={104}>
    <defs>
      <clipPath id="dev-relay-bolt-clip">
        <path d={BOLT_PATH} />
      </clipPath>
    </defs>
    <path className="boltBg" d={BOLT_PATH} />
    <g clipPath="url(#dev-relay-bolt-clip)">
      <g className="liquid">
        <path className="wave2" d={WAVE_PATH} transform="translate(0, -2)" />
        <path className="wave1" d={WAVE_PATH} />
      </g>
    </g>
    <path className="outline" d={BOLT_PATH} />
    {/* Threshold marker at the awaiting-signature fill level. */}
    <line className="threshold" x1="2" y1="30" x2="58" y2="30" />
    <circle className="ripple" cx="30" cy="40" r="26" />
    {/* Success: a ring draws itself around the full bolt, landing as a badge. */}
    <circle className="badge" cx="30" cy="40" r="34" />
  </LiquidBoltSvg>
);

// ---------------------------------------------------------------------------------------
// 0c. Bolt core + liquid fill — 0b's spinner, but the center bolt fills like the Liquid
//     Bolt through the phases (no threshold line): half-full while preparing, holding with
//     a breath at the signature, snapping full on relay. Success is 0b's ring-close +
//     bolt→arrow morph + explosion ripple.
// ---------------------------------------------------------------------------------------

const BoltFillSpinnerRoot = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 80px;
  height: 80px;

  svg { overflow: visible; }
  .spinGroup {
    transform-box: view-box;
    transform-origin: center;
    animation: bfsSpin 1.4s linear infinite;
  }
  .arc {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 5;
    stroke-linecap: round;
    stroke-dasharray: 165 70.6;
  }
  .icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.palette.primary.main};
  }
  .fillBolt { transition: opacity 250ms ease, transform 250ms ease; }
  .fillBolt svg { transition: filter 500ms ease; }
  .arrowIcon { opacity: 0; transform: scale(0.4); }
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    opacity: 0;
  }

  .boltBg { fill: ${alpha(theme.palette.primary.main, 0.1)}; }
  .outline {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 4;
    stroke-linejoin: round;
  }
  .liquid {
    transform: translateY(41px);
    transition: transform 1000ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wave1 { fill: ${alpha(theme.palette.primary.main, 0.85)}; animation: bfsDrift 2.6s linear infinite; }
  .wave2 { fill: ${alpha(theme.palette.primary.main, 0.4)}; animation: bfsDrift 3.9s linear infinite reverse; }

  @keyframes bfsSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes bfsRingClose {
    to { stroke-dasharray: 236 0; }
  }
  @keyframes bfsArrowPop {
    0% { opacity: 0; transform: scale(0.4); }
    60% { opacity: 1; transform: scale(1.18); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes bfsRipple {
    0% { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.45); opacity: 0; }
  }
  @keyframes bfsBreathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes bfsDrift {
    to { transform: translateX(40px); }
  }

  &[data-phase="awaiting-signature"] {
    .liquid { transform: translateY(24px); }
    .fillBolt { animation: bfsBreathe 1.8s ease-in-out infinite; }
  }
  &[data-phase="relaying"] {
    .liquid { transform: translateY(0); transition-duration: 500ms; }
    .fillBolt svg { filter: drop-shadow(0 0 6px ${alpha(theme.palette.primary.main, 0.55)}); }
  }
  &[data-phase="success"] {
    .liquid { transform: translateY(0); }
    .arc { animation: bfsRingClose 350ms ease-out 1 forwards; }
    .fillBolt { opacity: 0; transform: scale(0.4); }
    .arrowIcon { animation: bfsArrowPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms 1 forwards; }
    .ripple { animation: bfsRipple 900ms ease-out 200ms 1 forwards; }
  }
  &[data-phase="fallback"] {
    .fillBolt { opacity: 0; }
  }
`
);

const BoltFillSpinnerVisual: FC<{ phase: SimPhase }> = ({ phase }) => {
  if (phase === "relay-status-unknown") {
    return <BaselineVisual phase={phase} />;
  }
  return (
    <BoltFillSpinnerRoot data-phase={phase}>
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <g className="spinGroup">
          <circle className="arc" cx="40" cy="40" r="37.5" />
        </g>
      </svg>
      <Box className="ripple" />
      <Box className="icon fillBolt">
        <svg viewBox="0 0 60 80" width={30} height={40}>
          <defs>
            <clipPath id="dev-relay-bolt-clip-mini">
              <path d={BOLT_PATH} />
            </clipPath>
          </defs>
          <path className="boltBg" d={BOLT_PATH} />
          <g clipPath="url(#dev-relay-bolt-clip-mini)">
            <g className="liquid">
              <path className="wave2" d={WAVE_PATH} transform="translate(0, -2)" />
              <path className="wave1" d={WAVE_PATH} />
            </g>
          </g>
          <path className="outline" d={BOLT_PATH} />
        </svg>
      </Box>
      <Box className="icon arrowIcon">
        <ArrowUpwardRoundedIcon fontSize="large" />
      </Box>
    </BoltFillSpinnerRoot>
  );
};

// ---------------------------------------------------------------------------------------
// 4. Bolt Baton Relay — the bolt as a baton passed Dashboard → You → Relay, holding with
//    a "your turn" pulse at the signature and overshooting into the relay station.
// ---------------------------------------------------------------------------------------

const BatonRoot = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 280px;
  height: 96px;

  .track {
    position: absolute;
    top: 31px;
    left: 8%;
    right: 8%;
    height: 3px;
    border-radius: 2px;
    background: ${theme.palette.divider};
  }
  .trackFill {
    position: absolute;
    top: 31px;
    left: 8%;
    right: 8%;
    height: 3px;
    border-radius: 2px;
    background: ${theme.palette.primary.main};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 700ms ease;
  }
  .station {
    position: absolute;
    top: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid ${theme.palette.divider};
    background: ${theme.palette.background.paper};
    transform: translateX(-50%);
    transition: border-color 400ms ease, background 400ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .station .stationCheck {
    opacity: 0;
    color: ${theme.palette.primary.main};
    transition: opacity 300ms ease 250ms;
  }
  .stationLabel {
    position: absolute;
    top: 62px;
    transform: translateX(-50%);
    font-size: 11px;
    color: ${theme.palette.text.secondary};
    white-space: nowrap;
    transition: color 400ms ease;
  }
  .pulseRing {
    position: absolute;
    top: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    transform: translateX(-50%);
    opacity: 0;
  }
  .baton {
    position: absolute;
    top: 20px;
    left: 8%;
    color: ${theme.palette.primary.main};
    transform: translateX(-50%);
    transition:
      left 1100ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 300ms ease;
    display: flex;
  }

  @keyframes batonPulse {
    0% { transform: translateX(-50%) scale(1); opacity: 0.7; }
    70%, 100% { transform: translateX(-50%) scale(1.8); opacity: 0; }
  }
  @keyframes batonBob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-4px); }
  }
  @keyframes batonGlow {
    0%, 100% { box-shadow: 0 0 0 0 ${alpha(theme.palette.primary.main, 0)}; }
    50% { box-shadow: 0 0 12px 2px ${alpha(theme.palette.primary.main, 0.5)}; }
  }

  .stationReached { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }

  &[data-phase="preparing"] {
    .baton { left: 50%; animation: batonBob 1.2s ease-in-out infinite; }
    .station1 { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }
    .label1 { color: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="awaiting-signature"] {
    .baton { left: 50%; animation: batonBob 2s ease-in-out infinite; }
    .station1, .station2 { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }
    .pulse2 { animation: batonPulse 1.5s ease-out infinite; }
    .trackFill { transform: scaleX(0.5); }
    .label2 { color: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="relaying"] {
    .baton { left: 92%; transition: left 650ms cubic-bezier(0.34, 1.56, 0.64, 1); }
    .station1, .station2, .station3 { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }
    .station3 { animation: batonGlow 1.4s ease-in-out infinite; }
    .trackFill { transform: scaleX(1); }
    .label3 { color: ${theme.palette.text.primary}; font-weight: 600; }
  }
  &[data-phase="success"] {
    .baton { left: 92%; opacity: 0; }
    .station1, .station2, .station3 { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }
    .station3 .stationCheck { opacity: 1; }
    .trackFill { transform: scaleX(1); }
  }
  &[data-phase="fallback"] {
    opacity: 0.55;
  }
  &[data-phase="relay-status-unknown"] {
    .baton { left: 92%; opacity: 0.5; }
    .station1, .station2 { border-color: ${theme.palette.primary.main}; background: ${alpha(theme.palette.primary.main, 0.08)}; }
    .trackFill { transform: scaleX(1); opacity: 0.5; }
    .pulse3 { animation: batonPulse 2.4s ease-out infinite; }
  }
`
);

const BatonRelayLoader: FC<{ phase: SimPhase }> = ({ phase }) => (
  <BatonRoot data-phase={phase}>
    <Box className="track" />
    <Box className="trackFill" />
    <Box className="pulseRing pulse2" sx={{ left: "50%" }} />
    <Box className="pulseRing pulse3" sx={{ left: "92%" }} />
    <Box className="station station1" sx={{ left: "8%" }} />
    <Box className="station station2" sx={{ left: "50%" }} />
    <Box className="station station3" sx={{ left: "92%" }}>
      <CheckRoundedIcon className="stationCheck" fontSize="small" />
    </Box>
    <Box className="baton">
      <BoltRoundedIcon />
    </Box>
    <Typography component="span" className="stationLabel label1" sx={{ left: "8%" }}>
      Dashboard
    </Typography>
    <Typography component="span" className="stationLabel label2" sx={{ left: "50%" }}>
      You
    </Typography>
    <Typography component="span" className="stationLabel label3" sx={{ left: "92%" }}>
      Relay
    </Typography>
  </BatonRoot>
);

// ---------------------------------------------------------------------------------------
// 5. Checkpoint Log — a mission-console line feed ticking only real events (no fake
//    percentages). Relaying advances through its actual sub-steps on a timer.
// ---------------------------------------------------------------------------------------

const blinkSx = {
  display: "inline-block",
  width: "0.6em",
  animation: "clBlink 1s steps(2, start) infinite",
  "@keyframes clBlink": { to: { visibility: "hidden" } },
} as const;

type LogLineStatus = "done" | "active" | "warn" | "fail" | "plain";

interface LogLine {
  text: string;
  status: LogLineStatus;
}

const buildLogLines = (phase: SimPhase, relayTick: number): LogLine[] => {
  switch (phase) {
    case "preparing":
      return [
        { text: "reading chain state", status: "done" },
        { text: "assembling clear message", status: "active" },
      ];
    case "awaiting-signature":
      return [
        { text: "reading chain state", status: "done" },
        { text: "clear message ready", status: "done" },
        { text: "awaiting your signature", status: "active" },
      ];
    case "relaying": {
      const lines: LogLine[] = [
        { text: "clear message ready", status: "done" },
        { text: "signature captured", status: "done" },
      ];
      if (relayTick === 0) lines.push({ text: "handing to relay", status: "active" });
      if (relayTick >= 1)
        lines.push(
          { text: "relay accepted — gas covered", status: "done" },
          { text: "submitting transaction", status: relayTick === 1 ? "active" : "done" }
        );
      if (relayTick >= 2) lines.push({ text: "waiting for confirmation", status: "active" });
      return lines;
    }
    case "success":
      return [
        { text: "signature captured", status: "done" },
        { text: "relay accepted — gas covered", status: "done" },
        { text: "transaction submitted", status: "done" },
        { text: "confirmed on-chain", status: "done" },
      ];
    case "fallback":
      return [
        { text: "gasless relay unavailable", status: "warn" },
        { text: "continuing as a regular transaction", status: "active" },
        { text: "network fees apply", status: "plain" },
      ];
    case "relay-status-unknown":
      return [
        { text: "signature captured", status: "done" },
        { text: "relay accepted — gas covered", status: "done" },
        { text: "confirmation timed out", status: "warn" },
        { text: "still watching — don’t retry", status: "active" },
      ];
  }
};

const CheckpointLogLoader: FC<{ phase: SimPhase }> = ({ phase }) => {
  const [relayTick, setRelayTick] = useState(0);
  useEffect(() => {
    setRelayTick(0);
    if (phase !== "relaying") return;
    const interval = setInterval(
      () => setRelayTick((tick) => Math.min(tick + 1, 2)),
      1800
    );
    return () => clearInterval(interval);
  }, [phase]);

  const lines = buildLogLines(phase, relayTick);

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        width: "100%",
        maxWidth: 320,
        borderRadius: "10px",
        px: 2,
        py: 1.5,
        textAlign: "left",
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: 12.5,
        backgroundColor: theme.palette.action.hover,
      })}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "divider",
            }}
          />
        ))}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: "inherit", ml: 0.5 }}
        >
          relay console
        </Typography>
        {isLoadingPhase(phase) && <CircularProgress size={12} sx={{ ml: "auto" }} />}
      </Stack>
      <Stack gap={0.5}>
        {lines.map((line) => (
          <Box
            key={line.text}
            sx={(theme) => ({
              color:
                line.status === "warn"
                  ? theme.palette.warning.main
                  : line.status === "fail"
                    ? theme.palette.error.main
                    : line.status === "active"
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
            })}
          >
            <Box component="span" sx={{ color: "primary.main", mr: 0.75 }}>
              {line.status === "done" ? "✓" : line.status === "warn" ? "!" : "▸"}
            </Box>
            {line.text}
            {line.status === "active" && (
              <Box component="span" sx={blinkSx}>
                ▍
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

// ---------------------------------------------------------------------------------------
// 6. Particle Stream — a current of droplets flowing through three gates; it literally
//    pauses while the signature is yours, and a bright bolt-particle rides the relay leg.
// ---------------------------------------------------------------------------------------

const ParticleRoot = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 260px;
  height: 72px;
  overflow: hidden;

  .gate {
    position: absolute;
    top: 24px;
    width: 3px;
    height: 24px;
    border-radius: 2px;
    background: ${theme.palette.divider};
    transition: background 400ms ease;
  }
  .dot {
    position: absolute;
    top: 33px;
    left: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${theme.palette.primary.main};
    animation: psFlowFull 2.8s linear infinite;
  }
  .boltDot {
    position: absolute;
    top: 24px;
    left: 0;
    color: ${theme.palette.primary.main};
    filter: drop-shadow(0 0 5px ${alpha(theme.palette.primary.main, 0.7)});
    animation: psFlowFull 2s linear infinite;
    opacity: 0;
    display: flex;
  }
  .flowline {
    position: absolute;
    top: 34.5px;
    left: 4%;
    right: 4%;
    height: 3px;
    border-radius: 2px;
    background: ${theme.palette.primary.main};
    transform: scaleX(0);
    transform-origin: left;
  }
  .doneCheck {
    position: absolute;
    top: 12px;
    left: 85%;
    transform: translateX(-50%);
    color: ${theme.palette.primary.main};
    opacity: 0;
    transition: opacity 300ms ease 400ms;
  }
  .gatePulse {
    position: absolute;
    top: 22px;
    left: 50%;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    transform: translate(-50%, 0);
    opacity: 0;
  }

  @keyframes psFlowFull {
    0% { transform: translateX(-10px); opacity: 0; }
    8% { opacity: 1; }
    92% { opacity: 1; }
    100% { transform: translateX(268px); opacity: 0; }
  }
  @keyframes psFlowHalf {
    0% { transform: translateX(-10px); opacity: 0; }
    10% { opacity: 1; }
    85% { opacity: 1; transform: translateX(126px); }
    100% { opacity: 0; transform: translateX(130px); }
  }
  @keyframes psGatePulse {
    0% { transform: translate(-50%, 0) scale(1); opacity: 0.6; }
    70%, 100% { transform: translate(-50%, 0) scale(1.7); opacity: 0; }
  }
  @keyframes psGrow {
    to { transform: scaleX(1); }
  }

  .gateReached { background: ${theme.palette.primary.main}; }

  &[data-phase="preparing"] {
    .dot { animation-name: psFlowHalf; animation-duration: 3.4s; }
    .gate1 { background: ${theme.palette.primary.main}; }
  }
  &[data-phase="awaiting-signature"] {
    .dot { animation-name: psFlowHalf; animation-duration: 3.4s; animation-play-state: paused; opacity: 0.7; }
    .gate1, .gate2 { background: ${theme.palette.primary.main}; }
    .gatePulse { animation: psGatePulse 1.5s ease-out infinite; }
  }
  &[data-phase="relaying"] {
    .dot { animation-duration: 1.3s; }
    .boltDot { opacity: 1; }
    .gate1, .gate2, .gate3 { background: ${theme.palette.primary.main}; }
  }
  &[data-phase="success"] {
    .dot, .boltDot { display: none; }
    .gate1, .gate2, .gate3 { background: ${theme.palette.primary.main}; }
    .flowline { animation: psGrow 600ms ease-out 1 forwards; }
    .doneCheck { opacity: 1; }
  }
  &[data-phase="fallback"] {
    opacity: 0.55;
    .dot { animation-play-state: paused; background: ${theme.palette.text.disabled}; }
  }
  &[data-phase="relay-status-unknown"] {
    opacity: 0.75;
    .dot { animation-duration: 6s; }
    .gate1, .gate2 { background: ${theme.palette.primary.main}; }
  }
`
);

const PARTICLE_COUNT = 7;

const ParticleStreamLoader: FC<{ phase: SimPhase }> = ({ phase }) => (
  <ParticleRoot data-phase={phase}>
    <Box className="gate gate1" sx={{ left: "15%" }} />
    <Box className="gate gate2" sx={{ left: "50%" }} />
    <Box className="gate gate3" sx={{ left: "85%" }} />
    <Box className="gatePulse" />
    {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
      <Box
        key={i}
        className="dot"
        style={{
          animationDelay: `${(-i * 2.8) / PARTICLE_COUNT}s`,
          marginTop: (i % 3) * 5 - 5,
        }}
      />
    ))}
    <Box className="boltDot" style={{ animationDelay: "-0.6s" }}>
      <BoltRoundedIcon fontSize="small" />
    </Box>
    <Box className="flowline" />
    <CheckRoundedIcon className="doneCheck" fontSize="small" />
  </ParticleRoot>
);

// ---------------------------------------------------------------------------------------
// Page scaffolding: mock dialog wrapper, variant cards, global phase controls.
// ---------------------------------------------------------------------------------------

interface VariantDefinition {
  name: string;
  blurb: string;
  cost: "low" | "medium" | "high";
  copy: Record<SimPhase, PhaseCopy>;
  showTips: boolean;
  render: (phase: SimPhase) => ReactNode;
}

const VARIANTS: VariantDefinition[] = [
  {
    name: "0 · Baseline (current)",
    blurb: "What ships today — plain spinner and per-phase headline, for comparison.",
    cost: "low",
    copy: CURRENT_COPY,
    showTips: false,
    render: (phase) => <BaselineVisual phase={phase} />,
  },
  {
    name: "0b · Baseline + bolt core",
    blurb:
      "Minimal delta: today's spinner with the relay bolt at its center. On success the ring spins shut into the badge and the bolt pops into the arrow; the bolt disappears on fallback.",
    cost: "low",
    copy: CURRENT_COPY,
    showTips: false,
    render: (phase) => <BoltSpinnerVisual phase={phase} />,
  },
  {
    name: "0c · Bolt core + liquid fill",
    blurb:
      "0b's spinner, but the center bolt fills like the Liquid Bolt through the phases — half while preparing, breathing at the signature, snapping full on relay. Same ring-close success.",
    cost: "medium",
    copy: CURRENT_COPY,
    showTips: false,
    render: (phase) => <BoltFillSpinnerVisual phase={phase} />,
  },
  {
    name: "1 · Live Current Pipeline",
    blurb:
      "One pipe, three nodes. The current flows to the active step, pools for your signature, then a bolt rides the relay leg.",
    cost: "medium",
    copy: PROPOSED_COPY,
    showTips: true,
    render: (phase) => <PipelineLoader phase={phase} />,
  },
  {
    name: "2 · Superfluid Current Ring",
    blurb:
      "Droplets orbiting a bolt in an open ring — calm, breathing, fast, then the ring closes. Drop-in for the 80px spinner slot.",
    cost: "low",
    copy: PROPOSED_COPY,
    showTips: true,
    render: (phase) => <CurrentRingLoader phase={phase} />,
  },
  {
    name: "3 · Liquid Bolt Fill",
    blurb:
      "The chip strip’s bolt fills with flowing liquid, holds at a threshold for the signature, and snaps full on relay. Success pops the bolt and draws a ring badge around it.",
    cost: "medium",
    copy: PROPOSED_COPY,
    showTips: true,
    render: (phase) => <LiquidBoltLoader phase={phase} />,
  },
  {
    name: "4 · Bolt Baton Relay",
    blurb:
      "The bolt as a baton: Dashboard → You → Relay. It waits in your hand, then overshoots into the relay station.",
    cost: "medium",
    copy: PROPOSED_COPY,
    showTips: true,
    render: (phase) => <BatonRelayLoader phase={phase} />,
  },
  {
    name: "5 · Checkpoint Log",
    blurb:
      "A mission console ticking only real events — honest progress without fake percentages. Pairs with any visual above.",
    cost: "low",
    copy: PROPOSED_COPY,
    showTips: false,
    render: (phase) => <CheckpointLogLoader phase={phase} />,
  },
  {
    name: "6 · Particle Stream",
    blurb:
      "A current of droplets through three gates. It literally pauses while the signature is yours; a bright bolt rides the relay leg.",
    cost: "low",
    copy: PROPOSED_COPY,
    showTips: true,
    render: (phase) => <ParticleStreamLoader phase={phase} />,
  },
];

const VariantCard: FC<{
  variant: VariantDefinition;
  phase: SimPhase;
  tip: string;
}> = ({ variant, phase, tip }) => {
  const copy = variant.copy[phase];
  return (
    <Paper variant="outlined" sx={{ borderRadius: "20px", overflow: "hidden" }}>
      <Stack sx={{ px: 3, py: 2 }} gap={0.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{variant.name}</Typography>
          <Chip
            size="small"
            variant="outlined"
            label={`build cost: ${variant.cost}`}
            sx={{ color: "text.secondary" }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {variant.blurb}
        </Typography>
      </Stack>
      <Divider />
      {/* Mock of the real TransactionDialog loading layout. */}
      <Stack
        spacing={1}
        alignItems="center"
        textAlign="center"
        sx={{ px: 3, py: 4, minHeight: 330 }}
      >
        <Box
          sx={{
            height: 170,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {variant.render(phase)}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          {copy.headline}
        </Typography>
        {copy.subline && (
          <Typography variant="body2" color="text.secondary">
            {copy.subline}
          </Typography>
        )}
        {variant.showTips && phase === "relaying" && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic", pt: 1 }}
          >
            Tip: {tip}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

const DevRelayLoadersPage: NextPage = () => {
  const [phase, setPhase] = useState<SimPhase>("preparing");
  const [autoPlay, setAutoPlay] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    const index = AUTO_PLAY_SEQUENCE.findIndex((step) => step.phase === phase);
    const current = AUTO_PLAY_SEQUENCE[index === -1 ? 0 : index];
    const next = AUTO_PLAY_SEQUENCE[(Math.max(index, 0) + 1) % AUTO_PLAY_SEQUENCE.length];
    const timeout = setTimeout(() => setPhase(next.phase), current.durationMs);
    return () => clearTimeout(timeout);
  }, [autoPlay, phase]);

  useEffect(() => {
    if (phase !== "relaying") return;
    const interval = setInterval(() => setTipIndex((i) => i + 1), 4000);
    return () => clearInterval(interval);
  }, [phase]);

  const tip = RELAY_TIPS[tipIndex % RELAY_TIPS.length];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack gap={1} sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1">
          Relay loading-state lab
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Temporary prototype page for choosing the Clear Macro relay loading
          animation — not linked from the nav; delete after a concept is picked.
          The final implementation will respect <code>prefers-reduced-motion</code>.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: "16px",
          px: 2,
          py: 1.5,
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          position: "sticky",
          top: 8,
          zIndex: 2,
          backgroundColor: "background.paper",
        }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={phase}
          onChange={(_event, value: SimPhase | null) => {
            if (value) {
              setAutoPlay(false);
              setPhase(value);
            }
          }}
          sx={{ flexWrap: "wrap" }}
        >
          {PHASE_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={autoPlay}
              onChange={(_event, checked) => setAutoPlay(checked)}
            />
          }
          label={<Typography variant="body2">Auto-play the happy path</Typography>}
        />
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {VARIANTS.map((variant) => (
          <VariantCard key={variant.name} variant={variant} phase={phase} tip={tip} />
        ))}
      </Box>
    </Container>
  );
};

export default DevRelayLoadersPage;
