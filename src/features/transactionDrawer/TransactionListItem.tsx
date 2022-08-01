import {
  Box,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  TrackedTransaction,
  TransactionStatus,
} from "@superfluid-finance/sdk-redux";
import { format } from "date-fns";
import { FC } from "react";
import shortenHex from "../../utils/shortenHex";
import NetworkBadge from "../network/NetworkBadge";
import { findNetworkByChainId } from "../network/networks";
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
  const theme = useTheme();
  const network = findNetworkByChainId(transaction.chainId);

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
            <Stack direction="row" gap={0.5} component="span">
              <Box
                component="span"
                color={getTransactionStatusColor(transaction.status)}
              >
                {`${format(transaction.timestampMs, "d MMM")} •`}
              </Box>
              <Box component="span">{shortenHex(transaction.hash)}</Box>
            </Stack>
          </>
        }
      />
      <TransactionListItemRestoreButton transaction={transaction} />
      {network && (
        <NetworkBadge
          network={network}
          sx={{ position: "absolute", top: 0, right: theme.spacing(1) }}
          NetworkIconProps={{ size: 18, fontSize: 12 }}
          TooltipProps={{
            placement: "top-start",
          }}
        />
      )}
    </ListItem>
  );
};

export default TransactionListItem;
