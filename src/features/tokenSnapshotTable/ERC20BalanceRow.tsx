import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Decimal from "decimal.js";
import { format } from "date-fns";
import { BigNumber, utils } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, useEffect, useMemo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { getTransferPagePath } from "../../pages/transfer";
import { getSendPagePath } from "../../pages/send";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { getTokenPairsFromTokenList } from "../../hooks/useTokenQuery";
import { Currency } from "../../utils/currencyUtils";
import Link from "../common/Link";
import TxHashLink from "../common/TxHashLink";
import { Network } from "../network/networks";
import PortfolioFiatAmount from "../portfolio/PortfolioFiatAmount";
import { platformApi } from "../redux/platformApi/platformApi";
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
  getPortfolioRowActionStyles,
  PORTFOLIO_ROW_ACTIONS_CLASS_NAME,
} from "./portfolioRowActionStyles";

interface ERC20BalanceRowProps extends ERC20Balance {
  address: Address;
  network: Network;
  portfolioValueCallback: PortfolioValueCallback;
}

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

const ERC20BalanceUpdatesPanel: FC<{
  address: Address;
  network: Network;
  token: ERC20Balance["token"];
  tokenPath: string;
}> = ({ address, network, token, tokenPath }) => {
  const theme = useTheme();
  const historyQuery = platformApi.useErc20TransferHistoryQuery({
    address,
    tokenAddress: token.address,
    chainId: network.id,
  });
  const recentTransfers = historyQuery.currentData?.transfers.slice(0, 3) ?? [];
  const lowerAddress = address.toLowerCase();

  return (
    <Box
      data-cy="erc20-balance-updates-panel"
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        bgcolor: "background.default",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: recentTransfers.length > 0 ? 1.5 : 0,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            RECENT BALANCE UPDATES
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Incoming and outgoing ERC-20 transfers
          </Typography>
        </Box>
        <Button
          LinkComponent={Link}
          href={tokenPath}
          size="small"
          variant="outlined"
        >
          View all
        </Button>
      </Stack>

      {historyQuery.isLoading ? (
        <Skeleton height={52} />
      ) : historyQuery.isError ? (
        <Typography variant="body2" color="error">
          Balance history is unavailable right now.
        </Typography>
      ) : recentTransfers.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          No transfer activity yet.
        </Typography>
      ) : (
        <Stack
          divider={
            <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />
          }
        >
          {recentTransfers.map((transfer) => {
            const isOutgoing = transfer.from === lowerAddress;
            const isSelfTransfer = isOutgoing && transfer.to === lowerAddress;
            const counterparty = isOutgoing ? transfer.to : transfer.from;
            const direction = isSelfTransfer
              ? "Self transfer"
              : isOutgoing
              ? "Sent"
              : "Received";
            const amountPrefix = isSelfTransfer ? "" : isOutgoing ? "−" : "+";

            return (
              <Box
                key={transfer.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr) auto",
                    md: "minmax(180px, 1fr) 180px minmax(140px, 0.8fr) 80px",
                  },
                  alignItems: "center",
                  gap: 2,
                  py: 1.25,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={(currentTheme) => ({
                      width: 32,
                      height: 32,
                      flex: "0 0 auto",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: isOutgoing ? "error.main" : "primary.main",
                      bgcolor: isOutgoing
                        ? `${currentTheme.palette.error.main}12`
                        : `${currentTheme.palette.primary.main}12`,
                    })}
                  >
                    {isOutgoing ? (
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    )}
                  </Box>
                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography variant="body2">{direction}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {format(
                        new Date(transfer.timestamp),
                        "d MMM yyyy, HH:mm"
                      )}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  variant="body2mono"
                  color={
                    isSelfTransfer
                      ? "text.primary"
                      : isOutgoing
                      ? "error"
                      : "primary"
                  }
                  sx={{
                    textAlign: "right",
                  }}
                >
                  {amountPrefix}
                  <Amount
                    wei={transfer.rawValue}
                    decimals={transfer.decimals ?? token.decimals}
                  >
                    {` ${token.symbol}`}
                  </Amount>
                </Typography>
                <Typography
                  variant="body2mono"
                  sx={{
                    color: "text.secondary",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  {isOutgoing ? "To" : "From"} {shortenAddress(counterparty)}
                </Typography>
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    textAlign: "right",
                  }}
                >
                  <TxHashLink
                    txHash={transfer.transactionHash}
                    network={network}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
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
              primary={
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <Box component="span" sx={{ flexShrink: 0 }}>
                    {token.symbol}
                  </Box>
                  <Chip
                    label="ERC-20"
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ height: 22, flexShrink: 0 }}
                  />
                </Stack>
              }
              secondary={token.name}
              slotProps={{
                primary: { variant: "h6", component: "div" },
                secondary: {
                  variant: "body2",
                  color: "text.secondary",
                  noWrap: true,
                },
              }}
              sx={{ minWidth: 0 }}
            />
          </ListItem>
        </TableCell>
        <TableCell onClick={openTokenPage} sx={{ cursor: "pointer" }}>
          <Box sx={{ display: "flex", alignItems: "center", minHeight: 44 }}>
            <ListItemText
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
                },
                secondary: {
                  variant: "body2mono",
                  color: "text.secondary",
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
              <Stack
                className={PORTFOLIO_ROW_ACTIONS_CLASS_NAME}
                direction="row"
                sx={{ gap: 0.75 }}
              >
                {streamPath && (
                  <Button
                    data-cy="portfolio-stream-button"
                    LinkComponent={Link}
                    href={streamPath}
                    size="small"
                    variant="contained"
                    startIcon={<SendRoundedIcon />}
                  >
                    Stream
                  </Button>
                )}
                {wrapPath && (
                  <Button
                    data-cy="portfolio-wrap-button"
                    LinkComponent={Link}
                    href={wrapPath}
                    size="small"
                    variant="outlined"
                  >
                    Wrap
                  </Button>
                )}
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
        ) : null}
        <TableCell align="center" sx={{ px: { xs: 0.5, md: 2 } }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              gap: 0.25,
            }}
          >
            {isBelowMd ? (
              <>
                {streamPath && (
                  <Tooltip title="Stream">
                    <IconButton
                      size="small"
                      data-cy="portfolio-stream-button"
                      LinkComponent={Link}
                      href={streamPath}
                      color="primary"
                      aria-label={`Stream ${token.symbol}`}
                    >
                      <SendRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {wrapPath && (
                  <Tooltip title="Wrap">
                    <IconButton
                      size="small"
                      data-cy="portfolio-wrap-button"
                      LinkComponent={Link}
                      href={wrapPath}
                      color="primary"
                      aria-label={`Wrap ${token.symbol}`}
                    >
                      <AddCircleOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Transfer">
                  <IconButton
                    size="small"
                    data-cy="portfolio-transfer-button"
                    LinkComponent={Link}
                    href={transferPath}
                    color="primary"
                    aria-label={`Transfer ${token.symbol}`}
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
                      aria-label={`Swap ${token.symbol}`}
                    >
                      <CurrencyExchangeRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : null}
            <Tooltip title="Balance updates">
              <IconButton
                size={isBelowMd ? "small" : "medium"}
                data-cy="show-balance-updates-button"
                color="inherit"
                onClick={() => setOpen((currentlyOpen) => !currentlyOpen)}
                aria-label={`Show ${token.symbol} balance updates`}
                aria-expanded={open}
              >
                <OpenIcon open={open} icon={ExpandCircleDownOutlinedIcon} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow sx={{ background: "transparent", "> td": { p: 0 } }}>
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
              tokenPath={tokenPath}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(ERC20BalanceRow);
