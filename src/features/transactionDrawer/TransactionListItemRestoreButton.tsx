import { IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { useRouter } from "next/router";
import { FC } from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import { useLayoutContext } from "../layout/LayoutContext";
import {
  RestorationType,
  TransactionRestoration,
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
    ?.restoration as TransactionRestoration;

  switch (transactionRestoration.type) {
    case RestorationType.Downgrade:
    case RestorationType.Upgrade:
      if (transactionRestoration.version !== 2) return null;
  }

  const restoreTransaction = async () => {
    if (isBelowMd) setTransactionDrawerOpen(false);
    await router.push(`/restore-transaction?hash=${transaction.hash}`);
  };

  switch (transaction.title) {
    case "Create Stream":
    case "Update Stream":
    case "Downgrade from Super Token":
    case "Upgrade to Super Token":
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
