import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
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
import { FC, useEffect, useMemo, useState } from "react";
import { useAccount } from "@/hooks/useAccount";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { getFilteredStartDate } from "../../utils/chartUtils";
import { getTransferPagePath } from "../../pages/transfer";
import { getSendPagePath } from "../../pages/send";
import { getTokenPairsFromTokenList } from "../../hooks/useTokenQuery";
import useNavigateBack from "../../hooks/useNavigateBack";
import { EmptyRow } from "../common/EmptyRow";
import Link from "../common/Link";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { getBridgePagePath } from "../bridge/getBridgePagePath";
import { Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { tokenActionIconButtonSx } from "../token/tokenActionIconButtonStyles";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import PortfolioFiatAmount from "./PortfolioFiatAmount";
import AddToWalletButton from "../wallet/AddToWalletButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ERC20BalanceGraph, {
  ERC20_GRAPH_TIME_FILTERS,
} from "./ERC20BalanceGraph";
import ERC20TransferRow from "./ERC20TransferRow";
import TimeUnitFilter, { TimeUnitFilterType } from "../graph/TimeUnitFilter";
import useERC20TransferHistory from "./useERC20TransferHistory";

export interface ERC20TokenPageMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  priceUsd?: number;
}

enum TransferFilter {
  All = "all",
  Sent = "sent",
  Received = "received",
}

const MAX_AUTOMATIC_HISTORY_PAGES = 50;

const ERC20TokenPageContent: FC<{
  network: Network;
  token: ERC20TokenPageMetadata;
  accountAddress: string;
}> = ({ network, token, accountAddress }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigateBack = useNavigateBack();
  const [filter, setFilter] = useState(TransferFilter.All);
  const [graphFilter, setGraphFilter] = useState(TimeUnitFilterType.Week);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { address: connectedAccountAddress } = useAccount();

  const balanceQuery = rpcApi.useUnderlyingBalanceQuery({
    chainId: network.id,
    accountAddress,
    tokenAddress: token.address,
  });
  const fallbackTokenPrice = useTokenPrice(
    network.id,
    token.priceUsd === undefined ? token.address : undefined
  );
  const {
    transfers,
    hasMore,
    nextCursor,
    pagesLoaded,
    loadMore,
    isLoading: historyLoading,
    isFetching: historyFetching,
    isError: historyError,
  } = useERC20TransferHistory({
    address: accountAddress,
    tokenAddress: token.address,
    chainId: network.id,
  });

  const lowerAccountAddress = accountAddress.toLowerCase();
  const graphRangeStart = useMemo(() => {
    if (graphFilter === TimeUnitFilterType.All) return Number.NEGATIVE_INFINITY;
    const now = new Date();
    return getFilteredStartDate(graphFilter, now, now).getTime();
  }, [graphFilter]);
  const {
    oldestIncomingTimestamp,
    oldestOutgoingTimestamp,
    sentCount,
    receivedCount,
  } = useMemo(
    () =>
      transfers.reduce(
        (metrics, transfer) => {
          const timestamp = Date.parse(transfer.timestamp);
          if (!Number.isFinite(timestamp)) return metrics;
          if (transfer.to === lowerAccountAddress) {
            metrics.receivedCount += 1;
            metrics.oldestIncomingTimestamp = Math.min(
              metrics.oldestIncomingTimestamp,
              timestamp
            );
          }
          if (transfer.from === lowerAccountAddress) {
            metrics.sentCount += 1;
            metrics.oldestOutgoingTimestamp = Math.min(
              metrics.oldestOutgoingTimestamp,
              timestamp
            );
          }
          return metrics;
        },
        {
          oldestIncomingTimestamp: Number.POSITIVE_INFINITY,
          oldestOutgoingTimestamp: Number.POSITIVE_INFINITY,
          sentCount: 0,
          receivedCount: 0,
        }
      ),
    [lowerAccountAddress, transfers]
  );
  const incomingHistoryLoaded =
    nextCursor?.incoming === null || oldestIncomingTimestamp <= graphRangeStart;
  const outgoingHistoryLoaded =
    nextCursor?.outgoing === null || oldestOutgoingTimestamp <= graphRangeStart;
  const graphHistoryLoaded =
    pagesLoaded > 0 &&
    (!hasMore ||
      pagesLoaded >= MAX_AUTOMATIC_HISTORY_PAGES ||
      (incomingHistoryLoaded && outgoingHistoryLoaded));

  useEffect(() => {
    if (!graphHistoryLoaded && !historyFetching) {
      loadMore();
    }
  }, [graphHistoryLoaded, historyFetching, loadMore]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      if (filter === TransferFilter.Sent) {
        return transfer.from === lowerAccountAddress;
      }
      if (filter === TransferFilter.Received) {
        return transfer.to === lowerAccountAddress;
      }
      return true;
    });
  }, [filter, lowerAccountAddress, transfers]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  useEffect(() => {
    const requiredTransferCount = (page + 1) * rowsPerPage;
    if (
      filteredTransfers.length < requiredTransferCount &&
      hasMore &&
      !historyFetching
    ) {
      loadMore();
    }
  }, [
    filteredTransfers.length,
    hasMore,
    historyFetching,
    loadMore,
    page,
    rowsPerPage,
  ]);

  const visibleTransfers = filteredTransfers.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

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
  const balance = balanceQuery.currentData?.balance;
  const hasAddedToWallet = useHasFlag(
    connectedAccountAddress
      ? {
          type: Flag.TokenAdded,
          chainId: network.id,
          token: getAddress(token.address),
          account: getAddress(connectedAccountAddress),
        }
      : undefined
  );
  const tokenIdentity = (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2, minWidth: 0 }}>
      <TokenIcon
        chainId={network.id}
        tokenAddress={token.address}
        logoURI={token.logoURI}
        symbol={token.symbol}
      />
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "baseline", gap: 1, flexWrap: "wrap" }}
        >
          <Typography variant={isBelowMd ? "h4" : "h3"} component="h1">
            {token.name}
          </Typography>
          <Typography variant="h5" sx={{ color: "text.secondary" }}>
            {token.symbol}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
  const tokenActions = (
    <Box
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: "flex-end",
        gap: 1,
      }}
    >
      {!hasAddedToWallet ? (
        <ConnectionBoundary expectedNetwork={network}>
          {({ isConnected }) =>
            isConnected ? (
              <AddToWalletButton
                token={token.address}
                symbol={token.symbol}
                decimals={token.decimals}
              />
            ) : null
          }
        </ConnectionBoundary>
      ) : null}
      {streamPath ? (
        <Tooltip title="Stream">
          <IconButton
            LinkComponent={Link}
            href={streamPath}
            data-cy="token-stream-button"
            aria-label={`Stream ${token.symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <SendRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {wrapPath ? (
        <Tooltip title="Wrap">
          <IconButton
            LinkComponent={Link}
            href={wrapPath}
            data-cy="token-wrap-button"
            aria-label={`Wrap ${token.symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <AddCircleOutlineRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <Tooltip title="Transfer">
        <IconButton
          LinkComponent={Link}
          href={transferPath}
          data-cy="token-transfer-button"
          aria-label={`Transfer ${token.symbol}`}
          sx={tokenActionIconButtonSx}
        >
          <SwapHorizRoundedIcon />
        </IconButton>
      </Tooltip>
      {!network.testnet ? (
        <Tooltip title="Swap">
          <IconButton
            LinkComponent={Link}
            href={swapPath}
            data-cy="token-swap-button"
            aria-label={`Swap ${token.symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <CurrencyExchangeRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );

  return (
    <Stack
      sx={{
        gap: isBelowMd ? 3 : 4,
      }}
    >
      <Stack sx={{ gap: 2 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton color="inherit" onClick={navigateBack} aria-label="Back">
            <ArrowBackRoundedIcon />
          </IconButton>
          {!isBelowMd ? tokenIdentity : null}
          {!isBelowMd ? (
            <Chip
              size="small"
              label={network.name}
              avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
            />
          ) : null}
          <Box sx={{ flex: 1 }} />
          {tokenActions}
        </Stack>
        {isBelowMd ? tokenIdentity : null}
      </Stack>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack sx={{ gap: 3 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Balance
              </Typography>
              {balanceQuery.isLoading ? (
                <Skeleton width={220} height={54} />
              ) : balanceQuery.isError ? (
                <Typography variant="h3">—</Typography>
              ) : (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "baseline",
                    gap: 1,
                  }}
                >
                  <Typography variant="h3mono" data-cy="erc20-token-balance">
                    <Amount wei={balance ?? "0"} decimals={token.decimals} />
                  </Typography>
                  <Typography
                    variant="h5mono"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {token.symbol}
                  </Typography>
                </Stack>
              )}
              {balance ? (
                <Typography
                  variant="h5mono"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {token.priceUsd !== undefined ? (
                    <PortfolioFiatAmount
                      balance={balance}
                      decimals={token.decimals}
                      priceUsd={token.priceUsd}
                    />
                  ) : fallbackTokenPrice ? (
                    <FiatAmount
                      wei={balance}
                      decimals={token.decimals}
                      price={fallbackTokenPrice}
                    />
                  ) : null}
                </Typography>
              ) : null}
            </Box>
            <TimeUnitFilter
              activeFilter={graphFilter}
              onChange={setGraphFilter}
              options={ERC20_GRAPH_TIME_FILTERS}
            />
          </Stack>
          <ERC20BalanceGraph
            accountAddress={accountAddress}
            balance={balance}
            decimals={token.decimals}
            filter={graphFilter}
            loading={
              balanceQuery.isLoading || historyLoading || !graphHistoryLoaded
            }
            symbol={token.symbol}
            transfers={transfers}
          />
        </Stack>
      </Card>

      {historyError && transfers.length === 0 ? (
        <Alert severity="error">
          Transfer history is unavailable for this token or network.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            [theme.breakpoints.down("md")]: {
              mx: -2,
              width: "auto",
              borderRadius: 0,
              border: "none",
              borderBottom: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={3}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {Object.values(TransferFilter).map((filterOption) => (
                      <Button
                        key={filterOption}
                        size={isBelowMd ? "small" : "medium"}
                        variant="textContained"
                        color={
                          filter === filterOption ? "primary" : "secondary"
                        }
                        onClick={() => setFilter(filterOption)}
                      >
                        {filterOption === TransferFilter.All
                          ? `All (${transfers.length}${hasMore ? "+" : ""})`
                          : filterOption === TransferFilter.Sent
                          ? `Sent (${sentCount}${hasMore ? "+" : ""})`
                          : `Received (${receivedCount}${hasMore ? "+" : ""})`}
                      </Button>
                    ))}
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
              {(historyLoading && transfers.length === 0) ||
              (historyFetching && visibleTransfers.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton height={58} />
                  </TableCell>
                </TableRow>
              ) : filteredTransfers.length === 0 ? (
                <EmptyRow span={3} />
              ) : (
                visibleTransfers.map((transfer) => (
                  <ERC20TransferRow
                    key={transfer.id}
                    transfer={transfer}
                    accountAddress={accountAddress}
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
                count === -1
                  ? `${from}–${to} of more`
                  : `${from}–${to} of ${count}`
              }
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number.parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          ) : null}
        </TableContainer>
      )}
    </Stack>
  );
};

export default ERC20TokenPageContent;
