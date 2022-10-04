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
import TransactionDialogErrorAlert from "../transactions/TransactionDialogErrorAlert";
import { FC, PropsWithChildren, ReactNode } from "react";
import { useTransactionBoundary } from "./TransactionBoundary";
import ResponsiveDialog from "../common/ResponsiveDialog";
import React from "react";
import { supportId } from "../../components/MonitorContext/MonitorContext";
import { useConnectionBoundary } from "./ConnectionBoundary";

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
      onClose={closeDialog}
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
                Waiting for transaction approval...
              </span>{" "}
              <span data-cy="tx-network" translate="no">
                ({expectedNetwork.name})
              </span>
            </Typography>
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
    <Stack component={DialogContent} sx={{ p: 4 }}>
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

const OutlineIcon = styled(Avatar)(({ theme }) => ({
  borderRadius: "50%",
  border: `5px solid ${theme.palette.primary.main}`,
  width: 80,
  height: 80,
  background: "transparent",
}));
