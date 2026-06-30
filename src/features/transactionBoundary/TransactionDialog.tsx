import {
  Avatar,
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import TransactionDialogErrorAlert from "../transactions/TransactionDialogErrorAlert";
import { FC, PropsWithChildren, ReactNode } from "react";
import { useTransactionBoundary } from "./TransactionBoundary";
import ResponsiveDialog from "../common/ResponsiveDialog";
import React from "react";
import { useConnectionBoundary } from "./ConnectionBoundary";
import { supportId } from "../analytics/useAppInstanceDetails";

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

  return (
    <ResponsiveDialog
      open={dialogOpen}
      onClose={(_event, reason) => {
        if (reason !== "backdropClick") {
          closeDialog();
        }
      }}
      PaperProps={{ sx: { borderRadius: "20px", maxHeight: "100%" } }}
      translate="yes"
    >
      <TransactionDialogCore
        loadingInfo={loadingInfo}
        successActions={successActions}
      >
        {children}
      </TransactionDialogCore>
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

  if (mutationResult.isLoading) {
    // The Clear Macro relay path has phases a plain broadcast doesn't — narrate them.
    const loadingHeadline =
      mutationResult.relayPhase === "preparing"
        ? "Preparing gasless transaction..."
        : mutationResult.relayPhase === "awaiting-signature"
          ? "Waiting for your signature..."
          : mutationResult.relayPhase === "relaying"
            ? "Relaying transaction..."
            : "Waiting for transaction approval...";

    return (
      <>
        <TransactionDialogTitle></TransactionDialogTitle>
        <TransactionDialogContent>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box sx={{ mb: 4 }}>
              <CircularProgress size={80} />
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
                Gasless relay unavailable — you&apos;ll pay network fees for this
                transaction.
              </Typography>
            )}
            {/* // TODO(KK): wrong font! */}
            <Stack sx={{ my: 2 }}>{loadingInfo}</Stack>
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
            <OutlineIcon data-cy={"broadcasted-icon"}>
              <ArrowUpwardRoundedIcon fontSize="large" color="primary" />
            </OutlineIcon>
            <Typography
              data-cy={"broadcasted-message"}
              sx={{ my: 2 }}
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
                Executed gaslessly via the Clear Macro relay.
              </Typography>
            )}
          </Stack>
        </TransactionDialogContent>
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
              it within the time limit. It may still complete — we&apos;ll keep
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
        <CloseIcon />
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
