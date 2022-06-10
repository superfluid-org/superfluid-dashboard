import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import Blockies from "react-blockies";
import { AgreementLiquidatedActivity } from "../../utils/activityUtils";
import shortenAddress from "../../utils/shortenAddress";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const LiquidatedActivityRow: FC<AgreementLiquidatedActivity> = ({
  keyEvent,
  flowUpdatedEvent = {},
  network,
}) => {
  const { token, timestamp, transactionHash } = keyEvent;
  const { sender = "", receiver = "" } = flowUpdatedEvent;
  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = subgraphApi.useTokenQuery(
    token
      ? {
          chainId: network.id,
          id: token,
        }
      : skipToken
  );

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === sender?.toLowerCase(),
    [visibleAddress, sender]
  );

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={PriorityHighIcon} />
          <ListItemText
            primary={"Liquidated"}
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
            primary={"-12.59 ETH"}
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
            // secondary="$12.59"
            primaryTypographyProps={{
              variant: "h6",
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
              <Blockies
                seed={isOutgoing ? receiver : sender}
                size={12}
                scale={3}
              />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={isOutgoing ? "To" : "From"}
            secondary={shortenAddress(isOutgoing ? receiver : sender)}
            primaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
            secondaryTypographyProps={{
              variant: "h6",
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

export default memo(LiquidatedActivityRow);
