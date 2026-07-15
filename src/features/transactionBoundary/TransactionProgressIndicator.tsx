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
 * The transaction progress visual: the dialog's original MUI CircularProgress with a
 * narrating center icon — bolt (relay working) → wallet (act in your wallet, breathing
 * for urgency) → bolt (relaying) → arrow (done). Plain writes skip the bolt and hold the
 * breathing wallet for their whole loading window. On success the spinner cross-fades
 * into a ring that sweeps shut into the success badge (its stroke narrowing from the
 * spinner's ~6.5px weight to the badge's 5px border) while the arrow pops in and a ripple
 * fires. This is one component across the dialog's loading and success branches (kept at
 * the same tree position so the DOM survives the branch switch) to keep that hand-off
 * seamless.
 */
const Root = styled("div")(
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
    to { stroke-dasharray: 236 0; stroke-width: 5; }
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
    .spinner { opacity: 0; }
    .closeRing { opacity: 1; animation: txRingClose 350ms ease-out 1 forwards; }
    .arrowIcon { animation: txIconPop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms 1 forwards; }
    .ripple { animation: txRipple 900ms ease-out 200ms 1 forwards; }
  }

  @media (prefers-reduced-motion: reduce) {
    /* State changes become plain opacity swaps with no pops, breathing, or ripple. (The
       MUI spinner keeps its own indeterminate motion, as it always has in this dialog.) */
    .boltIcon, .walletIcon, .arrowIcon { transition: opacity 250ms ease; }
    &[data-phase="awaiting-signature"] .walletIcon,
    &[data-phase="awaiting-approval"] .walletIcon { animation: none; opacity: 1; transform: none; }
    &[data-phase="success"] {
      .closeRing { animation: none; stroke-dasharray: 236 0; stroke-width: 5; }
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
