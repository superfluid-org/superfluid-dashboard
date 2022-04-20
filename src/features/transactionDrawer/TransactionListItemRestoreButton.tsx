import { Button } from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { useRouter } from "next/router";
import { FC } from "react";
import { useTransactionRestorationContext } from "../transactionRestoration/TransactionRestorationContext";

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
        <Button
          variant="outlined"
          onClick={async () => {
            restoreTransaction(transaction);
            await router.push("/wrap?downgrade");
          }}
        >
          Restore
        </Button>
      );
    case "Upgrade to Super Token":
      return (
        <Button
          variant="outlined"
          onClick={async () => {
            restoreTransaction(transaction);
            await router.push("/wrap?upgrade");
          }}
        >
          Restore
        </Button>
      );
    default:
      return null;
  }
};
