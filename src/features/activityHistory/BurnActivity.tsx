import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { FC, memo } from "react";
import { BurnedActivity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import EtherFormatted from "../token/EtherFormatted";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";

const BurnActivity: FC<BurnedActivity> = ({
  keyEvent,
  transferEvent,
  network,
}) => {
  const { amount, transactionHash, timestamp } = keyEvent;
  const { token } = transferEvent || {};

  const tokenQuery = subgraphApi.useTokenQuery(
    token
      ? {
          chainId: network.id,
          id: token,
        }
      : skipToken
  );

  const underlyingTokenQuery = subgraphApi.useTokenQuery(
    tokenQuery.data
      ? {
          chainId: network.id,
          id: tokenQuery.data.underlyingAddress,
        }
      : skipToken
  );

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={SwapVertIcon} />
          <ListItemText
            primary={"Unwrap"}
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
              <>
                -
                <EtherFormatted
                  wei={amount}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
              </>
            }
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
            // secondary="$12.59"
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
            {underlyingTokenQuery.data && (
              <TokenIcon tokenSymbol={underlyingTokenQuery.data.symbol} />
            )}
          </ListItemAvatar>
          <ListItemText
            primary={
              <>
                +
                <EtherFormatted
                  wei={amount}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
              </>
            }
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
            // secondary="$12.59"
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

export default memo(BurnActivity);
