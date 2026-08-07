import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { FC, useEffect, useMemo, useState } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { getTransferPagePath } from "../../pages/transfer";
import { getSendPagePath } from "../../pages/send";
import { getTokenPairsFromTokenList } from "../../hooks/useTokenQuery";
import useNavigateBack from "../../hooks/useNavigateBack";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { EmptyRow } from "../common/EmptyRow";
import Link from "../common/Link";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { getBridgePagePath } from "../bridge/getBridgePagePath";
import { platformApi } from "../redux/platformApi/platformApi";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import PortfolioFiatAmount from "./PortfolioFiatAmount";
import {
  ERC20TransferHistoryCursor,
  ERC20TransferHistoryItem,
} from "./erc20TransferHistory";

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

const ERC20TransferRow: FC<{
  transfer: ERC20TransferHistoryItem;
  accountAddress: string;
  token: ERC20TokenPageMetadata;
}> = ({ transfer, accountAddress, token }) => {
  const isOutgoing = transfer.from === accountAddress.toLowerCase();
  const counterparty = isOutgoing ? transfer.to : transfer.from;
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const formattedDate = format(new Date(transfer.timestamp), "d MMM. yyyy");

  return (
    <TableRow hover data-cy="erc20-transfer-row">
      <TableCell data-cy="sender-receiver-address">
        <Stack
          direction="row"
          sx={{ alignItems: "center", gap: 1.5, minWidth: 0 }}
        >
          {isOutgoing ? (
            <ArrowForwardIcon data-cy="transfer-outgoing-icon" />
          ) : (
            <ArrowBackIcon data-cy="transfer-incoming-icon" />
          )}
          <AddressAvatar
            address={counterparty}
            AvatarProps={{
              sx: { width: 24, height: 24, borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <AddressCopyTooltip address={counterparty}>
            <Typography variant="h7" noWrap>
              <AddressName address={counterparty} />
            </Typography>
          </AddressCopyTooltip>
        </Stack>
      </TableCell>
      <TableCell data-cy="transfer-amount" align="right">
        <ListItemText
          primary={
            <Amount
              wei={transfer.rawValue}
              decimals={transfer.decimals ?? token.decimals}
            />
          }
          secondary={isBelowMd ? formattedDate : undefined}
          slotProps={{
            primary: { variant: "h7mono" },
            secondary: {
              variant: "body2mono",
              color: "text.secondary",
            },
          }}
        />
      </TableCell>
      {!isBelowMd ? (
        <TableCell data-cy="transfer-date">{formattedDate}</TableCell>
      ) : null}
    </TableRow>
  );
};

const ERC20TokenPageContent: FC<{
  network: Network;
  token: ERC20TokenPageMetadata;
  accountAddress: string;
}> = ({ network, token, accountAddress }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigateBack = useNavigateBack();
  const [filter, setFilter] = useState(TransferFilter.All);
  const [requestCursor, setRequestCursor] =
    useState<ERC20TransferHistoryCursor>();
  const [nextCursor, setNextCursor] = useState<ERC20TransferHistoryCursor>();
  const [hasMore, setHasMore] = useState(false);
  const [transfers, setTransfers] = useState<ERC20TransferHistoryItem[]>([]);

  const balanceQuery = rpcApi.useUnderlyingBalanceQuery({
    chainId: network.id,
    accountAddress,
    tokenAddress: token.address,
  });
  const fallbackTokenPrice = useTokenPrice(
    network.id,
    token.priceUsd === undefined ? token.address : undefined
  );
  const historyQuery = platformApi.useErc20TransferHistoryQuery({
    address: accountAddress,
    tokenAddress: token.address,
    chainId: network.id,
    ...(requestCursor ? { cursor: requestCursor } : {}),
  });

  useEffect(() => {
    const page = historyQuery.currentData;
    if (!page) return;

    setTransfers((current) => {
      const byId = new Map(current.map((transfer) => [transfer.id, transfer]));
      page.transfers.forEach((transfer) => byId.set(transfer.id, transfer));
      return [...byId.values()].sort(
        (first, second) =>
          Date.parse(second.timestamp) - Date.parse(first.timestamp)
      );
    });
    setNextCursor(page.cursor);
    setHasMore(page.hasMore);
  }, [historyQuery.currentData]);

  const lowerAccountAddress = accountAddress.toLowerCase();
  const { sentCount, receivedCount } = useMemo(
    () => ({
      sentCount: transfers.filter(({ from }) => from === lowerAccountAddress)
        .length,
      receivedCount: transfers.filter(({ to }) => to === lowerAccountAddress)
        .length,
    }),
    [lowerAccountAddress, transfers]
  );

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
          <TokenIcon
            chainId={network.id}
            tokenAddress={token.address}
            logoURI={token.logoURI}
            symbol={token.symbol}
          />
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "baseline",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant={isBelowMd ? "h4" : "h3"} component="h1">
                {token.name}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: "text.secondary",
                }}
              >
                {token.symbol}
              </Typography>
            </Stack>
          </Box>
          <Chip
            size="small"
            label={network.name}
            avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
            sx={{ display: { xs: "none", md: "flex" } }}
          />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(4, max-content)",
            },
            justifyContent: { sm: "flex-end" },
            gap: 1,
          }}
        >
          {streamPath ? (
            <Button
              LinkComponent={Link}
              href={streamPath}
              variant="contained"
              size="small"
              startIcon={<SendRoundedIcon />}
              data-cy="token-stream-button"
            >
              Stream
            </Button>
          ) : null}
          {wrapPath ? (
            <Button
              LinkComponent={Link}
              href={wrapPath}
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutlineRoundedIcon />}
              data-cy="token-wrap-button"
            >
              Wrap
            </Button>
          ) : null}
          <Button
            LinkComponent={Link}
            href={transferPath}
            variant={streamPath ? "outlined" : "contained"}
            size="small"
            startIcon={<SwapHorizRoundedIcon />}
            data-cy="token-transfer-button"
          >
            Transfer
          </Button>
          {!network.testnet ? (
            <Button
              LinkComponent={Link}
              href={swapPath}
              variant="outlined"
              size="small"
              startIcon={<CurrencyExchangeRoundedIcon />}
              data-cy="token-swap-button"
            >
              Swap
            </Button>
          ) : null}
        </Box>
      </Stack>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: { md: "flex-end" },
            justifyContent: "space-between",
            gap: 3,
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
          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              Token type
            </Typography>
            <Stack
              direction="row"
              sx={{
                gap: 1,
                alignItems: "center",
                justifyContent: { md: "flex-end" },
              }}
            >
              <Chip label="ERC-20" size="small" variant="outlined" />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Transfer-based history
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Box>
        <Typography variant="h5">Transfers</Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 0.5,
          }}
        >
          Incoming and outgoing ERC-20 transfers indexed by Alchemy. Rebases and
          other non-transfer balance changes may not appear here.
        </Typography>
      </Box>

      {historyQuery.isError && transfers.length === 0 ? (
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
                          ? `All (${transfers.length})`
                          : filterOption === TransferFilter.Sent
                          ? `Sent (${sentCount})`
                          : `Received (${receivedCount})`}
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
              {historyQuery.isLoading && transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton height={58} />
                  </TableCell>
                </TableRow>
              ) : filteredTransfers.length === 0 ? (
                <EmptyRow span={3} />
              ) : (
                filteredTransfers.map((transfer) => (
                  <ERC20TransferRow
                    key={transfer.id}
                    transfer={transfer}
                    accountAddress={accountAddress}
                    token={token}
                  />
                ))
              )}
            </TableBody>
          </Table>
          {hasMore ? (
            <Stack
              sx={{
                alignItems: "center",
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                variant="outlined"
                disabled={historyQuery.isFetching || !nextCursor}
                onClick={() => nextCursor && setRequestCursor(nextCursor)}
              >
                {historyQuery.isFetching ? "Loading…" : "Load more"}
              </Button>
            </Stack>
          ) : null}
        </TableContainer>
      )}
    </Stack>
  );
};

export default ERC20TokenPageContent;
