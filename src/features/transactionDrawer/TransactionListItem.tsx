import {
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { FC, useMemo } from "react";
import shortenAddress from "../../utils/shortenAddress";
import { TransactionListItemAvatar } from "./TransactionListItemAvatar";
import { TransactionListItemRestoreButton } from "./TransactionListItemRestoreButton";

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const shortenedHash = useMemo(
    () => shortenAddress(transaction.hash),
    [transaction]
  );

  return (
    <ListItem button sx={{ cursor: "default" }}>
      <ListItemAvatar>
        <TransactionListItemAvatar
          transaction={transaction}
        ></TransactionListItemAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={transaction.title}
        secondary={
          <>
            {transaction.status === "Pending" && <LinearProgress />}
            <Typography
              sx={{ display: "block" }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {shortenedHash}
            </Typography>
            {/* transaction.status === "Failed" &&  */}
          </>
        }
      ></ListItemText>
      <TransactionListItemRestoreButton
        transaction={transaction}
      ></TransactionListItemRestoreButton>
    </ListItem>
  );
};

export default TransactionListItem;
