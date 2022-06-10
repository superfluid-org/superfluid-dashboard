import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { format } from "date-fns";
import { FC, memo } from "react";
import Blockies from "react-blockies";
import { Activity } from "../../utils/activityUtils";
import shortenAddress from "../../utils/shortenAddress";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";

const DefaultActivityRow: FC<Activity> = ({ keyEvent, network }) => {
  const { name, timestamp, transactionHash } = keyEvent;
  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={ArrowForwardIcon} />
          <ListItemText
            primary={`FIX: ${name}`}
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
            <TokenIcon tokenSymbol={"fDAIx"} />
          </ListItemAvatar>
          <ListItemText
            primary={"-12.59 ETH"}
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
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
                seed={"0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"}
                size={12}
                scale={3}
              />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={"To"}
            secondary={shortenAddress(
              "0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"
            )}
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

export default memo(DefaultActivityRow);
