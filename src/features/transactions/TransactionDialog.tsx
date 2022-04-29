import { FC } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  DialogActions,
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

export const TransactionDialog: FC<{
  open: boolean;
  onClose: () => void;
  mutationResult: UnknownMutationResult;
}> = ({ open, onClose, mutationResult, children }) => {
  const { network } = useNetworkContext();

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {mutationResult.isError ? "Error" : <>&nbsp;</>}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          {mutationResult.isError ? (
            <Alert severity="error" sx={{ wordBreak: "break-word" }}>
              {mutationResult.error?.message}
            </Alert>
          ) : (
            <>
              <Typography>
                {mutationResult.isSuccess ? (
                  <ArrowUpwardRoundedIcon />
                ) : (
                  <CircularProgress />
                )}
              </Typography>
              {!mutationResult.isSuccess && (
                <Typography>
                  Waiting for transaction approval... ({network.displayName})
                </Typography>
              )}
              <Stack sx={{ my: 2 }}>
                {" "}
                {mutationResult.isSuccess
                  ? "Transaction broadcasted"
                  : children}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {mutationResult.isSuccess && (
          <Button
            color="primary"
            variant="contained"
            fullWidth={true}
            onClick={onClose}
          >
            OK
          </Button>
        )}
      </DialogActions>
    </ResponsiveDialog>
  );
};
