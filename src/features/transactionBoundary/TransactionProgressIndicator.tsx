import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC } from "react";
import { RelayPhase } from "../../MutationResult";

/**
 * The phases this indicator renders. The relay's in-flight phases show the bolt;
 * "awaiting-signature" (relay) and "awaiting-approval" (a plain write waiting for the
 * wallet confirmation, including a relay fallback) look IDENTICAL — both mean "act in
 * your wallet". "relay-status-unknown" is deliberately excluded: the dialog keeps its
 * sober hourglass there.
 */
export type TransactionProgressPhase =
  | Extract<RelayPhase, "preparing" | "awaiting-signature" | "relaying">
  | "awaiting-approval"
  | "success";

/**
 * Reduced-motion variant of the choreography: opacity-only crossfades, a statically
 * closed ring, and no ripples or scale movement. Written as a fragment with `&`-based
 * selectors so it can apply under BOTH the prefers-reduced-motion media query and the
 * data-force-reduced-motion attribute (the dev rehearsal page's toggle — a media query
 * can't be flipped from JS). Must stay LAST in the Root template: several of these rules
 * tie on specificity with the normal-motion rules and win by source order.
 */
const reducedMotionCss = `
  .spinner { transition: opacity 300ms ease; }
  .closeRing { transition: opacity 300ms ease; stroke-dasharray: 236 0; }
  .boltIcon, .walletIcon, .arrowIcon { transition: opacity 300ms ease; transform: none; }
  &[data-phase="awaiting-signature"] .walletIcon,
  &[data-phase="awaiting-approval"] .walletIcon { animation: none; opacity: 1; }
  &[data-phase="success"] {
    .closeRing { animation: none; opacity: 1; }
    .arrowIcon { animation: none; opacity: 1; }
    .ripple { animation: none; }
  }
`;

/**
 * The transaction progress visual: the dialog's original MUI CircularProgress with a
 * narrating center icon — bolt (relay working) → wallet (act in your wallet, breathing
 * for urgency) → bolt (relaying) → arrow (done). Plain writes skip the bolt and hold the
 * breathing wallet for their whole loading window. On success the spinner cross-fades
 * into a ring that sweeps shut into the success badge at the spinner's own stroke weight
 * (~6.5px) while the arrow pops in and a green ripple fires. This is one
 * component across the dialog's loading and success branches (kept at the same tree
 * position so the DOM survives the branch switch) to keep that hand-off seamless.
 *
 * NOTE: the ripple overshoots the 80px box by up to 20px per side (scale 1.5) — the
 * consumer must leave that much headroom against clipping ancestors (DialogContent is a
 * scroll container). The dialog does this with a padded wrapper Box.
 */
const Root = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 80px;
  height: 80px;

  .spinner { transition: opacity 200ms ease; }
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
    /* Start the sweep from 12 o'clock. */
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
  .boltIcon { opacity: 0; transform: scale(0.4); transition: opacity 250ms ease, transform 250ms ease; }
  .walletIcon, .arrowIcon { opacity: 0; transform: scale(0.4); }
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    opacity: 0;
  }

  @keyframes txRingClose {
    to { stroke-dasharray: 236 0; }
  }
  @keyframes txIconPop {
    0% { opacity: 0; transform: scale(0.4); }
    60% { opacity: 1; transform: scale(1.18); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes txWalletBreathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.12); }
  }
  @keyframes txRipple {
    0% { transform: scale(0.9); opacity: 0.7; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  &[data-phase="preparing"], &[data-phase="relaying"] {
    .boltIcon { opacity: 1; transform: scale(1); }
  }
  /* Your move: the wallet breathes until the user acts. Identical for the relay's
     signature prompt and a plain write's wallet confirmation. */
  &[data-phase="awaiting-signature"], &[data-phase="awaiting-approval"] {
    .walletIcon {
      animation:
        txIconPop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) 1 forwards,
        txWalletBreathe 1.8s ease-in-out 500ms infinite;
    }
  }
  /* The beat: ring sweeps shut (0–420ms), arrow pops (220–670ms), the ripple fires as
     the ring lands (320ms). The dialog delays its text/actions entrance past this so
     the badge leads. */
  &[data-phase="success"] {
    .spinner { opacity: 0; }
    .closeRing { opacity: 1; animation: txRingClose 420ms ease-out 1 forwards; }
    .arrowIcon { animation: txIconPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 220ms 1 forwards; }
    .ripple { animation: txRipple 900ms ease-out 320ms 1 forwards; }
  }

  @media (prefers-reduced-motion: reduce) {
    ${reducedMotionCss}
  }
  &[data-force-reduced-motion="true"] {
    ${reducedMotionCss}
  }
`
);

export const TransactionProgressIndicator: FC<{
  phase: TransactionProgressPhase;
  /** Lab-only escape hatch: applies the reduced-motion styles regardless of the media query. */
  forceReducedMotion?: boolean;
}> = ({ phase, forceReducedMotion }) => (
  <Root
    data-phase={phase}
    data-force-reduced-motion={forceReducedMotion ? "true" : undefined}
    data-cy={
      phase === "success" ? "broadcasted-icon" : "transaction-progress-indicator"
    }
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
    <Box className="icon walletIcon">
      <AccountBalanceWalletRoundedIcon sx={{ fontSize: 30 }} />
    </Box>
    <Box className="icon arrowIcon">
      <ArrowUpwardRoundedIcon fontSize="large" />
    </Box>
  </Root>
);
