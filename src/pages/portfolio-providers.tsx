import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Link,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { utils } from "ethers";
import type { NextPage } from "next";
import NextLink from "next/link";
import { FC, ReactNode, useMemo, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { mainNetworks } from "../features/network/networks";
import {
  AnkrPortfolioAsset,
  AnkrPortfolioNft,
} from "../features/portfolio/ankrPortfolio";
import {
  MoralisDefiPosition,
  MoralisPortfolioAsset,
} from "../features/portfolio/moralisPortfolio";
import { PortfolioToken } from "../features/portfolio/portfolioTokens";
import {
  ZerionChartPoint,
  ZerionPortfolioPosition,
} from "../features/portfolio/zerionPortfolio";
import { platformApi } from "../features/redux/platformApi/platformApi";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

type ProviderId = "alchemy" | "ankr" | "moralis" | "zerion";
type PositionFilter = "all" | "wallet" | "defi" | "staked";

const providerOptions: Array<{
  id: ProviderId;
  name: string;
  avatar: string;
  description: string;
  color: string;
}> = [
  {
    id: "zerion",
    name: "Zerion",
    avatar: "Z",
    description: "Wallet + DeFi positions",
    color: "#2962ff",
  },
  {
    id: "alchemy",
    name: "Alchemy",
    avatar: "A",
    description: "Dashboard ERC-20 pipeline",
    color: "#363ff9",
  },
  {
    id: "ankr",
    name: "Ankr",
    avatar: "An",
    description: "Tokens + NFTs + activity",
    color: "#356df3",
  },
  {
    id: "moralis",
    name: "Moralis",
    avatar: "M",
    description: "Trust signals + DeFi + P&L",
    color: "#00a69c",
  },
];

const providerNames = Object.fromEntries(
  providerOptions.map(({ id, name }) => [id, name])
) as Record<ProviderId, string>;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const formatUsd = (value?: number) =>
  value !== undefined && Number.isFinite(value) ? usd.format(value) : "—";

const formatQuantity = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? quantityFormatter.format(parsed) : value;
};

const formatPercent = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
};

const titleCase = (value: string) =>
  value
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const chainLabel = (chainId: string) => {
  const aliases: Record<string, string> = {
    "0x1": "Ethereum",
    "0x38": "BNB Smart Chain",
    "0x64": "Gnosis",
    "0x89": "Polygon",
    "0x2105": "Base",
    "0xa": "Optimism",
    "0xa4b1": "Arbitrum One",
    "0xa86a": "Avalanche",
    "0xe708": "Linea",
    arbitrum: "Arbitrum One",
    "binance-smart-chain": "BNB Smart Chain",
    ethereum: "Ethereum",
    optimism: "Optimism",
    polygon: "Polygon",
    xdai: "Gnosis",
    "zksync-era": "zkSync Era",
  };
  return aliases[chainId] ?? titleCase(chainId);
};

const positionTypeLabel = (type: string) => {
  const aliases: Record<string, string> = {
    deposit: "Deposited",
    deposited: "Deposited",
    loan: "Borrowed",
    lending: "Lending",
    liquidity: "Liquidity",
    defi: "DeFi",
    borrowed: "Borrowed",
    reward: "Reward",
    staked: "Staked",
    wallet: "Wallet",
  };
  return aliases[type] ?? titleCase(type);
};

const getQueryError = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const data = "data" in error ? error.data : undefined;
  if (data && typeof data === "object" && "error" in data) {
    const message = data.error;
    return typeof message === "string" ? message : undefined;
  }
  return "error" in error && typeof error.error === "string"
    ? error.error
    : undefined;
};

const ChangeValue: FC<{ value?: number; suffix?: ReactNode }> = ({
  value,
  suffix,
}) => {
  const color =
    value === undefined || value === 0
      ? "text.secondary"
      : value > 0
      ? "primary.main"
      : "error.main";
  return (
    <Typography
      variant="body2"
      sx={{ color, fontVariantNumeric: "tabular-nums" }}
    >
      {formatPercent(value)} {suffix}
    </Typography>
  );
};

const ProviderSelector: FC<{
  value: ProviderId;
  onChange: (provider: ProviderId) => void;
}> = ({ value, onChange }) => (
  <Paper variant="outlined" sx={{ p: { xs: 0.75, sm: 1 }, borderRadius: 3 }}>
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={value}
      onChange={(_, next: ProviderId | null) => {
        if (next) onChange(next);
      }}
      aria-label="Portfolio data provider"
      sx={{
        gap: { xs: 0.5, sm: 1 },
        "& .MuiToggleButtonGroup-grouped": {
          m: 0,
          border: "1px solid transparent",
          borderRadius: "12px !important",
          minWidth: 0,
          px: { xs: 0.25, sm: 1.5 },
          py: { xs: 1.25, sm: 1.5 },
          justifyContent: "flex-start",
          textAlign: "left",
          textTransform: "none",
          "&.Mui-selected": {
            borderColor: "primary.main",
            bgcolor: "primary.50",
          },
        },
      }}
    >
      {providerOptions.map((option) => (
        <ToggleButton key={option.id} value={option.id}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
              gap: { xs: 0.5, sm: 1.25 },
              minWidth: 0,
              width: "100%",
            }}
          >
            <Avatar
              sx={{
                width: { xs: 26, sm: 34 },
                height: { xs: 26, sm: 34 },
                bgcolor: option.color,
                color: "#fff",
                fontSize: { xs: 10, sm: 13 },
                fontWeight: 800,
              }}
            >
              {option.avatar}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: { xs: 12, sm: 15 } }}
              >
                {option.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: { xs: "none", lg: "block" } }}
              >
                {option.description}
              </Typography>
            </Box>
            {value === option.id ? (
              <CheckCircleRoundedIcon
                color="primary"
                sx={{ ml: "auto", display: { xs: "none", md: "block" } }}
              />
            ) : null}
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Paper>
);

const TokenAvatar: FC<{
  symbol: string;
  iconUrl?: string;
  protocolIconUrl?: string;
}> = ({ symbol, iconUrl, protocolIconUrl }) => (
  <Box sx={{ position: "relative", flex: "0 0 auto" }}>
    <Avatar
      src={iconUrl}
      alt=""
      sx={{
        width: 38,
        height: 38,
        bgcolor: "action.hover",
        color: "text.primary",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {symbol.slice(0, 3)}
    </Avatar>
    {protocolIconUrl ? (
      <Avatar
        src={protocolIconUrl}
        alt=""
        sx={{
          position: "absolute",
          right: -4,
          bottom: -4,
          width: 18,
          height: 18,
          border: "2px solid",
          borderColor: "background.paper",
          bgcolor: "background.paper",
        }}
      />
    ) : null}
  </Box>
);

const PortfolioChart: FC<{
  points: ZerionChartPoint[];
  unavailable: boolean;
}> = ({ points, unavailable }) => {
  const theme = useTheme();
  const path = useMemo(() => {
    if (points.length < 2) return undefined;
    const values = points.map(({ value }) => value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const width = 760;
    const height = 168;
    const padding = 8;
    const coordinates = points.map(({ value }, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = padding + ((max - value) / span) * (height - padding * 2);
      return [x, y] as const;
    });
    return {
      line: coordinates.map(([x, y]) => `${x},${y}`).join(" "),
      area: `${padding},${height} ${coordinates
        .map(([x, y]) => `${x},${y}`)
        .join(" ")} ${width - padding},${height}`,
      min,
      max,
    };
  }, [points]);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, minHeight: 264 }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h6">Portfolio history</Typography>
          <Typography variant="body2" color="text.secondary">
            1 month · wallet and supported protocol positions
          </Typography>
        </Box>
        <ShowChartRoundedIcon color="primary" />
      </Stack>

      {path ? (
        <Box sx={{ position: "relative", height: 176 }}>
          <Box
            component="svg"
            viewBox="0 0 760 176"
            preserveAspectRatio="none"
            role="img"
            aria-label="One month portfolio value chart"
            sx={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            <defs>
              <linearGradient
                id="zerion-chart-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity="0.28"
                />
                <stop
                  offset="100%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <line
              x1="8"
              x2="752"
              y1="168"
              y2="168"
              stroke={theme.palette.divider}
            />
            <polygon points={path.area} fill="url(#zerion-chart-fill)" />
            <polyline
              points={path.line}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </Box>
          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              justifyContent: "space-between",
              pointerEvents: "none",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {compactUsd.format(path.max)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {compactUsd.format(path.min)}
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Stack
          sx={{
            height: 176,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {unavailable
              ? "History is temporarily unavailable. Current positions are still shown below."
              : "Zerion did not return enough history to draw a chart for this wallet."}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

const TypeBreakdown: FC<{ values: Record<string, number> }> = ({ values }) => {
  const normalized = useMemo(() => {
    const entries = Object.entries(values)
      .filter(([, value]) => Number.isFinite(value) && value !== 0)
      .sort(([, first], [, second]) => Math.abs(second) - Math.abs(first));
    const total = entries.reduce((sum, [, value]) => sum + Math.abs(value), 0);
    return entries.map(([type, value]) => ({
      type,
      value,
      share: total ? (Math.abs(value) / total) * 100 : 0,
    }));
  }, [values]);

  const icons: Record<string, ReactNode> = {
    borrowed: <AccountBalanceRoundedIcon />,
    deposited: <SavingsRoundedIcon />,
    locked: <LockRoundedIcon />,
    staked: <HubRoundedIcon />,
    wallet: <AccountBalanceWalletRoundedIcon />,
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
      <Typography variant="h6">Where the value sits</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Zerion’s protocol-aware position breakdown
      </Typography>
      <Stack sx={{ gap: 2 }}>
        {normalized.length ? (
          normalized.map(({ type, value, share }) => (
            <Stack
              key={type}
              direction="row"
              sx={{ gap: 1.5, alignItems: "center" }}
            >
              <Box
                sx={{
                  color: type === "borrowed" ? "error.main" : "primary.main",
                  display: "flex",
                }}
              >
                {icons[type] ?? <HubRoundedIcon />}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", gap: 2, mb: 0.75 }}
                >
                  <Typography variant="body2">
                    {positionTypeLabel(type)}
                  </Typography>
                  <Typography variant="body2mono">
                    {formatUsd(value)}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    height: 5,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.max(2, share)}%`,
                      height: "100%",
                      borderRadius: "inherit",
                      bgcolor:
                        type === "borrowed" ? "error.main" : "primary.main",
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No position breakdown was returned.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

const SummaryCard: FC<{
  provider: ProviderId;
  total?: number;
  changePercent24h?: number;
  positions?: number;
  networks?: number;
  loading: boolean;
}> = ({ provider, total, changePercent24h, positions, networks, loading }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 2.5, md: 3 },
        borderRadius: 3,
        background: `linear-gradient(125deg, ${alpha(
          theme.palette.primary.main,
          0.11
        )}, ${alpha(theme.palette.background.paper, 0.96)} 48%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 190,
          height: 190,
          right: -70,
          top: -90,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        }}
      />
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(280px, 1.5fr) repeat(2, minmax(130px, .55fr))",
          },
          gap: { xs: 2.5, md: 3 },
          alignItems: "end",
        }}
      >
        <Box>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              {provider === "moralis"
                ? "Liquid portfolio value"
                : "Combined portfolio value"}
            </Typography>
            <Chip
              label={providerNames[provider]}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
          {loading ? (
            <Skeleton width={240} height={58} />
          ) : (
            <Stack
              direction="row"
              sx={{ alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}
            >
              <Typography variant="h2" sx={{ letterSpacing: "-0.045em" }}>
                {formatUsd(total)}
              </Typography>
              {provider === "zerion" ? (
                <ChangeValue value={changePercent24h} suffix="24h" />
              ) : null}
            </Stack>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {provider === "zerion"
              ? "Wallet balances and supported DeFi positions"
              : provider === "ankr"
              ? "Native assets and whitelisted tokens across supported networks"
              : provider === "moralis"
              ? "Native and token balances across Moralis mainnets, excluding spam from the total"
              : "Priced ERC-20 wallet balances from the dashboard integration"}
          </Typography>
        </Box>
        {[
          { label: "Positions", value: positions },
          { label: "Networks", value: networks },
        ].map(({ label, value }) => (
          <Box
            key={label}
            sx={{
              pl: { md: 3 },
              borderLeft: { md: "1px solid" },
              borderColor: "divider",
            }}
          >
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={70} height={40} />
            ) : (
              <Typography variant="h4mono">{value ?? 0}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const PositionTable: FC<{ positions: ZerionPortfolioPosition[] }> = ({
  positions,
}) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{ borderRadius: 3, overflowX: "auto" }}
  >
    <Table sx={{ minWidth: 830 }}>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Position</TableCell>
          <TableCell>Network</TableCell>
          <TableCell align="right">Balance</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Value</TableCell>
          <TableCell align="right">24h</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {positions.map((position) => (
          <TableRow
            hover
            key={position.id}
            sx={{
              "&:last-child td": { borderBottom: 0 },
              transition: "background-color 160ms ease",
            }}
          >
            <TableCell>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                <TokenAvatar
                  symbol={position.symbol}
                  iconUrl={position.iconUrl}
                  protocolIconUrl={position.protocolIconUrl}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: "center", gap: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {position.symbol}
                    </Typography>
                    {position.verified ? (
                      <Tooltip title="Verified by Zerion">
                        <VerifiedRoundedIcon
                          color="primary"
                          sx={{ fontSize: 15 }}
                        />
                      </Tooltip>
                    ) : null}
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block", maxWidth: 150 }}
                  >
                    {position.name}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack sx={{ alignItems: "flex-start", gap: 0.5 }}>
                <Chip
                  size="small"
                  label={positionTypeLabel(position.positionType)}
                  color={
                    position.positionType === "loan"
                      ? "error"
                      : position.positionType === "wallet"
                      ? "default"
                      : "primary"
                  }
                  variant="outlined"
                />
                {position.protocol ? (
                  <Typography variant="caption" color="text.secondary">
                    {position.protocol}
                    {position.protocolModule
                      ? ` · ${titleCase(position.protocolModule)}`
                      : ""}
                  </Typography>
                ) : null}
              </Stack>
            </TableCell>
            <TableCell>{chainLabel(position.chainId)}</TableCell>
            <TableCell align="right">
              <Typography variant="body2mono">
                {formatQuantity(position.quantity)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" color="text.secondary">
                {formatUsd(position.price)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" sx={{ fontWeight: 600 }}>
                {formatUsd(position.value)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <ChangeValue value={position.changePercent24h} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const AlchemyTable: FC<{ tokens: PortfolioToken[] }> = ({ tokens }) => {
  const networksById = useMemo(
    () => new Map(mainNetworks.map((network) => [network.id, network])),
    []
  );
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 3, overflowX: "auto" }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Network</TableCell>
            <TableCell align="right">Balance</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.map((token) => {
            const network = networksById.get(token.chainId);
            let balance = token.balance;
            try {
              balance = utils.formatUnits(token.balance, token.decimals);
            } catch {
              // Keep the raw value if a provider returns malformed unit metadata.
            }
            return (
              <TableRow
                hover
                key={`${token.chainId}-${token.tokenAddress}`}
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    sx={{ alignItems: "center", gap: 1.5 }}
                  >
                    <TokenAvatar
                      symbol={token.symbol}
                      iconUrl={token.logoURI}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {token.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {token.name}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    {network?.icon ? (
                      <Avatar
                        src={network.icon}
                        alt=""
                        sx={{ width: 20, height: 20 }}
                      />
                    ) : null}
                    {network?.name ?? `Chain ${token.chainId}`}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2mono">
                    {formatQuantity(balance)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2mono" color="text.secondary">
                    {formatUsd(token.priceUsd)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2mono" sx={{ fontWeight: 600 }}>
                    {formatUsd(token.valueUsd)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AnkrTable: FC<{ assets: AnkrPortfolioAsset[] }> = ({ assets }) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{ borderRadius: 3, overflowX: "auto" }}
  >
    <Table sx={{ minWidth: 760 }}>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Network</TableCell>
          <TableCell align="right">Balance</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {assets.map((asset) => (
          <TableRow
            hover
            key={asset.id}
            sx={{ "&:last-child td": { borderBottom: 0 } }}
          >
            <TableCell>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                <TokenAvatar symbol={asset.symbol} iconUrl={asset.thumbnail} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {asset.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {asset.name}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell>
              <Chip
                size="small"
                label={
                  asset.tokenType.toUpperCase() === "NATIVE"
                    ? "Native"
                    : asset.tokenType
                }
                color={
                  asset.tokenType.toUpperCase() === "NATIVE"
                    ? "primary"
                    : "default"
                }
                variant="outlined"
              />
            </TableCell>
            <TableCell>{chainLabel(asset.blockchain)}</TableCell>
            <TableCell align="right">
              <Typography variant="body2mono">
                {formatQuantity(asset.balance)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" color="text.secondary">
                {formatUsd(asset.priceUsd)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" sx={{ fontWeight: 600 }}>
                {formatUsd(asset.valueUsd)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const MoralisTrustChip: FC<{ asset: MoralisPortfolioAsset }> = ({ asset }) => {
  if (asset.possibleSpam) {
    return (
      <Tooltip title="Moralis marked this token as possible spam. Its value is excluded from the portfolio total.">
        <Chip
          size="small"
          icon={<WarningAmberRoundedIcon />}
          label="Spam"
          color="warning"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  if (asset.securityScore !== undefined) {
    const color =
      asset.securityScore >= 80
        ? "primary"
        : asset.securityScore >= 50
        ? "warning"
        : "error";
    return (
      <Tooltip title="Moralis token security score">
        <Chip
          size="small"
          icon={<ShieldRoundedIcon />}
          label={`${asset.securityScore}/100`}
          color={color}
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return asset.nativeToken || asset.verifiedContract ? (
    <Chip
      size="small"
      icon={<VerifiedRoundedIcon />}
      label={asset.nativeToken ? "Native" : "Verified"}
      color="primary"
      variant="outlined"
    />
  ) : (
    <Typography variant="caption" color="text.secondary">
      Unscored
    </Typography>
  );
};

const MoralisAssetTable: FC<{ assets: MoralisPortfolioAsset[] }> = ({
  assets,
}) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{ borderRadius: 3, overflowX: "auto" }}
  >
    <Table sx={{ minWidth: 960 }}>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Trust</TableCell>
          <TableCell>Network</TableCell>
          <TableCell align="right">Balance</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Value</TableCell>
          <TableCell align="right">24h</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {assets.map((asset) => (
          <TableRow
            hover
            key={asset.id}
            sx={{
              opacity: asset.possibleSpam ? 0.68 : 1,
              "&:last-child td": { borderBottom: 0 },
            }}
          >
            <TableCell>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                <TokenAvatar symbol={asset.symbol} iconUrl={asset.logo} />
                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: "center", gap: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {asset.symbol}
                    </Typography>
                    {asset.verifiedContract ? (
                      <VerifiedRoundedIcon
                        color="primary"
                        sx={{ fontSize: 14 }}
                      />
                    ) : null}
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block", maxWidth: 220 }}
                  >
                    {asset.name}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell>
              <MoralisTrustChip asset={asset} />
            </TableCell>
            <TableCell>{chainLabel(asset.chainId)}</TableCell>
            <TableCell align="right">
              <Typography variant="body2mono">
                {formatQuantity(asset.balance)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" color="text.secondary">
                {formatUsd(asset.priceUsd)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" sx={{ fontWeight: 600 }}>
                {formatUsd(asset.valueUsd)}
              </Typography>
              {asset.portfolioPercentage !== undefined ? (
                <Typography variant="caption" color="text.secondary">
                  {Math.abs(asset.portfolioPercentage).toFixed(1)}% of wallet
                </Typography>
              ) : null}
            </TableCell>
            <TableCell align="right">
              <ChangeValue value={asset.changePercent24h} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const MoralisDefiTable: FC<{ positions: MoralisDefiPosition[] }> = ({
  positions,
}) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{ borderRadius: 3, overflowX: "auto" }}
  >
    <Table sx={{ minWidth: 860 }}>
      <TableHead>
        <TableRow>
          <TableCell>Protocol</TableCell>
          <TableCell>Position</TableCell>
          <TableCell>Network</TableCell>
          <TableCell>Assets</TableCell>
          <TableCell align="right">Rewards</TableCell>
          <TableCell align="right">Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {positions.map((position) => (
          <TableRow
            hover
            key={position.id}
            sx={{ "&:last-child td": { borderBottom: 0 } }}
          >
            <TableCell>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={position.protocolLogo}
                  alt=""
                  sx={{ width: 34, height: 34, bgcolor: "action.hover" }}
                >
                  {position.protocolName.slice(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {position.protocolName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {position.protocolId}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                <Chip
                  size="small"
                  label={positionTypeLabel(position.positionType)}
                  color={position.isDebt ? "error" : "primary"}
                  variant="outlined"
                />
                {position.healthFactor !== undefined ? (
                  <Tooltip title="Lending health factor reported by Moralis">
                    <Typography variant="caption" color="text.secondary">
                      HF {position.healthFactor.toFixed(2)}
                    </Typography>
                  </Tooltip>
                ) : null}
              </Stack>
            </TableCell>
            <TableCell>{chainLabel(position.chainId)}</TableCell>
            <TableCell>
              <Typography variant="body2">
                {position.tokens
                  .slice(0, 3)
                  .map(({ symbol }) => symbol)
                  .join(" · ") || "—"}
                {position.tokens.length > 3
                  ? ` +${position.tokens.length - 3}`
                  : ""}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2mono" color="text.secondary">
                {formatUsd(position.unclaimedUsd)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography
                variant="body2mono"
                sx={{
                  fontWeight: 600,
                  color: position.isDebt ? "error.main" : "text.primary",
                }}
              >
                {formatUsd(position.valueUsd)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const AnkrNftGallery: FC<{ nfts: AnkrPortfolioNft[]; limited: boolean }> = ({
  nfts,
  limited,
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h5">NFT preview</Typography>
        <Typography variant="body2" color="text.secondary">
          ERC-721, ERC-1155, ENS and POAP assets found by Ankr
        </Typography>
      </Box>
      <Chip
        icon={<CollectionsRoundedIcon />}
        size="small"
        label={`${nfts.length}${limited ? "+" : ""} found`}
        variant="outlined"
      />
    </Stack>
    {nfts.length ? (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {nfts.slice(0, 10).map((nft) => (
          <Box
            key={nft.id}
            sx={{
              minWidth: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "action.hover",
            }}
          >
            <Box
              component={nft.imageUrl ? "img" : "div"}
              src={nft.imageUrl}
              alt=""
              sx={{
                display: "flex",
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.selected",
              }}
            >
              {!nft.imageUrl ? (
                <CollectionsRoundedIcon sx={{ color: "text.disabled" }} />
              ) : null}
            </Box>
            <Box sx={{ p: 1.25 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {nft.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: "block" }}
              >
                {nft.collectionName || chainLabel(nft.blockchain)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Ankr did not return any NFTs for this wallet.
      </Typography>
    )}
  </Paper>
);

const EmptyTable: FC<{ message: string }> = ({ message }) => (
  <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
    <AccountBalanceWalletRoundedIcon
      sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
    />
    <Typography color="text.secondary">{message}</Typography>
  </Paper>
);

const LoadingView: FC = () => (
  <Stack sx={{ gap: 3 }} aria-label="Loading provider portfolio">
    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
        gap: 3,
      }}
    >
      <Skeleton variant="rounded" height={264} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rounded" height={264} sx={{ borderRadius: 3 }} />
    </Box>
    <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
  </Stack>
);

const ErrorView: FC<{
  provider: ProviderId;
  message?: string;
  onRetry: () => void;
}> = ({ provider, message, onRetry }) => (
  <Paper
    variant="outlined"
    sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, textAlign: "center" }}
  >
    <InfoOutlinedIcon color="warning" sx={{ fontSize: 36, mb: 1 }} />
    <Typography variant="h5" sx={{ mb: 1 }}>
      {providerNames[provider]} could not load this wallet
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ maxWidth: 560, mx: "auto", mb: 2.5 }}
    >
      {message ?? "The provider returned an unexpected error."}
    </Typography>
    <Button variant="outlined" color="secondary" onClick={onRetry}>
      Try again
    </Button>
  </Paper>
);

const ProviderPortfolioPage: NextPage = () => {
  const { visibleAddress } = useVisibleAddress();
  const [provider, setProvider] = useState<ProviderId>("zerion");
  const [filter, setFilter] = useState<PositionFilter>("all");
  const [search, setSearch] = useState("");

  const alchemyQuery = platformApi.usePortfolioTokensQuery(
    visibleAddress && provider === "alchemy"
      ? { address: visibleAddress, chainIds: mainNetworks.map(({ id }) => id) }
      : skipToken
  );
  const zerionQuery = platformApi.useZerionPortfolioQuery(
    visibleAddress && provider === "zerion"
      ? { address: visibleAddress, chartPeriod: "month" }
      : skipToken
  );
  const ankrQuery = platformApi.useAnkrPortfolioQuery(
    visibleAddress && provider === "ankr"
      ? { address: visibleAddress }
      : skipToken
  );
  const moralisQuery = platformApi.useMoralisPortfolioQuery(
    visibleAddress && provider === "moralis"
      ? { address: visibleAddress }
      : skipToken
  );

  const zerionPositions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (zerionQuery.currentData?.positions ?? []).filter((position) => {
      const isWallet = position.positionType === "wallet";
      const isStaked =
        position.positionType === "staked" ||
        position.protocolModule?.toLowerCase().includes("stak");
      const matchesFilter =
        filter === "all" ||
        (filter === "wallet" && isWallet) ||
        (filter === "defi" && !isWallet) ||
        (filter === "staked" && isStaked);
      const matchesSearch =
        !normalizedSearch ||
        [position.name, position.symbol, position.protocol, position.chainId]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, zerionQuery.currentData?.positions]);

  const alchemyTokens = alchemyQuery.currentData?.tokens ?? [];
  const alchemyTotal = alchemyTokens.reduce(
    (total, token) => total + (token.valueUsd ?? 0),
    0
  );
  const alchemyNetworks = new Set(alchemyTokens.map(({ chainId }) => chainId))
    .size;
  const zerionData = zerionQuery.currentData;
  const ankrData = ankrQuery.currentData;
  const moralisData = moralisQuery.currentData;
  const ankrNetworks = new Set(
    ankrData?.assets.map(({ blockchain }) => blockchain)
  ).size;
  const moralisNetworks = new Set([
    ...(moralisData?.assets.map(({ chainId }) => chainId) ?? []),
    ...(moralisData?.defiPositions.map(({ chainId }) => chainId) ?? []),
  ]).size;
  const moralisScoredAssets =
    moralisData?.assets.filter(
      ({ securityScore, possibleSpam }) =>
        securityScore !== undefined || possibleSpam
    ).length ?? 0;
  const moralisProtocols = new Set(
    moralisData?.defiPositions.map(({ protocolId }) => protocolId)
  ).size;
  const selectedQuery =
    provider === "zerion"
      ? zerionQuery
      : provider === "ankr"
      ? ankrQuery
      : provider === "moralis"
      ? moralisQuery
      : alchemyQuery;

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button
            component={NextLink}
            href="/"
            color="secondary"
            size="small"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ mb: 1, ml: -1 }}
          >
            Portfolio
          </Button>
          <Typography variant="h4" component="h1">
            Portfolio data providers
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Compare what each API discovers for the same wallet.
          </Typography>
        </Box>
        {visibleAddress ? (
          <Chip
            icon={<AccountBalanceWalletRoundedIcon />}
            label={`${visibleAddress.slice(0, 6)}…${visibleAddress.slice(-4)}`}
            variant="outlined"
            sx={{ fontFamily: "monospace" }}
          />
        ) : null}
      </Stack>

      <Box sx={{ mb: 3 }}>
        <ProviderSelector value={provider} onChange={setProvider} />
      </Box>
      {!visibleAddress ? (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 4, md: 7 }, borderRadius: 3, textAlign: "center" }}
        >
          <AccountBalanceWalletRoundedIcon
            color="primary"
            sx={{ fontSize: 44, mb: 1.5 }}
          />
          <Typography variant="h5" sx={{ mb: 1 }}>
            Choose a wallet first
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Connect a wallet or use view mode on the Portfolio page, then return
            here to compare providers.
          </Typography>
          <Button component={NextLink} href="/" variant="contained">
            Go to Portfolio
          </Button>
        </Paper>
      ) : selectedQuery.isLoading && !selectedQuery.currentData ? (
        <LoadingView />
      ) : selectedQuery.isError ? (
        <ErrorView
          provider={provider}
          message={getQueryError(selectedQuery.error)}
          onRetry={() => void selectedQuery.refetch()}
        />
      ) : provider === "zerion" && zerionData ? (
        <Stack sx={{ gap: 3 }}>
          <SummaryCard
            provider="zerion"
            total={zerionData.overview.total}
            changePercent24h={zerionData.overview.changePercent24h}
            positions={zerionData.positions.length}
            networks={Object.keys(zerionData.overview.byChain).length}
            loading={zerionQuery.isFetching && !zerionQuery.currentData}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.4fr) minmax(270px, .8fr)",
              },
              gap: 3,
            }}
          >
            <PortfolioChart
              points={zerionData.chart.points}
              unavailable={zerionData.chart.unavailable}
            />
            <TypeBreakdown values={zerionData.overview.byPositionType} />
          </Box>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{
                p: { xs: 2, md: 2.5 },
                pb: { xs: 0, md: 2.5 },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5">Positions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Wallet assets, protocol deposits, staking, loans, liquidity
                  and rewards
                </Typography>
              </Box>
              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assets or protocols"
                sx={{ width: { md: 280 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
            <Tabs
              value={filter}
              onChange={(_, next: PositionFilter) => setFilter(next)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: { xs: 1, md: 2 },
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Tab value="all" label={`All (${zerionData.positions.length})`} />
              <Tab value="wallet" label="Wallet" />
              <Tab value="defi" label="DeFi" />
              <Tab value="staked" label="Staked" />
            </Tabs>
          </Paper>
          {zerionPositions.length ? (
            <PositionTable positions={zerionPositions} />
          ) : (
            <EmptyTable message="No positions match these filters." />
          )}

          <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 1.5,
              }}
            >
              <Stack direction="row" sx={{ gap: 1.25, alignItems: "center" }}>
                <InfoOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Liquidity-pool legs retain Zerion’s group IDs, so they can be
                  grouped into a single LP card in a later production pass.
                </Typography>
              </Stack>
              <Link
                href="https://developers.zerion.io/api-reference/wallets/get-wallet-fungible-positions"
                target="_blank"
                rel="noreferrer"
                sx={{ whiteSpace: "nowrap" }}
              >
                API docs{" "}
                <OpenInNewRoundedIcon
                  sx={{ fontSize: 14, verticalAlign: "middle" }}
                />
              </Link>
            </Stack>
          </Paper>
        </Stack>
      ) : provider === "ankr" && ankrData ? (
        <Stack sx={{ gap: 3 }}>
          <SummaryCard
            provider="ankr"
            total={ankrData.totalBalanceUsd}
            positions={ankrData.assets.length}
            networks={ankrNetworks}
            loading={ankrQuery.isFetching && !ankrQuery.currentData}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {[
              {
                icon: <AccountBalanceWalletRoundedIcon />,
                label: "Fungible assets",
                value: String(ankrData.assets.length),
                detail: "Native coins + ERC-20s",
              },
              {
                icon: <CollectionsRoundedIcon />,
                label: "NFT preview",
                value: `${ankrData.nfts.length}${
                  ankrData.nftResultLimited ? "+" : ""
                }`,
                detail: "ERC-721, ERC-1155, ENS, POAP",
              },
              {
                icon: <ExploreRoundedIcon />,
                label: "Interaction footprint",
                value: String(ankrData.interactions.length),
                detail: "Chains with tokens, NFTs or transactions",
              },
            ].map(({ icon, label, value, detail }) => (
              <Paper
                key={label}
                variant="outlined"
                sx={{ p: 2.25, borderRadius: 3 }}
              >
                <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ color: "primary.main", display: "flex" }}>
                    {icon}
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h4mono">{value}</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {detail}
                </Typography>
              </Paper>
            ))}
          </Box>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{ justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h5">Multichain balances</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Ankr’s whitelisted asset view, including native assets and
                  on-chain-derived USD prices.
                </Typography>
              </Box>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label="Native assets"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label="On-chain prices"
                  color="primary"
                  variant="outlined"
                />
                <Tooltip title="Ankr reports liquid staking tokens as fungible assets, not as protocol-aware staked positions.">
                  <Chip
                    size="small"
                    icon={<InfoOutlinedIcon />}
                    label="No DeFi position types"
                    variant="outlined"
                  />
                </Tooltip>
              </Stack>
            </Stack>
            {ankrData.interactions.length ? (
              <Stack direction="row" sx={{ mt: 2, gap: 1, flexWrap: "wrap" }}>
                {ankrData.interactions.map((chain) => (
                  <Chip key={chain} size="small" label={chainLabel(chain)} />
                ))}
              </Stack>
            ) : null}
          </Paper>
          {ankrData.assets.length ? (
            <AnkrTable assets={ankrData.assets} />
          ) : (
            <EmptyTable message="Ankr did not return any whitelisted balances for this wallet." />
          )}
          {ankrData.optionalFeaturesUnavailable.includes("nfts") ? (
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                NFT preview is unavailable for this Ankr project or plan; token
                balances are unaffected.
              </Typography>
            </Paper>
          ) : (
            <AnkrNftGallery
              nfts={ankrData.nfts}
              limited={ankrData.nftResultLimited}
            />
          )}
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Link
              href="https://www.ankr.com/docs/advanced-api/overview/"
              target="_blank"
              rel="noreferrer"
            >
              Ankr Advanced API docs{" "}
              <OpenInNewRoundedIcon
                sx={{ fontSize: 14, verticalAlign: "middle" }}
              />
            </Link>
          </Stack>
        </Stack>
      ) : provider === "moralis" && moralisData ? (
        <Stack sx={{ gap: 3 }}>
          <SummaryCard
            provider="moralis"
            total={moralisData.totalBalanceUsd}
            positions={moralisData.assets.length}
            networks={moralisNetworks}
            loading={moralisQuery.isFetching && !moralisQuery.currentData}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {[
              {
                icon: <ShieldRoundedIcon />,
                label: "Trust coverage",
                value: `${moralisScoredAssets}/${moralisData.assets.length}`,
                detail: "Security-scored or spam-classified assets",
                color: "primary.main",
              },
              {
                icon: <SavingsRoundedIcon />,
                label: "DeFi exposure",
                value: formatUsd(moralisData.defiValueUsd),
                detail: `${moralisData.defiPositions.length} positions across ${moralisProtocols} protocols`,
                color:
                  moralisData.defiValueUsd < 0 ? "error.main" : "primary.main",
              },
              {
                icon: <SwapHorizRoundedIcon />,
                label: "30d realized P&L",
                value: moralisData.pnl
                  ? formatUsd(moralisData.pnl.realizedProfitUsd)
                  : "Unavailable",
                detail: moralisData.pnl
                  ? `${moralisData.pnl.totalTrades} Ethereum trades · realized only`
                  : "Ethereum P&L enrichment did not return",
                color:
                  (moralisData.pnl?.realizedProfitUsd ?? 0) < 0
                    ? "error.main"
                    : "primary.main",
              },
            ].map(({ icon, label, value, detail, color }) => (
              <Paper
                key={label}
                variant="outlined"
                sx={{ p: 2.25, borderRadius: 3 }}
              >
                <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ color, display: "flex" }}>{icon}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      variant="h4mono"
                      sx={{ color, overflowWrap: "anywhere" }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {detail}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{ justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h5">Risk-aware balances</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Multichain native and ERC-20 balances with Moralis pricing,
                  trust signals and 24-hour movement.
                </Typography>
              </Box>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  icon={<ShieldRoundedIcon />}
                  label="Security scores"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={<WarningAmberRoundedIcon />}
                  label="Spam detection"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={<ShowChartRoundedIcon />}
                  label="24h prices"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Stack>
            {moralisData.failedChains.length ||
            moralisData.unsupportedChains.length ? (
              <Stack
                direction="row"
                sx={{ mt: 2, alignItems: "center", gap: 1, flexWrap: "wrap" }}
              >
                <InfoOutlinedIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Moralis reported partial chain coverage for this request:
                </Typography>
                {Array.from(
                  new Set([
                    ...moralisData.failedChains,
                    ...moralisData.unsupportedChains,
                  ])
                ).map((chain) => (
                  <Chip key={chain} size="small" label={chainLabel(chain)} />
                ))}
              </Stack>
            ) : null}
          </Paper>

          {moralisData.assets.length ? (
            <MoralisAssetTable assets={moralisData.assets} />
          ) : (
            <EmptyTable message="Moralis did not return any liquid balances for this wallet." />
          )}
          {moralisData.tokenResultLimited ? (
            <Typography variant="caption" color="text.secondary">
              Showing the first 100 liquid assets returned by Moralis.
            </Typography>
          ) : null}

          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{ justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h5">DeFi positions</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Staking, lending, borrowing, liquidity and unclaimed rewards
                  detected across supported protocols.
                </Typography>
              </Box>
              <Tooltip title="Shown separately from the liquid portfolio total to avoid double-counting receipt tokens and their underlying protocol positions.">
                <Chip
                  size="small"
                  icon={<InfoOutlinedIcon />}
                  label="Separate exposure"
                  variant="outlined"
                />
              </Tooltip>
            </Stack>
          </Paper>
          {moralisData.optionalFeaturesUnavailable.includes("defi") ? (
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                DeFi enrichment is unavailable for this Moralis project or plan;
                liquid balances and trust signals are unaffected.
              </Typography>
            </Paper>
          ) : moralisData.defiPositions.length ? (
            <MoralisDefiTable positions={moralisData.defiPositions} />
          ) : (
            <EmptyTable message="Moralis did not find any supported DeFi positions for this wallet." />
          )}
          {moralisData.defiResultLimited ? (
            <Typography variant="caption" color="text.secondary">
              Showing the first 100 DeFi positions returned by Moralis.
            </Typography>
          ) : null}

          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Link
              href="https://docs.moralis.com/data-api/evm/wallet/overview"
              target="_blank"
              rel="noreferrer"
            >
              Moralis Wallet API docs{" "}
              <OpenInNewRoundedIcon
                sx={{ fontSize: 14, verticalAlign: "middle" }}
              />
            </Link>
          </Stack>
        </Stack>
      ) : provider === "alchemy" && alchemyQuery.currentData ? (
        <Stack sx={{ gap: 3 }}>
          <SummaryCard
            provider="alchemy"
            total={alchemyTotal}
            positions={alchemyTokens.length}
            networks={alchemyNetworks}
            loading={alchemyQuery.isFetching && !alchemyQuery.currentData}
          />
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{ justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h5">ERC-20 wallet balances</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  The same Alchemy + LI.FI fallback pricing pipeline used by the
                  current Portfolio page.
                </Typography>
              </Box>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label="Token metadata"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label="USD prices"
                  color="primary"
                  variant="outlined"
                />
                <Tooltip title="Protocol deposits and staking are not part of the current Alchemy dashboard request.">
                  <Chip
                    size="small"
                    icon={<InfoOutlinedIcon />}
                    label="Wallet positions only"
                    variant="outlined"
                  />
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
          {alchemyTokens.length ? (
            <AlchemyTable tokens={alchemyTokens} />
          ) : (
            <EmptyTable message="Alchemy did not return any eligible ERC-20 balances for this wallet." />
          )}
        </Stack>
      ) : null}
    </Container>
  );
};

export default withStaticSEO(
  { title: "Portfolio providers | Superfluid" },
  ProviderPortfolioPage
);
