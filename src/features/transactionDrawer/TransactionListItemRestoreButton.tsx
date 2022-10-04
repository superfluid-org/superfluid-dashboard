import { IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { useRouter } from "next/router";
import { FC } from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import { useLayoutContext } from "../layout/LayoutContext";
import {
  RestorationType,
  TransactionRestorations,
} from "../transactionRestoration/transactionRestorations";

export const TransactionListItemRestoreButton: FC<{
  transaction: TrackedTransaction;
}> = ({ transaction }) => {
  const router = useRouter();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { setTransactionDrawerOpen } = useLayoutContext();

  if (!transaction.extraData.restoration) {
    return null;
  }

  const transactionRestoration = transaction?.extraData
    ?.restoration as TransactionRestorations;

  switch (transactionRestoration.type) {
    case RestorationType.Unwrap:
    case RestorationType.ModifyStream:
    case RestorationType.SendStream:
    case RestorationType.Wrap:
      if (transactionRestoration.version !== 2) return null;
  }

  const restoreTransaction = async () => {
    if (isBelowMd) setTransactionDrawerOpen(false);
    await router.push(`/restore-transaction?hash=${transaction.hash}`);
  };

  switch (transactionRestoration.type) {
    case RestorationType.Unwrap:
    case RestorationType.ModifyStream:
    case RestorationType.SendStream:
    case RestorationType.Wrap:
      return (
        <Tooltip title="Restore">
          <IconButton onClick={restoreTransaction}>
            <ReplayIcon />
          </IconButton>
        </Tooltip>
      );
    default:
      return null;
  }
};
