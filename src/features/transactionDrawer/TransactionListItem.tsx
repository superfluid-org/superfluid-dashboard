import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Box,
  IconButton,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  TrackedTransaction,
  TransactionStatus,
} from "@superfluid-finance/sdk-redux";
import { format } from "date-fns";
import Link from "next/link";
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

const getDisplayTransactionTitle = (transaction: TrackedTransaction) => {
  switch (transaction.title) {
    case "Upgrade to Super Token":
      return "Wrap to Super Token";
    case "Downgrade from Super Token":
      return "Unwrap from Super Token";
    case "Create Stream":
    case "Update Stream":
    case "Close Stream":
    case "Create Index":
    case "Distribute Index":
    case "Update Index Subscription Units":
    case "Approve Index Subscription":
    case "Claim from Index Subscription":
    case "Delete Index Subscription":
    case "Revoke Index Subscription":
    case "Transfer Super Token":
    default:
      return transaction.title;
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const theme = useTheme();
  const network = findNetworkByChainId(transaction.chainId);

  return (
    <ListItem data-cy={"transaction"} button sx={{ cursor: "default" }}>
      <ListItemAvatar>
        <TransactionListItemAvatar status={transaction.status} />
      </ListItemAvatar>
      <ListItemText
        primary={getDisplayTransactionTitle(transaction)}
        secondary={
          <>
            {transaction.status === "Pending" && (
              <LinearProgress data-cy="progress-line" sx={{ height: 3 }} />
            )}
            <Stack
              direction="row"
              gap={0.5}
              component="span"
              alignItems="center"
            >
              <Box
                component="span"
                color={getTransactionStatusColor(transaction.status)}
                translate="no"
                data-cy={"tx-date"}
              >
                {`${format(transaction.timestampMs, "d MMM")} •`}
              </Box>
              <Box data-cy="tx-hash" component="span">{shortenHex(transaction.hash)}</Box>
              {network && (
                <Tooltip
                  data-cy={"tx-hash-buttons"}
                  title="View on blockchain explorer"
                  arrow
                  placement="top"
                >
                  <span>
                    <Link
                      href={network.getLinkForTransaction(transaction.hash)}
                      passHref
                    >
                      <IconButton component="a" size="small" target="_blank">
                        <LaunchRoundedIcon />
                      </IconButton>
                    </Link>
                  </span>
                </Tooltip>
              )}
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
