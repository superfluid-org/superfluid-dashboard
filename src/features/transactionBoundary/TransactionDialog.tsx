import {
  Avatar,
  Box,
  Button,
  ButtonProps,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import TransactionDialogErrorAlert from "../transactions/TransactionDialogErrorAlert";
import { FC, PropsWithChildren, ReactNode } from "react";
import { TransactionProgressIndicator } from "./TransactionProgressIndicator";
import { useTransactionBoundary } from "./TransactionBoundary";
import ResponsiveDialog from "../common/ResponsiveDialog";
import AnimatedHeight from "../common/AnimatedHeight";
import React from "react";
import { useConnectionBoundary } from "./ConnectionBoundary";
import { supportId } from "../analytics/useAppInstanceDetails";

const successRevealRise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`;
const successRevealFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Entrance for the success branch's text and actions: held invisible through a short
 * delay (the "both" fill) so the badge's ring-close leads the beat, then fades/rises in.
 * Reduced motion drops the rise; data-force-reduced-motion is the dev rehearsal page's
 * hook for previewing that without the media query. Exported for that page.
 *
 * Object styles on purpose: Emotion only resolves keyframes objects interpolated into
 * `animation`/`animationName` VALUES — in a plain template string they stringify to an
 * _EMO_ sentinel that leaks into the CSS in production.
 */
export const SuccessReveal = styled("div", {
  shouldForwardProp: (prop) => prop !== "delayMs",
})<{ delayMs?: number }>(({ theme, delayMs = 0 }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "inherit",
  gap: theme.spacing(1),
  animation: `${successRevealRise} 300ms ease-out ${delayMs}ms both`,
  "@media (prefers-reduced-motion: reduce)": {
    animationName: `${successRevealFade}`,
  },
  '&[data-force-reduced-motion="true"]': {
    animationName: `${successRevealFade}`,
  },
}));

interface TransactionDialogProps {
  children: ReactNode;
  loadingInfo: ReactNode;
  successActions: ReactNode;
}

export const TransactionDialog: FC<TransactionDialogProps> = ({
  children,
  loadingInfo,
  successActions,
}) => {
  const { dialogOpen, closeDialog } = useTransactionBoundary();
  const theme = useTheme();
  // Keep in sync with ResponsiveDialog's fullScreen switch: there the paper's height is
  // viewport-fixed, so animating the content height would only detach the actions from
  // the bottom.
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ResponsiveDialog
      open={dialogOpen}
      onClose={(_event, reason) => {
        if (reason !== "backdropClick") {
          closeDialog();
        }
      }}
      PaperProps={{
        // overflow hidden: the paper never scrolls itself (DialogContent does), and its
        // default overflow-y: auto would flash a scrollbar whenever an entrance/ripple
        // transform momentarily extends the scrollable overflow past the paper's edge.
        sx: { borderRadius: "20px", maxHeight: "100%", overflow: "hidden" },
      }}
      translate="yes"
    >
      <AnimatedHeight disableAnimation={fullScreen}>
        <TransactionDialogCore
          loadingInfo={loadingInfo}
          successActions={successActions}
        >
          {children}
        </TransactionDialogCore>
      </AnimatedHeight>
    </ResponsiveDialog>
  );
};

export const TransactionDialogCore: FC<TransactionDialogProps> = ({
  children,
  successActions,
  loadingInfo,
}) => {
  const { mutationResult, closeDialog } = useTransactionBoundary();
  const { expectedNetwork } = useConnectionBoundary();

  // The relay's in-flight phases show the bolt; everything else that is loading — a plain
  // write or a relay fallback — is waiting for the wallet confirmation, which renders
  // identically to the relay's signature wait (breathing wallet). The success branch
  // reuses the SAME component at the SAME tree position — including the identical padded
  // wrapper Box at the Stack's first slot — so the ring closes into the success badge
  // without remounting. The wrapper's padding (NOT margin: this Stack uses `spacing`,
  // whose child-margin reset beats sx margins) gives the success ripples headroom against
  // DialogContent's clip edge, whose padding-top is 0 under a DialogTitle.
  const loadingVisualPhase =
    mutationResult.relayPhase === "preparing" ||
    mutationResult.relayPhase === "awaiting-signature" ||
    mutationResult.relayPhase === "relaying"
      ? mutationResult.relayPhase
      : "awaiting-approval";

  if (mutationResult.isLoading) {
    // The Clear Macro relay path has phases a plain broadcast doesn't — narrate them.
    const loadingHeadline =
      mutationResult.relayPhase === "preparing"
        ? "Preparing gasless transaction..."
        : mutationResult.relayPhase === "awaiting-signature"
          ? "Waiting for your signature..."
          : mutationResult.relayPhase === "relaying"
            ? "Submitting your transaction..."
            : "Waiting for transaction approval...";

    return (
      <>
        <TransactionDialogTitle></TransactionDialogTitle>
        <TransactionDialogContent>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box sx={{ pt: 3, pb: 3 }}>
              <TransactionProgressIndicator phase={loadingVisualPhase} />
            </Box>
            <Typography variant="h4">
              <span data-cy="approval-message" translate="yes">
                {loadingHeadline}
              </span>{" "}
              <span data-cy="tx-network" translate="no">
                ({expectedNetwork.name})
              </span>
            </Typography>
            {mutationResult.relayPhase === "fallback" && (
              <Typography
                data-cy={"relay-fallback-message"}
                variant="body2"
                color="text.secondary"
                translate="yes"
              >
                Gasless sending isn&apos;t available right now. This transaction
                will use regular network fees.
              </Typography>
            )}
            {/* // TODO(KK): wrong font! */}
            <Stack sx={{ pt: 2 }}>{loadingInfo}</Stack>
          </Stack>
        </TransactionDialogContent>
      </>
    );
  }

  if (mutationResult.isSuccess) {
    return (
      <>
        <TransactionDialogTitle></TransactionDialogTitle>
        <TransactionDialogContent>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box sx={{ pt: 3, pb: 1 }}>
              <TransactionProgressIndicator phase="success" />
            </Box>
            <SuccessReveal delayMs={150}>
              <Typography
                data-cy={"broadcasted-message"}
                variant="h4"
                color="text.secondary"
              >
                Transaction broadcasted
              </Typography>
              {mutationResult.relayPhase === "relaying" && (
                <Typography
                  data-cy={"relayed-message"}
                  variant="body2"
                  color="text.secondary"
                  translate="yes"
                >
                  Sent gaslessly, no network fee paid.
                </Typography>
              )}
            </SuccessReveal>
          </Stack>
        </TransactionDialogContent>
        <SuccessReveal delayMs={280}>
          {successActions ?? (
            <TransactionDialogActions>
              <TransactionDialogButton
                data-cy={"ok-button"}
                onClick={closeDialog}
              >
                OK
              </TransactionDialogButton>
            </TransactionDialogActions>
          )}
        </SuccessReveal>
      </>
    );
  }

  // Distinct from a hard error: the signed gasless payload was accepted but the 120s poll timed
  // out, so the outcome is unknown (the tx may still land). Coincides with `isError`, so this
  // branch must precede it. The background poller keeps resolving it and tracks a late success.
  if (mutationResult.relayPhase === "relay-status-unknown") {
    const executionId = mutationResult.relayStatusUnknown?.executionId;
    return (
      <>
        <TransactionDialogTitle>Still confirming</TransactionDialogTitle>
        <TransactionDialogContent>
          <Stack gap={2} alignItems="center" textAlign="center">
            <OutlineIcon data-cy={"relay-status-unknown-icon"}>
              <HourglassEmptyRoundedIcon fontSize="large" color="primary" />
            </OutlineIcon>
            <Typography
              data-cy={"relay-status-unknown-message"}
              variant="h5"
              translate="yes"
            >
              Your gasless transaction is still being confirmed
            </Typography>
            <Typography variant="body2" color="text.secondary" translate="yes">
              You signed it and we sent it to the relay, but couldn&apos;t confirm
              it within the time limit. It may still complete. We&apos;ll keep
              checking, and it will appear in your transactions if it succeeds.
              Please don&apos;t retry.
            </Typography>
            {executionId && (
              <Typography
                data-cy={"relay-status-unknown-execution-id"}
                variant="body2"
                color="text.secondary"
                translate="no"
              >
                Execution ID: {executionId}
              </Typography>
            )}
          </Stack>
        </TransactionDialogContent>
        <TransactionDialogActions>
          <TransactionDialogButton
            data-cy={"relay-status-unknown-close"}
            onClick={closeDialog}
          >
            Close
          </TransactionDialogButton>
        </TransactionDialogActions>
      </>
    );
  }

  if (mutationResult.isError) {
    return (
      <>
        <TransactionDialogTitle>Error</TransactionDialogTitle>
        <TransactionDialogContent>
          <Stack gap={3} alignItems="center">
            <TransactionDialogErrorAlert mutationError={mutationResult.error} />
            <Typography variant="body2">Support ID: {supportId}</Typography>
          </Stack>
        </TransactionDialogContent>
        <TransactionDialogActions>
          <TransactionDialogButton onClick={closeDialog}>
            Dismiss
          </TransactionDialogButton>
        </TransactionDialogActions>
      </>
    );
  }

  return <>{children}</>;
};

export const TransactionDialogTitle: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const { closeDialog } = useTransactionBoundary();

  return (
    <Stack component={DialogTitle} sx={{ p: 4 }}>
      {children}
      <IconButton
        aria-label="close"
        onClick={closeDialog}
        sx={{
          position: "absolute",
          right: theme.spacing(3),
          top: theme.spacing(3),
        }}
      >
        <CloseIcon data-cy="close-icon" />
      </IconButton>
    </Stack>
  );
};

export const TransactionDialogContent: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Stack data-cy={"dialog-content"} component={DialogContent} sx={{ p: 4 }}>
      {children}
    </Stack>
  );
};

export const TransactionDialogActions: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Stack component={DialogActions} spacing={1} sx={{ p: 3, pt: 0 }}>
      {children}
    </Stack>
  );
};

export const TransactionDialogButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function ForwardedTransactionDialogButton(props, ref) {
  return (
    <Button ref={ref} fullWidth variant="contained" size="xl" {...props}>
      {props.children}
    </Button>
  );
});

export const OutlineIcon = styled(Avatar)(({ theme }) => ({
  borderRadius: "50%",
  border: `5px solid ${theme.palette.primary.main}`,
  width: 80,
  height: 80,
  background: "transparent",
}));
