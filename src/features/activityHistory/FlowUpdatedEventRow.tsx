import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import { AllEvents, FlowUpdatedEvent } from "@superfluid-finance/sdk-core";
import { Network } from "../network/networks";
import { format } from "date-fns";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import EtherFormatted from "../token/EtherFormatted";
import { subgraphApi } from "../redux/store";

interface FlowUpdatedEventRowProps {
  event: FlowUpdatedEvent;
  network: Network;
}

const FlowUpdatedEventRow: FC<FlowUpdatedEventRowProps> = ({
  event,
  network,
}) => {
  const { visibleAddress } = useVisibleAddress();

  const {
    deposit,
    flowRate,
    receiver,
    sender,
    timestamp,
    token,
    transactionHash,
  } = event;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isOutgoing = visibleAddress?.toLowerCase() === sender.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          </ListItemAvatar>
          <ListItemText
            primary={isOutgoing ? "Send Stream" : "Receive Stream"}
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
            primary={<EtherFormatted wei={flowRate} />}
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

export default FlowUpdatedEventRow;
