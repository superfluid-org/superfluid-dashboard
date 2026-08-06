import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
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
import useNavigateBack from "../../hooks/useNavigateBack";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { EmptyRow } from "../common/EmptyRow";
import Link from "../common/Link";
import TxHashLink from "../common/TxHashLink";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
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

const BalanceUpdateRow: FC<{
  transfer: ERC20TransferHistoryItem;
  accountAddress: string;
  token: ERC20TokenPageMetadata;
  network: Network;
}> = ({ transfer, accountAddress, token, network }) => {
  const isOutgoing = transfer.from === accountAddress.toLowerCase();
  const isSelfTransfer = isOutgoing && transfer.to === accountAddress.toLowerCase();
  const counterparty = isOutgoing ? transfer.to : transfer.from;
  const directionLabel = isSelfTransfer
    ? "Self transfer"
    : isOutgoing
      ? "Sent"
      : "Received";
  const amountPrefix = isSelfTransfer ? "" : isOutgoing ? "−" : "+";

  return (
    <TableRow hover data-cy="erc20-balance-update-row">
      <TableCell>
        <ListItem disablePadding>
          <ListItemAvatar>
            <Box
              sx={(theme) => ({
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: isOutgoing ? "error.main" : "primary.main",
                bgcolor: isOutgoing
                  ? `${theme.palette.error.main}12`
                  : `${theme.palette.primary.main}12`,
              })}
            >
              {isOutgoing ? (
                <ArrowUpwardRoundedIcon fontSize="small" />
              ) : (
                <ArrowDownwardRoundedIcon fontSize="small" />
              )}
            </Box>
          </ListItemAvatar>
          <ListItemText
            primary={directionLabel}
            secondary={format(new Date(transfer.timestamp), "d MMM yyyy, HH:mm")}
            primaryTypographyProps={{ variant: "h6" }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      <TableCell align="right">
        <Typography
          variant="h6mono"
          color={isSelfTransfer ? "text.primary" : isOutgoing ? "error" : "primary"}
        >
          {amountPrefix}
          <Amount
            wei={transfer.rawValue}
            decimals={transfer.decimals ?? token.decimals}
          >
            {` ${token.symbol}`}
          </Amount>
        </Typography>
      </TableCell>
      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        <ListItem disablePadding>
          <ListItemAvatar>
            <AddressAvatar address={counterparty} />
          </ListItemAvatar>
          <ListItemText
            primary={isSelfTransfer ? "Same wallet" : isOutgoing ? "To" : "From"}
            secondary={
              <AddressCopyTooltip address={counterparty}>
                <Typography variant="body2" color="text.primary" component="span">
                  <AddressName address={counterparty} />
                </Typography>
              </AddressCopyTooltip>
            }
            primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
          />
        </ListItem>
      </TableCell>
      <TableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>
        <TxHashLink txHash={transfer.transactionHash} network={network} />
      </TableCell>
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
  const [nextCursor, setNextCursor] =
    useState<ERC20TransferHistoryCursor>();
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

  const filteredTransfers = useMemo(() => {
    const lowerAccountAddress = accountAddress.toLowerCase();
    return transfers.filter((transfer) => {
      if (filter === TransferFilter.Sent) {
        return transfer.from === lowerAccountAddress;
      }
      if (filter === TransferFilter.Received) {
        return transfer.to === lowerAccountAddress;
      }
      return true;
    });
  }, [accountAddress, filter, transfers]);

  const transferPath = getTransferPagePath({
    token: token.address,
    network: network.slugName,
  });
  const balance = balanceQuery.currentData?.balance;

  return (
    <Stack gap={isBelowMd ? 3 : 4}>
      <Stack direction="row" alignItems="center" gap={2}>
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
          <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
            <Typography variant={isBelowMd ? "h4" : "h3"} component="h1">
              {token.name}
            </Typography>
            <Typography variant="h5" color="text.secondary">
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
        <Button
          LinkComponent={Link}
          href={transferPath}
          variant="contained"
          startIcon={<SwapHorizRoundedIcon />}
          sx={{ ml: "auto" }}
        >
          Transfer
        </Button>
      </Stack>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ md: "flex-end" }}
          justifyContent="space-between"
          gap={3}
        >
          <Box>
            <Typography color="text.secondary">Balance</Typography>
            {balanceQuery.isLoading ? (
              <Skeleton width={220} height={54} />
            ) : balanceQuery.isError ? (
              <Typography variant="h3">—</Typography>
            ) : (
              <Stack direction="row" alignItems="baseline" gap={1}>
                <Typography variant="h3mono" data-cy="erc20-token-balance">
                  <Amount wei={balance ?? "0"} decimals={token.decimals} />
                </Typography>
                <Typography variant="h5mono" color="text.secondary">
                  {token.symbol}
                </Typography>
              </Stack>
            )}
            {balance ? (
              <Typography variant="h5mono" color="text.secondary">
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
            <Typography variant="caption" color="text.secondary">
              TOKEN TYPE
            </Typography>
            <Stack direction="row" gap={1} alignItems="center" justifyContent={{ md: "flex-end" }}>
              <Chip label="ERC-20" size="small" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                Transfer-based history
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Box>
        <Typography variant="h5">Balance updates</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
              borderLeft: 0,
              borderRight: 0,
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={4}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    {Object.values(TransferFilter).map((filterOption) => (
                      <Button
                        key={filterOption}
                        size={isBelowMd ? "small" : "medium"}
                        variant="textContained"
                        color={filter === filterOption ? "primary" : "secondary"}
                        onClick={() => setFilter(filterOption)}
                      >
                        {filterOption === TransferFilter.All
                          ? "All"
                          : filterOption === TransferFilter.Sent
                            ? "Sent"
                            : "Received"}
                      </Button>
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
              {!isBelowMd ? (
                <TableRow>
                  <TableCell>Update</TableCell>
                  <TableCell align="right">Balance change</TableCell>
                  <TableCell>To / From</TableCell>
                  <TableCell align="right">Transaction</TableCell>
                </TableRow>
              ) : null}
            </TableHead>
            <TableBody>
              {historyQuery.isLoading && transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}><Skeleton height={58} /></TableCell>
                </TableRow>
              ) : filteredTransfers.length === 0 ? (
                <EmptyRow span={4} />
              ) : (
                filteredTransfers.map((transfer) => (
                  <BalanceUpdateRow
                    key={transfer.id}
                    transfer={transfer}
                    accountAddress={accountAddress}
                    token={token}
                    network={network}
                  />
                ))
              )}
            </TableBody>
          </Table>
          {hasMore ? (
            <Stack alignItems="center" sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
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
