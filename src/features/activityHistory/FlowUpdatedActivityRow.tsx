import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { FlowUpdatedEvent, FlowUpdateType } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, memo, useMemo } from "react";
import Blockies from "react-blockies";
import { Activity } from "../../utils/activityUtils";
import shortenAddress from "../../utils/shortenAddress";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import EtherFormatted from "../token/EtherFormatted";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const FlowUpdatedActivityRow: FC<Activity<FlowUpdatedEvent>> = ({
  keyEvent,
  network,
}) => {
  const { visibleAddress } = useVisibleAddress();

  const {
    type,
    deposit,
    flowRate,
    receiver,
    sender,
    timestamp,
    token,
    transactionHash,
  } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === sender.toLowerCase(),
    [visibleAddress, sender]
  );

  const { title, icon } = useMemo(() => {
    switch (type) {
      case FlowUpdateType.Create:
        return {
          title: isOutgoing ? "Send Stream" : "Receive Stream",
          icon: isOutgoing ? ArrowForwardIcon : ArrowBackIcon,
        };
      case FlowUpdateType.Update:
        return {
          title: "Stream Updated",
          icon: EditIcon,
        };
      case FlowUpdateType.Terminate:
        return {
          title: "Stream Cancelled",
          icon: CloseIcon,
        };
    }
  }, [isOutgoing, type]);

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={icon} />
          <ListItemText
            primary={title}
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
                <EtherFormatted
                  wei={BigNumber.from(flowRate).mul(UnitOfTime.Month)}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
                /mo
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
              variant: "body2",
              color: "text.secondary",
            }}
            secondaryTypographyProps={{
              variant: "h6",
              color: "text.primary",
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

export default memo(FlowUpdatedActivityRow);
