import {
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  TrackedTransaction,
  TransactionStatus,
} from "@superfluid-finance/sdk-redux";
import { format } from "date-fns";
import { FC, useMemo } from "react";
import shortenAddress from "../../utils/shortenAddress";
import { TransactionListItemAvatar } from "./TransactionListItemAvatar";
import { TransactionListItemRestoreButton } from "./TransactionListItemRestoreButton";

export const getTransactionStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case "Pending":
      return "warning.main";
    case "Succeeded":
      return "primary.main";
    case "Failed":
      return "error.dark";
    default:
      return "text.secondary";
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  // This seems to be a little overkill :D
  const shortenedHash = useMemo(
    () => shortenAddress(transaction.hash),
    [transaction]
  );

  return (
    <ListItem button sx={{ cursor: "default" }}>
      <ListItemAvatar>
        <TransactionListItemAvatar status={transaction.status} />
      </ListItemAvatar>
      <ListItemText
        primary={transaction.title}
        secondary={
          <>
            {transaction.status === "Pending" && (
              <LinearProgress sx={{ height: 3 }} />
            )}
            <Stack direction="row" gap={0.5}>
              <Typography
                variant="body2"
                color={getTransactionStatusColor(transaction.status)}
              >
                {`${format(transaction.timestampMs, "d MMM")} •`}
              </Typography>
              <Typography variant="body2">{shortenedHash}</Typography>
            </Stack>
          </>
        }
      />
      <TransactionListItemRestoreButton transaction={transaction} />
    </ListItem>
  );
};

export default TransactionListItem;
