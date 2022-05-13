import { FC } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  DialogActions,
  DialogActionsProps,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import UnknownMutationResult from "../../unknownMutationResult";
import { useNetworkContext } from "../network/NetworkContext";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { styled, useTheme } from "@mui/system";

const OutlineIcon = styled(Avatar)(({ theme }) => ({
  borderRadius: "50%",
  border: `5px solid ${theme.palette.primary.main}`,
  width: 80,
  height: 80,
  background: "transparent",
}));

export const TransactionDialogButton: FC<ButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <Button fullWidth variant="contained" size="xl" {...(props ?? {})}>
      {children}
    </Button>
  );
};

export const TransactionDialogActions: FC<DialogActionsProps> = ({
  children,
  ...props
}) => {
  return (
    <Stack component={DialogActions} spacing={1} sx={{ p: 3, pt: 0 }} {...(props ?? {})}>
      {children}
    </Stack>
  );
};

export const TransactionDialog: FC<{
  open: boolean;
  onClose: () => void;
  mutationResult: UnknownMutationResult;
  label: React.ReactNode | null;
  successActions: ReturnType<typeof TransactionDialogActions>;
}> = ({ open, onClose, mutationResult, label, successActions }) => {
  const theme = useTheme();
  const { network } = useNetworkContext();

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <DialogTitle sx={{ p: 4 }}>
        {mutationResult.isError ? "Error" : <>&nbsp;</>}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={1} alignItems="center" textAlign="center">
          {mutationResult.isError ? (
            <Alert severity="error" sx={{ wordBreak: "break-word" }}>
              {mutationResult.error?.message}
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                {mutationResult.isSuccess ? (
                  <OutlineIcon>
                    <ArrowUpwardRoundedIcon fontSize="large" color="primary" />
                  </OutlineIcon>
                ) : (
                  <CircularProgress size={80} />
                )}
              </Box>

              {!mutationResult.isSuccess && (
                <Typography variant="h4">
                  Waiting for transaction approval... ({network.displayName})
                </Typography>
              )}

              <Stack sx={{ my: 2 }}>
                {mutationResult.isSuccess ? (
                  <Typography variant="h4" color="text.secondary">
                    Transaction broadcasted
                  </Typography>
                ) : (
                  label
                )}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      {mutationResult.isSuccess && !!successActions && successActions}
    </ResponsiveDialog>
  );
};
