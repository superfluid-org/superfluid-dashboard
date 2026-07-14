import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { Box } from "@mui/material";
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
 * The transaction progress visual: a spinner arc with a narrating center icon — bolt
 * (relay working) → wallet (act in your wallet, breathing for urgency) → bolt (relaying)
 * → arrow (done). Plain writes skip the bolt and hold the breathing wallet for their
 * whole loading window. On success the SAME arc spins shut into the success badge with a
 * ripple; that seamless close is why this is one component across the dialog's loading
 * and success branches (kept at the same tree position so the DOM survives the branch
 * switch): the arc's stroke matches the success badge's border.
 */
const Root = styled("div")(
  ({ theme }) => `
  position: relative;
  width: 80px;
  height: 80px;

  svg { overflow: visible; display: block; }
  .spinGroup {
    transform-box: view-box;
    transform-origin: center;
    animation: txSpin 1.4s linear infinite;
  }
  .arc {
    fill: none;
    stroke: ${theme.palette.primary.main};
    stroke-width: 5;
    stroke-linecap: round;
    /* Circumference of r=37.5 is ~235.6 — a 70% arc while loading. */
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
  .boltIcon { opacity: 0; transform: scale(0.4); transition: opacity 250ms ease, transform 250ms ease; }
  .walletIcon, .arrowIcon { opacity: 0; transform: scale(0.4); }
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${theme.palette.primary.main};
    opacity: 0;
  }

  @keyframes txSpin {
    to { transform: rotate(360deg); }
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
    0% { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.45); opacity: 0; }
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
  &[data-phase="success"] {
    /* The spin keeps running — a closed ring rotating is invisible, and NOT cancelling
       it avoids an angle jump at the moment the arc snaps shut. */
    .arc { animation: txRingClose 350ms ease-out 1 forwards; }
    .arrowIcon { animation: txIconPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms 1 forwards; }
    .ripple { animation: txRipple 900ms ease-out 200ms 1 forwards; }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Keep only the essential "in progress" motion, slowed; state changes become plain
       opacity swaps with no pops, breathing, or ripple. */
    .spinGroup { animation-duration: 4s; }
    .boltIcon, .walletIcon, .arrowIcon { transition: opacity 250ms ease; }
    &[data-phase="awaiting-signature"] .walletIcon,
    &[data-phase="awaiting-approval"] .walletIcon { animation: none; opacity: 1; transform: none; }
    &[data-phase="success"] {
      .spinGroup { animation: none; }
      .arc { animation: none; stroke-dasharray: 236 0; }
      .arrowIcon { animation: none; opacity: 1; transform: none; }
      .ripple { animation: none; }
    }
  }
`
);

export const TransactionProgressIndicator: FC<{
  phase: TransactionProgressPhase;
}> = ({ phase }) => (
  <Root
    data-phase={phase}
    data-cy={
      phase === "success" ? "broadcasted-icon" : "transaction-progress-indicator"
    }
    sx={phase === "success" ? undefined : { mb: 4 }}
  >
    <svg viewBox="0 0 80 80" width={80} height={80} aria-hidden="true">
      <g className="spinGroup">
        <circle className="arc" cx="40" cy="40" r="37.5" />
      </g>
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
