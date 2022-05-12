import { IconButton, Tooltip } from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { useRouter } from "next/router";
import { FC } from "react";
import ReplayIcon from "@mui/icons-material/Replay";

export const TransactionListItemRestoreButton: FC<{
  transaction: TrackedTransaction;
}> = ({ transaction }) => {
  const router = useRouter();

  if (!transaction.extraData.restoration) {
    return null;
  }

  switch (transaction.title) {
    case "Create Stream":
    case "Downgrade from Super Token":
    case "Upgrade to Super Token":
      return (
        <Tooltip title="Restore">
          <IconButton
            color="primary"
            onClick={async () => {
              await router.push(
                `/restore-transaction?hash=${transaction.hash}`
              );
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
