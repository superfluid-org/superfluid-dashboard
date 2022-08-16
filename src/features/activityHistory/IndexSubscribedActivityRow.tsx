import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { FC } from "react";
import { IndexSubscribedActivity } from "../../utils/activityUtils";
import EditIcon from "@mui/icons-material/Edit";
import ActivityIcon from "./ActivityIcon";
import { format } from "date-fns";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TokenIcon from "../token/TokenIcon";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

const IndexSubscribedActivityRow: FC<IndexSubscribedActivity> = ({
  keyEvent,
  subscriptionApprovedEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const { timestamp, token, publisher, subscriber, transactionHash } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={CheckRoundedIcon} />
          <ListItemText
            primary="Subscribe Distribution"
            secondary={format(timestamp * 1000, "HH:mm")}
            primaryTypographyProps={{
              variant: isBelowMd ? "h7" : "h6",
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
            <TokenIcon
              isSuper
              tokenSymbol={tokenQuery.data?.symbol}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </ListItemAvatar>
        </ListItem>
      </TableCell>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            <AddressAvatar address={isPublisher ? subscriber : publisher} />
          </ListItemAvatar>
          <ListItemText
            primary={isPublisher ? "Subscriber" : "Publisher"}
            secondary={
              <AddressCopyTooltip
                address={isPublisher ? subscriber : publisher}
              >
                <Typography variant="h6" color="text.primary" component="span">
                  <AddressName address={isPublisher ? subscriber : publisher} />
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

export default IndexSubscribedActivityRow;
