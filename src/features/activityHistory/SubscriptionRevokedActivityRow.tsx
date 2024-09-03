import NotInterestedRoundedIcon from "@mui/icons-material/NotInterestedRounded";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { FC } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { SubscriptionRevokedActivity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface SubscriptionRevokedActivityRowProps
  extends SubscriptionRevokedActivity {
  dateFormat?: string;
}

const SubscriptionRevokedActivityRow: FC<
  SubscriptionRevokedActivityRowProps
> = ({ keyEvent, subscriptionRevokedEvent, network, dateFormat = "HH:mm" }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const { timestamp, token, publisher, subscriber, transactionHash } = keyEvent;

  const tokenQuery = useTokenQuery({
    chainId: network.id,
    id: token,
    onlySuperToken: true,
  });

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={NotInterestedRoundedIcon} />
          <ListItemText
            data-cy={"activity"}
            primary="Subscription Rejected"
            secondary={format(timestamp * 1000, dateFormat)}
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
      {!isBelowMd ? (
        <>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <TokenIcon
                  isSuper
                  chainId={network.id}
                  tokenAddress={token}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText data-cy={"amount"} primary={tokenQuery.data?.symbol} />
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <AddressAvatar address={isPublisher ? subscriber : publisher} />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isPublisher ? "Subscriber" : "Publisher"}
                secondary={
                  <AddressCopyTooltip
                    address={isPublisher ? subscriber : publisher}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName
                        address={isPublisher ? subscriber : publisher}
                      />
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
        </>
      ) : (
        <TableCell align="right">
          <Stack direction="row" alignItems="center" gap={1}>
            <ListItemText primary={tokenQuery.data?.symbol} />
            <TokenIcon
              isSuper
              chainId={network.id}
              tokenAddress={token}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default SubscriptionRevokedActivityRow;
