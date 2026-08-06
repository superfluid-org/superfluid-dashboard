import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
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
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
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
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ mb: recentTransfers.length > 0 ? 1.5 : 0 }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            RECENT BALANCE UPDATES
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
        <Typography variant="body2" color="text.secondary">
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
                  alignItems="center"
                  gap={1.5}
                  minWidth={0}
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
                  <Box minWidth={0}>
                    <Typography variant="body2">{direction}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(
                        new Date(transfer.timestamp),
                        "d MMM yyyy, HH:mm"
                      )}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  variant="body2mono"
                  textAlign="right"
                  color={
                    isSelfTransfer
                      ? "text.primary"
                      : isOutgoing
                      ? "error"
                      : "primary"
                  }
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
                  color="text.secondary"
                  sx={{ display: { xs: "none", md: "block" } }}
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
      hasPrice: priceUsd !== undefined || tokenPrice !== undefined,
      value: portfolioValue,
    });

    return () => portfolioValueCallback(portfolioValueId, undefined);
  }, [
    balance,
    portfolioValue,
    portfolioValueCallback,
    portfolioValueId,
    priceUsd,
    token.symbol,
    tokenPrice,
  ]);

  const transferPath = getTransferPagePath({
    token: token.address,
    network: network.slugName,
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
        sx={{ "> td": { py: 1 } }}
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
                <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
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
              primaryTypographyProps={{ variant: "h6", component: "div" }}
              secondaryTypographyProps={{
                variant: "body2",
                color: "text.secondary",
                noWrap: true,
              }}
              sx={{ minWidth: 0 }}
            />
          </ListItem>
        </TableCell>
        <TableCell onClick={openTokenPage} sx={{ cursor: "pointer" }}>
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
            primaryTypographyProps={{
              variant: isBelowMd ? "h7mono" : "h6mono",
            }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </TableCell>
        {!isBelowMd ? (
          <>
            <TableCell>
              <Typography color="text.secondary">—</Typography>
            </TableCell>
            <TableCell>
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
            </TableCell>
          </>
        ) : null}
        <TableCell align="center" sx={{ px: { xs: 0.5, md: 2 } }}>
          <Stack direction="row" justifyContent="center" gap={0.25}>
            {isBelowMd ? (
              <Tooltip title="Transfer">
                <IconButton
                  data-cy="portfolio-transfer-button"
                  LinkComponent={Link}
                  href={transferPath}
                  color="primary"
                  aria-label={`Transfer ${token.symbol}`}
                >
                  <SwapHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            <Tooltip title="Balance updates">
              <IconButton
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
