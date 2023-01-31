import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
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
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { SubscriptionApprovedActivity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

interface SubscriptionApprovedActivityRowProps
  extends SubscriptionApprovedActivity {
  dateFormat?: string;
}

const SubscriptionApprovedActivityRow: FC<
  SubscriptionApprovedActivityRowProps
> = ({
  keyEvent,
  subscriptionApprovedEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const {
    indexId,
    timestamp,
    token,
    publisher,
    subscriber,
    transactionHash,
    blockNumber,
  } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const oldSubQuery = subgraphApi.useIndexSubscriptionQuery({
    chainId: network.id,
    id: `${subscriber}-${publisher}-${token}-${indexId}`,
    block: {
      number: blockNumber - 1,
    },
  });

  const newSubQuery = subgraphApi.useIndexSubscriptionQuery({
    chainId: network.id,
    id: `${subscriber}-${publisher}-${token}-${indexId}`,
    block: {
      number: blockNumber,
    },
  });

  const amountReceived = useMemo(() => {
    if (oldSubQuery.data && newSubQuery.data) {
      return BigNumber.from(newSubQuery.data.totalAmountReceivedUntilUpdatedAt)
        .sub(BigNumber.from(oldSubQuery.data.totalAmountReceivedUntilUpdatedAt))
        .toString();
    }

    return null;
  }, [oldSubQuery.data, newSubQuery.data]);

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={CheckRoundedIcon} />
          <ListItemText
            primary="Subscription Approved"
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
                  tokenSymbol={tokenQuery.data?.symbol}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    {amountReceived && (
                      <>
                        +<Amount wei={amountReceived} />
                      </>
                    )}{" "}
                    {tokenQuery.data?.symbol}
                  </>
                }
                primaryTypographyProps={{
                  variant: "h6mono",
                  color:
                    amountReceived && amountReceived !== "0"
                      ? "primary"
                      : "inherit",
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
            <ListItemText
              primary={
                amountReceived && (
                  <>
                    +<Amount wei={amountReceived} />
                  </>
                )
              }
              secondary={tokenQuery.data?.symbol}
              primaryTypographyProps={{
                variant: "h6mono",
                color:
                  amountReceived && amountReceived !== "0"
                    ? "primary"
                    : "inherit",
              }}
            />
            <TokenIcon
              isSuper
              tokenSymbol={tokenQuery.data?.symbol}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default SubscriptionApprovedActivityRow;
