import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransferEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import Blockies from "react-blockies";
import { Activity } from "../../utils/activityUtils";
import shortenAddress from "../../utils/shortenAddress";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import EtherFormatted from "../token/EtherFormatted";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const TransferActivityRow: FC<Activity<TransferEvent>> = ({
  keyEvent,
  network,
}) => {
  const { visibleAddress } = useVisibleAddress();

  const { from, to, token, value, timestamp, transactionHash } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery(
    token
      ? {
          chainId: network.id,
          id: token,
        }
      : skipToken
  );

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === from.toLowerCase(),
    [visibleAddress, from]
  );

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={isOutgoing ? ArrowForwardIcon : ArrowBackIcon} />
          <ListItemText
            primary={isOutgoing ? "Send Transfer" : "Receive Transfer"}
            secondary={format(timestamp * 1000, "HH:mm")}
            primaryTypographyProps={{
              variant: "h6",
            }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            {tokenQuery.data && (
              <TokenIcon tokenSymbol={tokenQuery.data.symbol} />
            )}
          </ListItemAvatar>
          <ListItemText
            primary={
              <EtherFormatted
                wei={value}
                etherDecimalPlaces={8}
                disableRoundingIndicator
              />
            }
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
            primaryTypographyProps={{
              variant: "h6mono",
              sx: { lineHeight: "46px" },
            }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            <Avatar variant="rounded">
              <Blockies seed={isOutgoing ? to : from} size={12} scale={3} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={isOutgoing ? "To" : "From"}
            secondary={
              <AddressCopyTooltip address={isOutgoing ? to : from}>
                <Typography variant="h6" color="text.primary" component="span">
                  {shortenAddress(isOutgoing ? to : from)}
                </Typography>
              </AddressCopyTooltip>
            }
            primaryTypographyProps={{
              variant: "body2",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      <TableCell sx={{ position: "relative" }}>
        <TxHashLink txHash={transactionHash} network={network} />

        <NetworkBadge
          network={network}
          sx={{ position: "absolute", top: "0px", right: "16px" }}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(TransferActivityRow);
