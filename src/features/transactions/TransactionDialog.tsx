import { FC } from "react";
import {
    Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppSelector } from "../redux/store";
import { transactionsAdapter } from "@superfluid-finance/sdk-redux";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

export const TransactionDialog: FC<{
  open: boolean;
  onClose: () => void;
  transactionHash: string | undefined;
  infoText: string;
}> = ({ open, onClose, transactionHash, infoText }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const transaction = useAppSelector((state) =>
    transactionHash
      ? transactionsAdapter
          .getSelectors()
          .selectById(state.superfluid_transactions, transactionHash)
      : undefined
  ); // TODO(KK): "transactionsAdapter" not very good

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={onClose}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Transaction
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <Stack spacing={2}>
            <Alert severity="info">{infoText}</Alert>
            <Stack component={Typography} direction="row" justifyContent="center">
              {transaction ? (
                transaction.status === "Pending" ? (
                  <CircularProgress />
                ) : transaction.status === "Succeeded" ? (
                  <DoneIcon />
                ) : transaction.status === "Failed" ? (
                  <CloseIcon />
                ) : null
              ) : (
                <HourglassBottomIcon />
              )}
            </Stack>
            {!transaction && (
              <Typography>Waiting for transaction approval...</Typography>
            )}
          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
