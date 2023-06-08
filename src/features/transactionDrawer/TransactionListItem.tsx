import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  TrackedTransaction,
  TransactionStatus,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { format } from "date-fns";
import NextLink from "next/link";
import { FC, useState } from "react";
import shortenHex from "../../utils/shortenHex";
import NetworkBadge from "../network/NetworkBadge";
import {
  TransactionListItemAvatar,
  TransactionListSubItemAvatar,
} from "./TransactionListItemAvatar";
import { TransactionListItemRestoreButton } from "./TransactionListItemRestoreButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { allNetworks, tryFindNetwork } from "../network/networks";
import Link from "../common/Link";

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

const getDisplayTransactionTitle = (transactionTitle: TransactionTitle) => {
  switch (transactionTitle) {
    case "Upgrade to Super Token":
      return "Wrap to Super Token";
    case "Downgrade from Super Token":
      return "Unwrap from Super Token";
    case "Create Stream":
      return "Send Stream";
    case "Update Stream":
      return "Update Flow Rate";
    case "Close Stream":
      return "Cancel Stream";
    case "Create Index":
    case "Distribute Index":
    case "Update Index Subscription Units":
    case "Approve Index Subscription":
    case "Claim from Index Subscription":
    case "Delete Index Subscription":
    case "Revoke Index Subscription":
    case "Transfer Super Token":
    default:
      return transactionTitle;
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const theme = useTheme();
  const network = tryFindNetwork(allNetworks, transaction.chainId);

  const subTransactionTitles: TransactionTitle[] =
    (transaction.extraData.subTransactionTitles as TransactionTitle[]) ?? [];
  const [expand, setExpand] = useState(false);

  return (
    <ListItem data-cy={"transaction"} button sx={{ cursor: "default" }}>
      <ListItemAvatar>
        <TransactionListItemAvatar status={transaction.status} />
      </ListItemAvatar>
      <ListItemText
        primary={
          subTransactionTitles.length > 1 ? (
            <>
              <Stack
                direction="row"
                sx={{ cursor: "pointer" }}
                onClick={() => setExpand(!expand)}
              >
                {getDisplayTransactionTitle(transaction.title)}
                <OpenIcon clockwise open={expand} icon={ExpandMoreIcon} />
              </Stack>
              <Collapse in={expand}>
                <List>
                  {subTransactionTitles.map((subTransactionTitle) => (
                    <ListItem disablePadding key={subTransactionTitle}>
                      <ListItemAvatar sx={{ mr: 1 }}>
                        <TransactionListSubItemAvatar
                          status={transaction.status}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                        }}
                        sx={{ my: 0.25 }}
                      >
                        {getDisplayTransactionTitle(subTransactionTitle)}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          ) : (
            getDisplayTransactionTitle(transaction.title)
          )
        }
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
              <Box data-cy="tx-hash" component="span">
                {shortenHex(transaction.hash)}
              </Box>
              {network && (
                <Tooltip
                  data-cy={"tx-hash-buttons"}
                  title="View on blockchain explorer"
                  arrow
                  placement="top"
                >
                  <span>
                    <IconButton
                      component={Link}
                      href={network.getLinkForTransaction(transaction.hash)}
                      size="small"
                      target="_blank"
                    >
                      <LaunchRoundedIcon />
                    </IconButton>
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
