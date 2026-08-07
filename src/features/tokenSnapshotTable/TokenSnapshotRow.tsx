import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  Button,
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AccountTokenSnapshot } from "@superfluid-finance/sdk-core";
import { differenceInDays } from "date-fns";
import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, MouseEvent, useEffect, useMemo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import Link from "../common/Link";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { getSendPagePath } from "../../pages/send";
import { getTransferPagePath } from "../../pages/transfer";
import { Currency } from "../../utils/currencyUtils";
import {
  BIG_NUMBER_ZERO,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import { useAppCurrency } from "../settings/appSettingsHooks";
import { UnitOfTime } from "../send/FlowRateInput";
import StreamsTable from "../streamsTable/StreamsTable";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import FlowingFiatBalance from "../tokenPrice/FlowingFiatBalance";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import BalanceCriticalIndicator from "./BalanceCriticalIndicator";
import { isDefined } from "../../utils/ensureDefined";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import { PortfolioValueCallback } from "./TokenSnapshotTables";
import { getBridgePagePath } from "../bridge/getBridgePagePath";
import {
  getPortfolioMobileRowStyles,
  getPortfolioRowActionStyles,
  PORTFOLIO_ROW_ACTIONS_CLASS_NAME,
} from "./portfolioRowActionStyles";

interface SnapshotRowProps {
  lastElement?: boolean;
  open?: boolean;
}

const SnapshotRow = styled(TableRow, {
  shouldForwardProp: (name: string) => !["lastElement", "open"].includes(name),
})<SnapshotRowProps>(({ lastElement, open, theme }) => ({
  cursor: "pointer",
  "> td": {
    py: theme.spacing(1),
  },
  ...getPortfolioRowActionStyles(theme),
  ...getPortfolioMobileRowStyles(theme),
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
  priceUsd?: number;
  portfolioValueCallback: PortfolioValueCallback;
}

const TokenSnapshotRow: FC<TokenSnapshotRowProps> = ({
  network,
  snapshot,
  lastElement,
  priceUsd,
  portfolioValueCallback,
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
  } = snapshot;

  const token = useTokenQuery({
    chainId: network.id,
    id: tokenAddress,
    onlySuperToken: true,
  });
  const tokenSymbol = token?.data?.symbol;

  const currency = useAppCurrency();
  const fallbackTokenPrice = useTokenPrice(
    network.id,
    priceUsd === undefined ? tokenAddress : undefined
  );
  const exchangeRates = tokenPriceApi.useGetUSDExchangeRateQuery();
  const exchangeRate =
    currency === Currency.USD
      ? 1
      : exchangeRates.currentData?.[currency.toString()];
  const tokenPrice =
    priceUsd !== undefined && exchangeRate !== undefined
      ? priceUsd * exchangeRate
      : fallbackTokenPrice;

  const { currentData: balanceData } = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    accountAddress: account,
    tokenAddress: tokenAddress,
  });

  const portfolioValueId = `${account.toLowerCase()}-${
    network.id
  }-${tokenAddress.toLowerCase()}`;
  const hasBalance = balanceData
    ? !BigNumber.from(balanceData.balance).isZero()
    : false;
  const portfolioValue = useMemo(
    () =>
      balanceData && tokenPrice !== undefined
        ? new Decimal(utils.formatUnits(balanceData.balance, 18))
            .mul(tokenPrice)
            .toString()
        : undefined,
    [balanceData, tokenPrice]
  );
  const monthlyFlowValues = useMemo(() => {
    if (tokenPrice === undefined) return undefined;

    const valueOfMonthlyRate = (rate: BigNumber) =>
      new Decimal(utils.formatUnits(rate.mul(UnitOfTime.Month), 18))
        .mul(tokenPrice)
        .toString();

    return {
      monthlyNetFlowValue: balanceData
        ? valueOfMonthlyRate(BigNumber.from(balanceData.flowRate))
        : undefined,
      monthlyInflowValue: valueOfMonthlyRate(BigNumber.from(totalInflowRate)),
      monthlyOutflowValue: valueOfMonthlyRate(BigNumber.from(totalOutflowRate)),
    };
  }, [balanceData, tokenPrice, totalInflowRate, totalOutflowRate]);
  const hasFlow =
    totalInflowRate !== "0" ||
    totalOutflowRate !== "0" ||
    Boolean(balanceData && balanceData.flowRate !== "0");

  useEffect(() => {
    portfolioValueCallback(portfolioValueId, {
      symbol: tokenSymbol || "Unknown token",
      hasBalance,
      hasFlow,
      hasPrice: tokenPrice !== undefined,
      value: portfolioValue,
      ...monthlyFlowValues,
    });

    return () => portfolioValueCallback(portfolioValueId, undefined);
  }, [
    hasBalance,
    hasFlow,
    monthlyFlowValues,
    portfolioValue,
    portfolioValueCallback,
    portfolioValueId,
    tokenPrice,
    tokenSymbol,
  ]);

  const toggleOpen = () => setOpen((currentlyOpen) => !currentlyOpen);

  const openTokenPage = () =>
    router.push(
      getTokenPagePath({
        network: network.slugName,
        token: tokenAddress,
      })
    );

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();
  const sendPath = getSendPagePath({
    token: tokenAddress,
    network: network.slugName,
  });
  const transferPath = getTransferPagePath({
    token: tokenAddress,
    network: network.slugName,
  });
  const swapPath = getBridgePagePath({
    fromChain: network.id,
    fromToken: tokenAddress,
  });

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
  const netFlowColor = !hasNetFlow
    ? "text.secondary"
    : balanceData.flowRate.startsWith("-")
    ? "error.main"
    : "primary.main";

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
              slotProps={{
                primary: {
                  variant: "h6",
                  sx: !tokenPrice ? { lineHeight: "44px" } : {},
                },

                secondary: {
                  variant: "body2mono",
                  color: "textSecondary",
                },
              }}
            />
          </ListItem>
        </TableCell>

        {!isBelowMd ? (
          <>
            <TableCell onClick={openTokenPage}>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  minHeight: 44,
                }}
              >
                {criticalDate && (
                  <Box
                    sx={{
                      position: "absolute",
                      right: "calc(100% + 8px)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <BalanceCriticalIndicator
                      network={network}
                      tokenAddress={tokenAddress}
                      tokenSymbol={tokenSymbol}
                      criticalDate={criticalDate}
                      onClick={stopPropagation}
                    />
                  </Box>
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
                  slotProps={{
                    primary: { variant: "h6mono" },

                    secondary: {
                      variant: "body2mono",
                      color: "textSecondary",
                    },
                  }}
                />
              </Box>
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
                      <>
                        {balanceData?.flowRate.startsWith("-") ? "−" : "+"}
                        <FiatAmount
                          price={tokenPrice}
                          wei={flowRateMonthly.abs()}
                        >
                          {" "}
                          /mo
                        </FiatAmount>
                      </>
                    ) : (
                      <></>
                    )
                  }
                  slotProps={{
                    primary: {
                      variant: "body2mono",
                      sx: { color: netFlowColor },
                    },

                    secondary: {
                      variant: "body2mono",
                      sx: { color: netFlowColor },
                    },
                  }}
                />
              ) : (
                <Typography
                  data-cy={"net-flow-value"}
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {"-"}
                </Typography>
              )}
            </TableCell>

            <TableCell sx={{ pl: 0 }}>
              <Stack
                className={PORTFOLIO_ROW_ACTIONS_CLASS_NAME}
                direction="row"
                onClick={stopPropagation}
                sx={{
                  gap: 0.75,
                }}
              >
                <Button
                  data-cy="portfolio-stream-button"
                  LinkComponent={Link}
                  href={sendPath}
                  size="small"
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                >
                  Stream
                </Button>
                <Button
                  data-cy="portfolio-transfer-button"
                  LinkComponent={Link}
                  href={transferPath}
                  size="small"
                  variant="outlined"
                  startIcon={<SwapHorizRoundedIcon />}
                >
                  Transfer
                </Button>
                {!network.testnet && (
                  <Button
                    data-cy="portfolio-swap-button"
                    LinkComponent={Link}
                    href={swapPath}
                    size="small"
                    variant="outlined"
                    startIcon={<CurrencyExchangeRoundedIcon />}
                  >
                    Swap
                  </Button>
                )}
              </Stack>
            </TableCell>
          </>
        ) : (
          <TableCell
            align="right"
            sx={{
              [theme.breakpoints.down("md")]: {
                px: 2,
              },
            }}
            onClick={openTokenPage}
          >
            <ListItem
              disablePadding
              sx={{ textAlign: "right", justifyContent: "flex-end" }}
            >
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
                sx={{ minWidth: 0, flex: "0 1 auto" }}
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
                slotProps={{
                  primary: { variant: "h7mono" },

                  secondary: {
                    variant: "body2mono",
                    sx: { color: netFlowColor },
                  },
                }}
              />
            </ListItem>
          </TableCell>
        )}

        <TableCell
          align="center"
          sx={{
            cursor: "initial",
            [theme.breakpoints.down("md")]: {
              px: 2,
              py: 0,
              whiteSpace: "nowrap",
            },
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: { xs: "flex-end", md: "center" },
              gap: 0.25,
            }}
          >
            {isBelowMd ? (
              <>
                <Tooltip title="Stream">
                  <IconButton
                    size="small"
                    data-cy="portfolio-stream-button"
                    LinkComponent={Link}
                    href={sendPath}
                    color="primary"
                    onClick={stopPropagation}
                    aria-label={`Stream ${tokenSymbol}`}
                  >
                    <SendRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Transfer">
                  <IconButton
                    size="small"
                    data-cy="portfolio-transfer-button"
                    LinkComponent={Link}
                    href={transferPath}
                    color="primary"
                    onClick={stopPropagation}
                    aria-label={`Transfer ${tokenSymbol}`}
                  >
                    <SwapHorizRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {!network.testnet && (
                  <Tooltip title="Swap">
                    <IconButton
                      size="small"
                      data-cy="portfolio-swap-button"
                      LinkComponent={Link}
                      href={swapPath}
                      color="primary"
                      onClick={stopPropagation}
                      aria-label={`Swap ${tokenSymbol}`}
                    >
                      <CurrencyExchangeRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : null}
            <Tooltip title="Stream history">
              <IconButton
                size={isBelowMd ? "small" : "medium"}
                data-cy={"show-streams-button"}
                color="inherit"
                onClick={toggleOpen}
                aria-label={`Show ${tokenSymbol} stream history`}
                aria-expanded={open}
              >
                <OpenIcon open={open} icon={ExpandCircleDownOutlinedIcon} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </SnapshotRow>
      <TableRow
        sx={{
          background: "transparent",
          "> td:first-of-type": { padding: 0 },
          [theme.breakpoints.down("md")]: {
            display: "block",
            width: "100%",
            "> td": { display: "block", width: "100%" },
          },
        }}
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
            <Box
              data-cy="flow-summary"
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                bgcolor: "background.default",
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: 720,
                  mx: "auto",
                  textAlign: "center",
                  gap: { xs: 1, md: 3 },
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    Inflow
                  </Typography>
                  <Typography
                    data-cy="inflow"
                    variant="body2mono"
                    sx={{
                      color: "primary.main",
                      display: "block",
                      mt: 0.25,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      lineHeight: 1.25,
                      overflowWrap: "anywhere",
                    }}
                  >
                    +
                    <Amount
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    /mo
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    Outflow
                  </Typography>
                  <Typography
                    data-cy="outflow"
                    variant="body2mono"
                    sx={{
                      color: "error.main",
                      display: "block",
                      mt: 0.25,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      lineHeight: 1.25,
                      overflowWrap: "anywhere",
                    }}
                  >
                    -
                    <Amount
                      wei={BigNumber.from(totalOutflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    /mo
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    Active streams
                  </Typography>
                  <Typography
                    variant="body2mono"
                    sx={{
                      display: "block",
                      mt: 0.25,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      lineHeight: 1.25,
                    }}
                  >
                    {totalNumberOfActiveStreams}
                  </Typography>
                </Box>
              </Box>
            </Box>
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
