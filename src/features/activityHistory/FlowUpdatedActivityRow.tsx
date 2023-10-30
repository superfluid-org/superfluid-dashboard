import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
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
import IconButton from "@mui/material/IconButton";
import { FlowUpdatedEvent, FlowUpdateType } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, memo, useMemo } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { getStreamPagePath } from "../../pages/stream/[_network]/[_stream]";
import { Activity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import Link from "../common/Link";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import FlowingFiatBalance from "../tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

interface FlowUpdatedActivityRowProps extends Activity<FlowUpdatedEvent> {
  dateFormat?: string;
}

const FlowUpdatedActivityRow: FC<FlowUpdatedActivityRowProps> = ({
  keyEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const {
    type,
    flowRate,
    receiver,
    sender,
    timestamp,
    token,
    transactionHash,
    id,
  } = keyEvent;

  const { stream, ...streamsQuery } = subgraphApi.useStreamsQuery(
    {
      chainId: network.id,
      filter: {
        flowUpdatedEvents_: {
          id,
        },
      },
    },
    {
      selectFromResult: (result) => ({
        ...result,
        stream: result.data?.data?.[0],
      }),
    }
  );

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === sender.toLowerCase(),
    [visibleAddress, sender]
  );

  const tokenPrice = useTokenPrice(network.id, token);

  const { title, icon } = useMemo(() => {
    switch (type) {
      case FlowUpdateType.Create:
        return {
          title: isOutgoing ? "Send Stream" : "Receive Stream",
          icon: isOutgoing ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon,
        };
      case FlowUpdateType.Update:
        return {
          title: "Stream Updated",
          icon: EditRoundedIcon,
        };
      case FlowUpdateType.Terminate:
        return {
          title: "Stream Cancelled",
          icon: CloseRoundedIcon,
        };
    }
  }, [isOutgoing, type]);

  const weiAmountMonthly = useMemo(
    () => BigNumber.from(flowRate).mul(UnitOfTime.Month),
    [flowRate]
  );

  const isStreamLastEvent = stream && stream.updatedAtTimestamp === timestamp;

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={icon} />
          <ListItemText
            data-cy={"activity"}
            primary={title}
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
              translate: "yes",
              variant: isBelowMd ? "h7" : "h6",
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
                data-cy={"amount"}
                primary={
                  <>
                    {isStreamLastEvent ? (
                      <>
                        <FlowingBalance
                          balance={stream.streamedUntilUpdatedAt}
                          flowRate={stream.currentFlowRate}
                          balanceTimestamp={stream.updatedAtTimestamp}
                        />
                        {` `}
                        {tokenQuery.data?.symbol}
                      </>
                    ) : (
                      <Amount wei={weiAmountMonthly}>
                        {" "}
                        {tokenQuery.data
                          ? `${tokenQuery.data.symbol}/mo`
                          : "/mo"}
                      </Amount>
                    )}
                  </>
                }
                secondary={
                  tokenPrice &&
                  (isStreamLastEvent ? (
                    <FlowingFiatBalance
                      balance={stream.streamedUntilUpdatedAt}
                      flowRate={stream.currentFlowRate}
                      balanceTimestamp={stream.updatedAtTimestamp}
                      price={tokenPrice}
                    />
                  ) : (
                    <FiatAmount price={tokenPrice} wei={weiAmountMonthly}>
                      {" "}
                      /mo
                    </FiatAmount>
                  ))
                }
                primaryTypographyProps={{
                  variant: "h6mono",
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
                <AddressAvatar address={isOutgoing ? receiver : sender} />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isOutgoing ? "To" : "From"}
                secondary={
                  <AddressCopyTooltip address={isOutgoing ? receiver : sender}>
                    <Typography
                      data-cy="address-to-copy"
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName address={isOutgoing ? receiver : sender} />
                    </Typography>
                  </AddressCopyTooltip>
                }
                primaryTypographyProps={{
                  translate: "yes",
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          </TableCell>
          <TableCell sx={{ position: "relative" }}>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <TxHashLink txHash={transactionHash} network={network} />
              {stream && (
                <IconButton
                  LinkComponent={Link}
                  href={getStreamPagePath({
                    network: network.slugName,
                    stream: stream.id,
                  })}
                >
                  <ArrowForwardRoundedIcon color="inherit" />
                </IconButton>
              )}
            </Stack>

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
                <Amount wei={BigNumber.from(flowRate).mul(UnitOfTime.Month)} />
              }
              secondary={
                tokenQuery.data ? `${tokenQuery.data.symbol}/mo` : "/mo"
              }
              /**
               * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
               * This is just used to make table row look better
               */
              // secondary="$12.59"
              primaryTypographyProps={{
                variant: "h6mono",
              }}
              secondaryTypographyProps={{
                variant: "body2mono",
                color: "text.secondary",
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

export default memo(FlowUpdatedActivityRow);
