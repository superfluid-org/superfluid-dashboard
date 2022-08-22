import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
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
import { format } from "date-fns";
import { FC } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { IndexDistributionClaimedActivity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const IndexDistributionClaimedRow: FC<IndexDistributionClaimedActivity> = ({
  keyEvent,
  subscriptionDistributionClaimed,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();

  const { timestamp, amount, token, transactionHash, publisher, subscriber } =
    keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon
            icon={CallSplitRoundedIcon}
            IconProps={{
              sx: { transform: `rotate(${isPublisher ? "" : "-"}90deg)` },
            }}
          />
          <ListItemText
            primary="Distribution Claimed"
            secondary={format(timestamp * 1000, "HH:mm")}
            primaryTypographyProps={{
              variant: isBelowMd ? "h7" : "h6",
              translate: "yes",
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
          <ListItemText
            primary={
              <>
                +<Amount wei={amount} />
                {` `}
                {tokenQuery.data?.symbol}
              </>
            }
            primaryTypographyProps={{
              variant: "h6mono",
              color: "primary",
            }}
          />
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
              translate: "yes",
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

export default IndexDistributionClaimedRow;
