import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import Blockies from "react-blockies";
import {
  TableRow,
  TableCell,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from "@mui/material";
import { FC } from "react";
import shortenAddress from "../../utils/shortenAddress";
import NetworkBadge from "../network/NetworkBadge";
import TokenIcon from "../token/TokenIcon";
import { AllEvents } from "@superfluid-finance/sdk-core";
import { Network } from "../network/networks";
import { format } from "date-fns";

interface TokenDowngradedEventRowProps {
  event: AllEvents;
  network: Network;
}

const TokenDowngradedEventRow: FC<TokenDowngradedEventRowProps> = ({
  event,
  network,
}) => {
  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            <ArrowForwardIcon />
          </ListItemAvatar>
          <ListItemText
            primary={event.name}
            secondary={format(event.timestamp * 1000, "HH:mm")}
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
        <IconButton color="inherit">
          <LaunchRoundedIcon />
        </IconButton>
        <NetworkBadge
          network={network}
          sx={{ position: "absolute", top: "0px", right: "16px" }}
        />
      </TableCell>
    </TableRow>
  );
};

export default TokenDowngradedEventRow;
