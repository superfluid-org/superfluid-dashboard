import { FC } from "react";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import UnknownMutationResult from "../../unknownMutationResult";
import { useNetworkContext } from "../network/NetworkContext";

export const TransactionDialog: FC<{
  open: boolean;
  onClose: () => void;
  mutationResult: UnknownMutationResult;
}> = ({ open, onClose, mutationResult, children }) => {
  const theme = useTheme();
  const { network } = useNetworkContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={onClose}
    >
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
    </Dialog>
  );
};
