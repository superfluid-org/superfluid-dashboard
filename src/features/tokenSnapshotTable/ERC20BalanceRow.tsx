import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, useEffect, useMemo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { getTransferPagePath } from "../../pages/transfer";
import { getSendPagePath } from "../../pages/send";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { getTokenPairsFromTokenList } from "../../hooks/useTokenQuery";
import { Currency } from "../../utils/currencyUtils";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import PortfolioFiatAmount from "../portfolio/PortfolioFiatAmount";
import ERC20TransferRow from "../portfolio/ERC20TransferRow";
import useERC20TransferHistory from "../portfolio/useERC20TransferHistory";
import { useAppCurrency } from "../settings/appSettingsHooks";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { PortfolioValueCallback } from "./TokenSnapshotTables";
import { ERC20Balance } from "./useERC20Balances";
import { getBridgePagePath } from "../bridge/getBridgePagePath";
import {
  getPortfolioMobileNumericTextStyles,
  getPortfolioMobileRowStyles,
  getPortfolioRowActionStyles,
  PORTFOLIO_ROW_ACTIONS_CLASS_NAME,
} from "./portfolioRowActionStyles";
import PortfolioTokenActions from "./PortfolioTokenActions";

interface ERC20BalanceRowProps extends ERC20Balance {
  address: Address;
  network: Network;
  portfolioValueCallback: PortfolioValueCallback;
}

enum TransferFilter {
  All,
  Sent,
  Received,
}

const ERC20BalanceUpdatesPanel: FC<{
  address: Address;
  network: Network;
  token: ERC20Balance["token"];
  streamPath?: string;
  swapPath?: string;
  transferPath: string;
  wrapPath?: string;
}> = ({
  address,
  network,
  token,
  streamPath,
  swapPath,
  transferPath,
  wrapPath,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [filter, setFilter] = useState(TransferFilter.All);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { transfers, hasMore, loadMore, isLoading, isFetching, isError } =
    useERC20TransferHistory({
      address,
      tokenAddress: token.address,
      chainId: network.id,
    });
  const lowerAddress = address.toLowerCase();
  const filteredTransfers = transfers.filter((transfer) => {
    if (filter === TransferFilter.Sent) {
      return transfer.from === lowerAddress;
    }
    if (filter === TransferFilter.Received) {
      return transfer.to === lowerAddress;
    }
    return true;
  });
  const sentCount = transfers.filter(
    (transfer) => transfer.from === lowerAddress
  ).length;
  const receivedCount = transfers.filter(
    (transfer) => transfer.to === lowerAddress
  ).length;
  const visibleTransfers = filteredTransfers.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [filter]);

  useEffect(() => {
    const requiredTransferCount = (page + 1) * rowsPerPage;
    if (
      filteredTransfers.length < requiredTransferCount &&
      hasMore &&
      !isFetching
    ) {
      loadMore();
    }
  }, [
    filteredTransfers.length,
    hasMore,
    isFetching,
    loadMore,
    page,
    rowsPerPage,
  ]);

  return (
    <TableContainer
      component={Paper}
      data-cy="erc20-balance-updates-panel"
      sx={{
        borderRadius: 0,
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        boxShadow: "none",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={3} sx={{ px: { xs: 1, md: 2 } }}>
              <Stack
                direction="row"
                sx={{ alignItems: "center", gap: { xs: 0.5, md: 1 } }}
              >
                {[
                  {
                    value: TransferFilter.All,
                    label: "All",
                    count: transfers.length,
                  },
                  {
                    value: TransferFilter.Sent,
                    label: "Sent",
                    count: sentCount,
                  },
                  {
                    value: TransferFilter.Received,
                    label: "Received",
                    count: receivedCount,
                  },
                ].map(({ value, label, count }) => (
                  <Button
                    key={value}
                    size={isBelowMd ? "small" : "medium"}
                    variant="textContained"
                    color={filter === value ? "primary" : "secondary"}
                    onClick={() => setFilter(value)}
                    sx={{
                      minWidth: { xs: 0, md: 64 },
                      px: { xs: 0.75, md: 2 },
                    }}
                  >
                    {label}
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", md: "inline" } }}
                    >
                      {` (${count}${hasMore ? "+" : ""})`}
                    </Box>
                  </Button>
                ))}
                <Box sx={{ flex: 1 }} />
                {isBelowMd ? (
                  <PortfolioTokenActions
                    decimals={token.decimals}
                    network={network}
                    symbol={token.symbol}
                    tokenAddress={token.address}
                    streamPath={streamPath}
                    transferPath={transferPath}
                    wrapPath={wrapPath}
                    swapPath={swapPath}
                  />
                ) : null}
              </Stack>
            </TableCell>
          </TableRow>
          {!isBelowMd ? (
            <TableRow>
              <TableCell>To/From</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date Sent</TableCell>
            </TableRow>
          ) : null}
        </TableHead>
        <TableBody>
          {isLoading || (isFetching && visibleTransfers.length === 0) ? (
            <TableRow>
              <TableCell colSpan={3}>
                <Skeleton height={46} />
              </TableCell>
            </TableRow>
          ) : (isError && transfers.length === 0) ||
            filteredTransfers.length === 0 ? (
            <EmptyRow span={3} />
          ) : (
            visibleTransfers.map((transfer) => (
              <ERC20TransferRow
                key={transfer.id}
                transfer={transfer}
                accountAddress={address}
                tokenDecimals={token.decimals}
              />
            ))
          )}
        </TableBody>
      </Table>
      {filteredTransfers.length > rowsPerPage || hasMore ? (
        <TablePagination
          component="div"
          count={hasMore ? -1 : filteredTransfers.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) =>
            count === -1 ? `${from}–${to} of more` : `${from}–${to} of ${count}`
          }
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number.parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{ background: "transparent" }}
        />
      ) : null}
    </TableContainer>
  );
};

const ERC20BalanceRow: FC<ERC20BalanceRowProps> = ({
  address,
  network,
  token,
  balance,
  priceUsd,
  portfolioValueCallback,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const currency = useAppCurrency();
  const [open, setOpen] = useState(false);
  const tokenPrice = useTokenPrice(
    network.id,
    priceUsd === undefined ? token.address : undefined
  );
  const exchangeRates = tokenPriceApi.useGetUSDExchangeRateQuery();
  const exchangeRate =
    currency === Currency.USD
      ? 1
      : exchangeRates.currentData?.[currency.toString()];
  const effectivePrice =
    priceUsd !== undefined && exchangeRate !== undefined
      ? priceUsd * exchangeRate
      : tokenPrice;
  const portfolioValue = useMemo(
    () =>
      effectivePrice !== undefined
        ? new Decimal(utils.formatUnits(balance, token.decimals))
            .mul(effectivePrice)
            .toString()
        : undefined,
    [balance, effectivePrice, token.decimals]
  );
  const portfolioValueId = `${address.toLowerCase()}-${
    network.id
  }-${token.address.toLowerCase()}`;

  useEffect(() => {
    portfolioValueCallback(portfolioValueId, {
      symbol: token.symbol,
      hasBalance: !BigNumber.from(balance).isZero(),
      hasFlow: false,
      hasPrice: effectivePrice !== undefined,
      value: portfolioValue,
    });

    return () => portfolioValueCallback(portfolioValueId, undefined);
  }, [
    balance,
    effectivePrice,
    portfolioValue,
    portfolioValueCallback,
    portfolioValueId,
    token.symbol,
  ]);

  const transferPath = getTransferPagePath({
    token: token.address,
    network: network.slugName,
  });
  const tokenPair = useMemo(
    () =>
      getTokenPairsFromTokenList(network.id).find(
        ({ underlyingToken }) =>
          underlyingToken.address.toLowerCase() === token.address.toLowerCase()
      ),
    [network.id, token.address]
  );
  const streamPath = tokenPair
    ? getSendPagePath({
        token: tokenPair.superToken.address,
        network: network.slugName,
      })
    : undefined;
  const wrapPath = tokenPair
    ? `/wrap?upgrade&token=${tokenPair.superToken.address}&network=${network.slugName}`
    : undefined;
  const swapPath = getBridgePagePath({
    fromChain: network.id,
    fromToken: token.address,
  });
  const tokenPath = getTokenPagePath({
    token: token.address,
    network: network.slugName,
  });
  const openTokenPage = () => router.push(tokenPath);

  return (
    <>
      <TableRow
        hover
        data-cy={`${token.symbol}-erc20-cell`}
        sx={{
          "> td": { py: 1 },
          ...getPortfolioRowActionStyles(theme),
          ...getPortfolioMobileRowStyles(theme),
        }}
      >
        <TableCell onClick={openTokenPage} sx={{ cursor: "pointer" }}>
          <ListItem disablePadding sx={{ p: 0 }}>
            <ListItemAvatar>
              <TokenIcon
                chainId={network.id}
                tokenAddress={token.address}
                logoURI={token.logoURI}
                symbol={token.symbol}
              />
            </ListItemAvatar>
            <ListItemText
              data-cy="token-symbol"
              primary={token.symbol}
              secondary={
                effectivePrice && (
                  <FiatAmount wei={1} decimals={0} price={effectivePrice} />
                )
              }
              slotProps={{
                primary: {
                  variant: "h6",
                  component: "div",
                  sx: !effectivePrice ? { lineHeight: "44px" } : {},
                },
                secondary: {
                  variant: "body2mono",
                  color: "textSecondary",
                },
              }}
              sx={{ minWidth: 0 }}
            />
          </ListItem>
        </TableCell>
        <TableCell
          align={isBelowMd ? "right" : "left"}
          onClick={openTokenPage}
          sx={{ cursor: "pointer", px: { xs: 1, md: 2 } }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-end", md: "flex-start" },
              minHeight: 44,
              width: "100%",
              boxSizing: "border-box",
              pr: { xs: 1, md: 0 },
            }}
          >
            <ListItemText
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: { xs: "right", md: "left" },
                [theme.breakpoints.down("md")]: {
                  height: 44,
                  my: 0,
                  position: "relative",
                },
              }}
              primary={<Amount wei={balance} decimals={token.decimals} />}
              secondary={
                priceUsd !== undefined ? (
                  <PortfolioFiatAmount
                    balance={balance}
                    decimals={token.decimals}
                    priceUsd={priceUsd}
                  />
                ) : tokenPrice ? (
                  <FiatAmount
                    wei={balance}
                    decimals={token.decimals}
                    price={tokenPrice}
                  />
                ) : null
              }
              slotProps={{
                primary: {
                  variant: isBelowMd ? "h7mono" : "h6mono",
                  sx: getPortfolioMobileNumericTextStyles(theme, "top"),
                },
                secondary: {
                  variant: "body2mono",
                  color: "textSecondary",
                  sx: getPortfolioMobileNumericTextStyles(theme, "bottom"),
                },
              }}
            />
          </Box>
        </TableCell>
        {!isBelowMd ? (
          <>
            <TableCell>
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                —
              </Typography>
            </TableCell>
            <TableCell sx={{ pl: 0 }}>
              <Box className={PORTFOLIO_ROW_ACTIONS_CLASS_NAME}>
                <PortfolioTokenActions
                  decimals={token.decimals}
                  network={network}
                  symbol={token.symbol}
                  tokenAddress={token.address}
                  streamPath={streamPath}
                  transferPath={transferPath}
                  wrapPath={wrapPath}
                  swapPath={!network.testnet ? swapPath : undefined}
                />
              </Box>
            </TableCell>
          </>
        ) : null}
        <TableCell align="center" sx={{ px: { xs: 0, md: 2 } }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "center",
              gap: 0.25,
            }}
          >
            <Tooltip title="Transfer history">
              <IconButton
                size={isBelowMd ? "small" : "medium"}
                data-cy="show-balance-updates-button"
                color="inherit"
                onClick={() => setOpen((currentlyOpen) => !currentlyOpen)}
                aria-label={`Show ${token.symbol} transfer history`}
                aria-expanded={open}
              >
                <OpenIcon open={open} icon={ExpandCircleDownOutlinedIcon} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow
        sx={{
          background: "transparent",
          "> td": { p: 0 },
          [theme.breakpoints.down("md")]: {
            display: "block",
            width: "100%",
            "> td": { display: "block", width: "100%", p: 0 },
          },
        }}
      >
        <TableCell colSpan={5} sx={{ border: "none" }}>
          <Collapse
            data-cy={`${token.address}-balance-updates`}
            in={open}
            timeout={theme.transitions.duration.standard}
            unmountOnExit
          >
            <ERC20BalanceUpdatesPanel
              address={address}
              network={network}
              token={token}
              streamPath={streamPath}
              transferPath={transferPath}
              wrapPath={wrapPath}
              swapPath={!network.testnet ? swapPath : undefined}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(ERC20BalanceRow);
