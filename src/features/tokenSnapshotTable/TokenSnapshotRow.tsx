import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import {
  Collapse,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  styled,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AccountTokenSnapshot } from "@superfluid-finance/sdk-core";
import { differenceInDays } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, MouseEvent, useMemo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import {
  BIG_NUMBER_ZERO,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import StreamsTable from "../streamsTable/StreamsTable";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import FlowingFiatBalance from "../tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import BalanceCriticalIndicator from "./BalanceCriticalIndicator";
import { isDefined } from "../../utils/ensureDefined";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface SnapshotRowProps {
  lastElement?: boolean;
  open?: boolean;
}

const SnapshotRow = styled(TableRow, {
  shouldForwardProp: (name: string) => !["lastElement", "open"].includes(name),
})<SnapshotRowProps>(({ lastElement, open, theme }) => ({
  cursor: "pointer",
  ...(lastElement && {
    td: {
      border: "none",
      ":first-of-type": { borderRadius: "0 0 0 20px" },
      ":last-of-type": { borderRadius: "0 0 20px 0" },
      [theme.breakpoints.down("md")]: {
        ":first-of-type": { borderRadius: 0 },
        ":last-of-type": { borderRadius: 0 },
      },
      transition: theme.transitions.create("border-radius", {
        duration: theme.transitions.duration.shortest,
        easing: theme.transitions.easing.easeOut,
        delay: theme.transitions.duration.shorter,
      }),
      ...(open && {
        ":first-of-type": { borderRadius: "0" },
        ":last-of-type": { borderRadius: "0" },
        transition: theme.transitions.create("border-radius", {
          duration: theme.transitions.duration.shortest,
          easing: theme.transitions.easing.easeInOut,
        }),
      }),
    },
  }),
}));

export interface ExtendedAccountTokenSnapshot extends AccountTokenSnapshot {
  isListed: boolean;
}

interface TokenSnapshotRowProps {
  network: Network;
  snapshot: ExtendedAccountTokenSnapshot;
  lastElement: boolean;
}

const TokenSnapshotRow: FC<TokenSnapshotRowProps> = ({
  network,
  snapshot,
  lastElement,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const {
    account,
    token: tokenAddress,
    totalInflowRate,
    totalOutflowRate,
    totalNumberOfActiveStreams,
    totalNumberOfClosedStreams,
  } = snapshot;

  const token = useTokenQuery({ chainId: network.id, id: tokenAddress, onlySuperToken: true });
  const tokenSymbol = token?.data?.symbol;

  const tokenPrice = useTokenPrice(network.id, tokenAddress);

  const { currentData: balanceData } = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    accountAddress: account,
    tokenAddress: tokenAddress,
  });

  const hasStreams =
    totalNumberOfActiveStreams + totalNumberOfClosedStreams > 0;

  const toggleOpen = () => hasStreams && setOpen(!open);

  const openTokenPage = () =>
    router.push(
      getTokenPagePath({
        network: network.slugName,
        token: tokenAddress,
      })
    );

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  const criticalDate = useMemo(() => {
    if (!balanceData) {
      return undefined;
    }

    const criticalTimestamp = calculateMaybeCriticalAtTimestamp({
      balanceUntilUpdatedAtWei: balanceData.balance,
      updatedAtTimestamp: balanceData.balanceTimestamp,
      totalNetFlowRateWei: balanceData.flowRate,
    });

    if (criticalTimestamp.gt(BIG_NUMBER_ZERO)) {
      const criticalDate = new Date(criticalTimestamp.mul(1000).toNumber());

      if (differenceInDays(criticalDate, new Date()) < 7) {
        return criticalDate;
      }
    }

    return null;
  }, [balanceData]);

  const flowRateMonthly = useMemo(() => {
    if (balanceData) {
      return BigNumber.from(balanceData.flowRate).mul(UnitOfTime.Month);
    }
  }, [balanceData]);

  const hasNetFlow = balanceData && balanceData.flowRate !== "0";

  return (
    <>
      <SnapshotRow
        hover
        lastElement={lastElement}
        open={open}
        data-cy={`${tokenSymbol}-cell`}
      >
        <TableCell onClick={openTokenPage}>
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <TokenIcon
                isSuper
                chainId={network.id}
                tokenAddress={tokenAddress}
                isUnlisted={!snapshot.isListed}
              />
            </ListItemAvatar>
            <ListItemText
              data-cy={"token-symbol"}
              onClick={openTokenPage}
              primary={tokenSymbol}
              secondary={
                tokenPrice && (
                  <FiatAmount wei={1} decimals={0} price={tokenPrice} />
                )
              }
              primaryTypographyProps={{
                variant: "h6",
                sx: !tokenPrice ? { lineHeight: "44px" } : {},
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
            <TableCell onClick={openTokenPage}>
              <ListItem disablePadding sx={{ ml: criticalDate ? -4 : 0 }}>
                {criticalDate && (
                  <ListItemIcon sx={{ mr: 1 }}>
                    <BalanceCriticalIndicator
                      network={network}
                      tokenAddress={tokenAddress}
                      tokenSymbol={tokenSymbol}
                      criticalDate={criticalDate}
                      onClick={stopPropagation}
                    />
                  </ListItemIcon>
                )}

                <ListItemText
                  primary={<FlowingBalance data={balanceData} />}
                  secondary={
                    tokenPrice && (
                      <FlowingFiatBalance
                        data={
                          balanceData
                            ? {
                                ...balanceData,
                                price: tokenPrice,
                              }
                            : undefined
                        }
                      />
                    )
                  }
                  primaryTypographyProps={{ variant: "h6mono" }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            </TableCell>

            <TableCell data-cy={"net-flow"} onClick={openTokenPage}>
              {hasNetFlow ? (
                <ListItemText
                  data-cy="net-flow-value"
                  primary={
                    balanceData && isDefined(flowRateMonthly) ? (
                      <>
                        {balanceData.flowRate.charAt(0) !== "-" && "+"}
                        <Amount wei={flowRateMonthly}>/mo</Amount>
                      </>
                    ) : (
                      <Skeleton />
                    )
                  }
                  secondary={
                    tokenPrice && isDefined(flowRateMonthly) ? (
                      <FiatAmount
                        price={tokenPrice}
                        wei={flowRateMonthly.abs()}
                      >
                        {" "}
                        /mo
                      </FiatAmount>
                    ) : (
                      <></>
                    )
                  }
                  primaryTypographyProps={{ variant: "body2mono" }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              ) : (
                <Typography data-cy={"net-flow-value"}>{"-"}</Typography>
              )}
            </TableCell>

            <TableCell onClick={openTokenPage}>
              {totalNumberOfActiveStreams > 0 ? (
                <Stack>
                  <Typography
                    data-cy={"inflow"}
                    variant="body2mono"
                    color="primary"
                  >
                    +
                    <Amount
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    /mo
                  </Typography>
                  <Typography
                    data-cy={"outflow"}
                    variant="body2mono"
                    color="error"
                  >
                    -
                    <Amount
                      wei={BigNumber.from(totalOutflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    /mo
                  </Typography>
                </Stack>
              ) : (
                <Typography data-cy={"outflow"}>{"-"}</Typography>
              )}
            </TableCell>
          </>
        ) : (
          <TableCell
            align="right"
            sx={{ [theme.breakpoints.down("md")]: { px: 0 } }}
            onClick={openTokenPage}
          >
            <ListItem disablePadding sx={{ textAlign: "right" }}>
              {criticalDate && (
                <ListItemIcon sx={{ mr: 1 }}>
                  <BalanceCriticalIndicator
                    network={network}
                    tokenAddress={tokenAddress}
                    tokenSymbol={tokenSymbol}
                    criticalDate={criticalDate}
                    onClick={stopPropagation}
                  />
                </ListItemIcon>
              )}
              <ListItemText
                primary={
                  <FlowingBalance
                    data={balanceData ? balanceData : undefined}
                  />
                }
                secondary={
                  totalNumberOfActiveStreams > 0 &&
                  isDefined(balanceData) &&
                  isDefined(flowRateMonthly) ? (
                    <>
                      {balanceData.flowRate.charAt(0) !== "-" && "+"}
                      <Amount wei={flowRateMonthly}>/mo</Amount>
                    </>
                  ) : (
                    "-"
                  )
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{
                  variant: "body2mono",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          </TableCell>
        )}

        <TableCell
          align="center"
          sx={{
            cursor: "initial",
            [theme.breakpoints.down("md")]: { p: 1.25, width: "56px" },
          }}
        >
          {hasStreams && (
            <IconButton
              data-cy={"show-streams-button"}
              color="inherit"
              onClick={toggleOpen}
            >
              <OpenIcon open={open} icon={ExpandCircleDownOutlinedIcon} />
            </IconButton>
          )}
        </TableCell>
      </SnapshotRow>
      <TableRow
        sx={{ background: "transparent", "> td:first-of-type": { padding: 0 } }}
      >
        <TableCell
          colSpan={5}
          sx={{
            border: "none",
            minHeight: 0,
          }}
        >
          <Collapse
            data-cy={`${tokenAddress}-streams-table`}
            in={open}
            timeout={theme.transitions.duration.standard}
            unmountOnExit
          >
            <StreamsTable
              subTable
              network={network}
              tokenAddress={snapshot.token}
              lastElement={lastElement}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(TokenSnapshotRow);
