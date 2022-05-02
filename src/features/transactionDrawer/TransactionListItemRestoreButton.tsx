import { IconButton, Tooltip } from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { useRouter } from "next/router";
import { FC } from "react";
import { useTransactionRestorationContext } from "../transactionRestoration/TransactionRestorationContext";
import ReplayIcon from "@mui/icons-material/Replay";

export const TransactionListItemRestoreButton: FC<{
  transaction: TrackedTransaction;
}> = ({ transaction }) => {
  const router = useRouter();
  const { restoreTransaction } = useTransactionRestorationContext();

  if (!transaction.extraData.restoration) {
    return null;
  }

  switch (transaction.title) {
    case "Downgrade from Super Token":
      return (
        <Tooltip title="Restore">
          <IconButton
            color="primary"
            onClick={async () => {
              restoreTransaction(transaction);
              await router.push("/wrap?downgrade");
            }}
          >
            <ReplayIcon />
          </IconButton>
        </Tooltip>
      );
    case "Upgrade to Super Token":
      return (
        <Tooltip title="Restore">
          <IconButton
            color="primary"
            onClick={async () => {
              restoreTransaction(transaction);
              await router.push("/wrap?upgrade");
            }}
          >
            <ReplayIcon />
          </IconButton>
        </Tooltip>
      );
    default:
      return null;
  }
};
