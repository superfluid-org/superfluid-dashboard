import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { FC, Fragment, useMemo, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";

type ConceptId = "ledger" | "streaming" | "networks";
type ProviderName = "Alchemy" | "OKX" | "Mobula" | "DeBank" | "1inch";
type AssetKind = "super" | "erc20" | "native";

interface LabAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  networkShort: string;
  kind: AssetKind;
  balance: string;
  value: number;
  valueLabel: string;
  priceLabel: string;
  color: string;
  netFlowUsd?: number;
  netFlowLabel?: string;
  activeStreams?: number;
  providers: ProviderName[];
  confidence: "high" | "medium";
}

interface DiscoveryToken {
  symbol: string;
  network: string;
  value: string;
  foundBy: ProviderName[];
  note: string;
  risk?: boolean;
}

const PROVIDERS: ProviderName[] = [
  "Alchemy",
  "OKX",
  "Mobula",
  "DeBank",
  "1inch",
];

const ASSETS: LabAsset[] = [
  {
    id: "eth-ethereum",
    symbol: "ETH",
    name: "Ether",
    network: "Ethereum",
    networkShort: "ETH",
    kind: "native",
    balance: "1.4421",
    value: 5251.96,
    valueLabel: "$5,251.96",
    priceLabel: "$3,641.87",
    color: "#627EEA",
    providers: PROVIDERS,
    confidence: "high",
  },
  {
    id: "usdc-base",
    symbol: "USDC",
    name: "USD Coin",
    network: "Base",
    networkShort: "BASE",
    kind: "erc20",
    balance: "3,520.24",
    value: 3520.24,
    valueLabel: "$3,520.24",
    priceLabel: "$1.00",
    color: "#2775CA",
    providers: PROVIDERS,
    confidence: "high",
  },
  {
    id: "usdcx-base",
    symbol: "USDCx",
    name: "Super USD Coin",
    network: "Base",
    networkShort: "BASE",
    kind: "super",
    balance: "2,184.90",
    value: 2184.9,
    valueLabel: "$2,184.90",
    priceLabel: "$1.00",
    color: "#24A148",
    netFlowUsd: 286.4,
    netFlowLabel: "+286.40 USDCx / mo",
    activeStreams: 3,
    providers: PROVIDERS,
    confidence: "high",
  },
  {
    id: "weth-arbitrum",
    symbol: "WETH",
    name: "Wrapped Ether",
    network: "Arbitrum One",
    networkShort: "ARB",
    kind: "erc20",
    balance: "0.2541",
    value: 925.32,
    valueLabel: "$925.32",
    priceLabel: "$3,641.87",
    color: "#2D374B",
    providers: PROVIDERS,
    confidence: "high",
  },
  {
    id: "daix-gnosis",
    symbol: "DAIx",
    name: "Super DAI",
    network: "Gnosis",
    networkShort: "GNO",
    kind: "super",
    balance: "610.06",
    value: 610.06,
    valueLabel: "$610.06",
    priceLabel: "$1.00",
    color: "#F5AC37",
    netFlowUsd: -18.74,
    netFlowLabel: "−18.74 DAIx / mo",
    activeStreams: 1,
    providers: ["Alchemy", "Mobula", "DeBank", "1inch"],
    confidence: "medium",
  },
  {
    id: "aero-base",
    symbol: "AERO",
    name: "Aerodrome Finance",
    network: "Base",
    networkShort: "BASE",
    kind: "erc20",
    balance: "284.18",
    value: 205.44,
    valueLabel: "$205.44",
    priceLabel: "$0.72",
    color: "#4776E6",
    providers: ["Alchemy", "OKX", "Mobula", "DeBank"],
    confidence: "medium",
  },
  {
    id: "ethx-ethereum",
    symbol: "ETHx",
    name: "Super Ether",
    network: "Ethereum",
    networkShort: "ETH",
    kind: "super",
    balance: "0.0287",
    value: 104.69,
    valueLabel: "$104.69",
    priceLabel: "$3,641.87",
    color: "#7857FF",
    netFlowUsd: 73.6,
    netFlowLabel: "+0.0202 ETHx / mo",
    activeStreams: 2,
    providers: PROVIDERS,
    confidence: "high",
  },
  {
    id: "op-optimism",
    symbol: "OP",
    name: "Optimism",
    network: "OP Mainnet",
    networkShort: "OP",
    kind: "erc20",
    balance: "46.51",
    value: 40,
    valueLabel: "$40.00",
    priceLabel: "$0.86",
    color: "#FF0420",
    providers: ["Alchemy", "OKX", "Mobula", "1inch"],
    confidence: "medium",
  },
];

const DISCOVERY_TOKENS: DiscoveryToken[] = [
  { symbol: "ETH", network: "Ethereum", value: "$5,251.96", foundBy: PROVIDERS, note: "Native asset consensus" },
  { symbol: "USDC", network: "Base", value: "$3,520.24", foundBy: PROVIDERS, note: "Price spread <0.01%" },
  { symbol: "USDCx", network: "Base", value: "$2,184.90", foundBy: PROVIDERS, note: "Classified as Super Token locally" },
  { symbol: "WETH", network: "Arbitrum", value: "$925.32", foundBy: PROVIDERS, note: "Full consensus" },
  { symbol: "DAIx", network: "Gnosis", value: "$610.06", foundBy: ["Alchemy", "Mobula", "DeBank", "1inch"], note: "Missing from OKX sample" },
  { symbol: "AERO", network: "Base", value: "$205.44", foundBy: ["Alchemy", "OKX", "Mobula", "DeBank"], note: "Missing from 1inch sample" },
  { symbol: "OP", network: "Optimism", value: "$40.00", foundBy: ["Alchemy", "OKX", "Mobula", "1inch"], note: "Missing from DeBank sample" },
  { symbol: "GNO", network: "Gnosis", value: "$0.18", foundBy: ["Mobula", "DeBank"], note: "Below other providers’ value threshold" },
  { symbol: "CLAIM", network: "Ethereum", value: "$0.00", foundBy: ["Alchemy", "DeBank"], note: "Risk / spam candidate", risk: true },
];

const formatSignedUsd = (value: number) =>
  `${value >= 0 ? "+" : "−"}$${Math.abs(value).toFixed(2)}`;

const AssetAvatar: FC<{ asset: LabAsset; size?: number }> = ({
  asset,
  size = 42,
}) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      bgcolor: asset.color,
      color: "white",
      fontSize: size <= 36 ? 11 : 13,
      fontWeight: 800,
      letterSpacing: "-0.04em",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.32)",
    }}
  >
    {asset.symbol.slice(0, 4)}
  </Avatar>
);

const TypeChip: FC<{ kind: AssetKind }> = ({ kind }) => {
  const label = kind === "super" ? "Streaming" : kind === "native" ? "Native" : "ERC-20";
  return (
    <Chip
      size="small"
      label={label}
      color={kind === "super" ? "primary" : "default"}
      variant={kind === "super" ? "filled" : "outlined"}
      sx={{ height: 23, fontSize: 10, fontWeight: 700 }}
    />
  );
};

const ProviderEvidence: FC<{ asset: LabAsset; compact?: boolean }> = ({
  asset,
  compact = false,
}) => {
  const label = compact
    ? `${asset.providers.length}/5 sources`
    : `${asset.providers.length} of 5 providers`;
  return (
    <Tooltip title={asset.providers.join(" · ")} arrow>
      <Chip
        size="small"
        icon={
          asset.confidence === "high" ? (
            <CheckCircleRoundedIcon />
          ) : (
            <WarningAmberRoundedIcon />
          )
        }
        label={label}
        color={asset.confidence === "high" ? "success" : "warning"}
        variant="outlined"
        sx={{ height: 25, fontSize: 10 }}
      />
    </Tooltip>
  );
};

const StreamDetails: FC<{ asset: LabAsset }> = ({ asset }) => (
  <Box
    sx={(theme) => ({
      mx: 2,
      mb: 2,
      p: 2,
      borderRadius: 2.5,
      bgcolor: alpha(theme.palette.primary.main, 0.07),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
    })}
  >
    <Stack direction={{ xs: "column", md: "row" }} gap={2} divider={<Divider flexItem orientation="vertical" />}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">LIVE NET FLOW</Typography>
        <Typography variant="body2mono" color={(asset.netFlowUsd ?? 0) >= 0 ? "primary" : "error"}>
          {asset.netFlowLabel}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">ACTIVE STREAMS</Typography>
        <Typography variant="body2">{asset.activeStreams} streams · 2 incoming · 1 outgoing</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">BALANCE SAFETY</Typography>
        <Typography variant="body2">Healthy · more than 90 days runway</Typography>
      </Box>
    </Stack>
  </Box>
);

const UnifiedLedgerConcept: FC = () => {
  const [openAssetId, setOpenAssetId] = useState<string | null>("usdcx-base");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Stack gap={1.25}>
        {ASSETS.map((asset) => {
          const open = openAssetId === asset.id;
          return (
            <Paper key={asset.id} variant="outlined" sx={{ overflow: "hidden", borderRadius: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{ p: 2 }}
                onClick={() => asset.kind === "super" && setOpenAssetId(open ? null : asset.id)}
              >
                <AssetAvatar asset={asset} size={38} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    <Typography fontWeight={750}>{asset.symbol}</Typography>
                    {asset.kind === "super" ? <TypeChip kind={asset.kind} /> : null}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{asset.network}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2mono" fontWeight={750}>{asset.valueLabel}</Typography>
                  <Typography variant="caption" color={asset.netFlowUsd === undefined ? "text.secondary" : asset.netFlowUsd >= 0 ? "primary" : "error"}>
                    {asset.netFlowUsd === undefined ? asset.balance : `${formatSignedUsd(asset.netFlowUsd)}/mo`}
                  </Typography>
                </Box>
              </Stack>
              <Collapse in={open} unmountOnExit><StreamDetails asset={asset} /></Collapse>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Streaming</TableCell>
            <TableCell>Data confidence</TableCell>
            <TableCell width={56} />
          </TableRow>
        </TableHead>
        <TableBody>
          {ASSETS.map((asset) => {
            const open = openAssetId === asset.id;
            return (
              <Fragment key={asset.id}>
                <TableRow hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <AssetAvatar asset={asset} />
                      <Box>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography fontWeight={750}>{asset.symbol}</Typography>
                          <TypeChip kind={asset.kind} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">{asset.name} · {asset.network}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2mono" fontWeight={700}>{asset.balance}</Typography>
                    <Typography variant="caption" color="text.secondary">{asset.priceLabel} each</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2mono" fontWeight={750}>{asset.valueLabel}</Typography></TableCell>
                  <TableCell>
                    {asset.netFlowUsd === undefined ? (
                      <Typography variant="body2" color="text.secondary">Not streamable</Typography>
                    ) : (
                      <Stack>
                        <Typography variant="body2mono" color={asset.netFlowUsd >= 0 ? "primary" : "error"}>
                          {formatSignedUsd(asset.netFlowUsd)} / mo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{asset.activeStreams} active streams</Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell><ProviderEvidence asset={asset} /></TableCell>
                  <TableCell>
                    {asset.kind === "super" ? (
                      <IconButton onClick={() => setOpenAssetId(open ? null : asset.id)} aria-label={`Show ${asset.symbol} streams`}>
                        <ExpandMoreRoundedIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms" }} />
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0, border: open ? undefined : 0 }}>
                    <Collapse in={open} unmountOnExit><StreamDetails asset={asset} /></Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const StreamingFocusConcept: FC = () => {
  const streamingAssets = ASSETS.filter((asset) => asset.kind === "super");
  return (
    <Stack gap={3}>
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="h5">Streaming now</Typography>
            <Typography variant="body2" color="text.secondary">Protocol-native activity stays visually first-class.</Typography>
          </Box>
          <Chip label="6 active streams" color="primary" />
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
          {streamingAssets.map((asset) => (
            <Paper key={asset.id} variant="outlined" sx={(theme) => ({ p: 2.25, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)}, transparent 70%)` })}>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <AssetAvatar asset={asset} size={36} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={750}>{asset.symbol}</Typography>
                  <Typography variant="caption" color="text.secondary">{asset.network}</Typography>
                </Box>
                <Chip size="small" label={`${asset.activeStreams} live`} color="primary" />
              </Stack>
              <Typography variant="h5" sx={{ mt: 2 }}>{asset.valueLabel}</Typography>
              <Typography variant="body2mono" color={(asset.netFlowUsd ?? 0) >= 0 ? "primary" : "error"}>
                {formatSignedUsd(asset.netFlowUsd ?? 0)} / month
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">All holdings</Typography>
            <Typography variant="body2" color="text.secondary">A compact financial list; stream details live above.</Typography>
          </Box>
          <Chip label="Sorted by value" variant="outlined" />
        </Box>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {ASSETS.map((asset) => (
            <Stack key={asset.id} direction="row" alignItems="center" gap={1.5} sx={{ px: 2.5, py: 1.4 }}>
              <AssetAvatar asset={asset} size={34} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <Typography fontWeight={750}>{asset.symbol}</Typography>
                  <Typography variant="caption" color="text.secondary">{asset.network}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">{asset.balance} · {asset.priceLabel}</Typography>
              </Box>
              <ProviderEvidence asset={asset} compact />
              <Box sx={{ minWidth: 96, textAlign: "right" }}>
                <Typography variant="body2mono" fontWeight={750}>{asset.valueLabel}</Typography>
                {asset.netFlowUsd !== undefined ? (
                  <Typography variant="caption" color={asset.netFlowUsd >= 0 ? "primary" : "error"}>{formatSignedUsd(asset.netFlowUsd)}/mo</Typography>
                ) : null}
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

const NetworkStackConcept: FC = () => {
  const groupedAssets = useMemo(() => {
    const groups = new Map<string, LabAsset[]>();
    ASSETS.forEach((asset) => groups.set(asset.network, [...(groups.get(asset.network) ?? []), asset]));
    return [...groups.entries()];
  }, []);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
      {groupedAssets.map(([network, assets]) => {
        const networkTotal = assets.reduce((sum, asset) => sum + asset.value, 0);
        return (
          <Paper key={network} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.25 }}>
              <Box>
                <Typography variant="h6">{network}</Typography>
                <Typography variant="body2" color="text.secondary">{assets.length} assets</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">NETWORK TOTAL</Typography>
                <Typography variant="body2mono" fontWeight={750}>${networkTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Stack divider={<Divider flexItem />}>
              {assets.map((asset) => (
                <Stack key={asset.id} direction="row" alignItems="center" gap={1.25} sx={{ p: 2 }}>
                  <AssetAvatar asset={asset} size={34} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <Typography fontWeight={750}>{asset.symbol}</Typography>
                      <TypeChip kind={asset.kind} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{asset.balance}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2mono" fontWeight={750}>{asset.valueLabel}</Typography>
                    {asset.netFlowUsd !== undefined ? <Typography variant="caption" color={asset.netFlowUsd >= 0 ? "primary" : "error"}>{formatSignedUsd(asset.netFlowUsd)}/mo</Typography> : null}
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
};

const PortfolioHero: FC = () => (
  <Paper
    variant="outlined"
    sx={(theme) => ({
      position: "relative",
      overflow: "hidden",
      p: { xs: 2.5, md: 3.5 },
      borderRadius: 4,
      color: theme.palette.mode === "dark" ? "common.white" : "#102019",
      background: theme.palette.mode === "dark"
        ? `radial-gradient(circle at 82% 12%, ${alpha(theme.palette.primary.main, 0.28)}, transparent 34%), #101713`
        : "radial-gradient(circle at 82% 12%, rgba(128,255,151,.72), transparent 34%), linear-gradient(135deg, #efffec, #fbfcf8 64%)",
    })}
  >
    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "flex-end" }} justifyContent="space-between" gap={3}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <AccountBalanceWalletRoundedIcon color="primary" />
          <Typography variant="overline" fontWeight={800} letterSpacing="0.12em">TOTAL PORTFOLIO VALUE</Typography>
        </Stack>
        <Typography sx={{ fontSize: { xs: 42, md: 62 }, lineHeight: 1, fontWeight: 650, letterSpacing: "-0.055em" }}>
          $12,842.61
        </Typography>
        <Stack direction="row" alignItems="center" gap={1.25} sx={{ mt: 1.5 }}>
          <Chip label="+$218.42 · 24h" size="small" color="success" />
          <Typography variant="body2" color="text.secondary">98.6% price coverage</Typography>
        </Stack>
      </Box>
      <Stack direction="row" gap={{ xs: 3, md: 5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">NET STREAM</Typography>
          <Typography variant="h6" color="primary">+$341.26/mo</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">ACTIVE STREAMS</Typography>
          <Typography variant="h6">6</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">ASSETS</Typography>
          <Typography variant="h6">8</Typography>
        </Box>
      </Stack>
    </Stack>
  </Paper>
);

const ProviderComparisonPanel: FC = () => {
  const [selectedProviders, setSelectedProviders] = useState<ProviderName[]>(PROVIDERS);
  const [filter, setFilter] = useState<"all" | "disagreements" | "risk">("all");
  const visibleTokens = useMemo(
    () => DISCOVERY_TOKENS.filter((token) => {
      if (filter === "risk") return token.risk;
      if (filter === "disagreements") return token.foundBy.length !== PROVIDERS.length;
      return true;
    }),
    [filter]
  );

  const toggleProvider = (provider: ProviderName) => {
    setSelectedProviders((current) =>
      current.includes(provider)
        ? current.filter((candidate) => candidate !== provider)
        : [...current, provider]
    );
  };

  return (
    <Stack gap={3}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", lg: "row" }} alignItems={{ lg: "center" }} gap={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">Provider discovery benchmark</Typography>
            <Typography variant="body2" color="text.secondary">
              Run one address and chain set through every configured adapter, normalize by chain + contract, then expose misses, price spread, risk flags and latency.
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Wallet under test"
            value="0xEb85…c28d"
            InputProps={{ readOnly: true }}
            sx={{ width: { xs: "100%", lg: 210 } }}
          />
          <Button variant="contained" startIcon={<CompareArrowsRoundedIcon />}>
            Run sample fixture
          </Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
          {PROVIDERS.map((provider) => (
            <FormControlLabel
              key={provider}
              control={
                <Box
                  component="input"
                  type="checkbox"
                  checked={selectedProviders.includes(provider)}
                  onChange={() => toggleProvider(provider)}
                  sx={{ accentColor: "primary.main" }}
                />
              }
              label={provider}
              sx={(theme) => ({
                m: 0,
                px: 1.25,
                py: 0.5,
                borderRadius: 20,
                border: `1px solid ${theme.palette.divider}`,
                "& .MuiFormControlLabel-label": { fontSize: 12, fontWeight: 700 },
              })}
            />
          ))}
          <Chip label="Alchemy key configured" size="small" color="success" variant="outlined" sx={{ ml: { md: "auto" } }} />
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary">CONSENSUS HOLDINGS</Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>4</Typography>
          <Typography variant="body2" color="text.secondary">Found by all five providers</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary">DISAGREEMENTS</Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>4</Typography>
          <Typography variant="body2" color="text.secondary">Threshold, coverage or indexing differences</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary">RISK CANDIDATES</Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>1</Typography>
          <Typography variant="body2" color="text.secondary">Never include in total without verification</Typography>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" gap={1.5} sx={{ p: 2 }}>
          <Box>
            <Typography variant="h6">Token pickup matrix</Typography>
            <Typography variant="body2" color="text.secondary">Representative fixture illustrating the normalized output.</Typography>
          </Box>
          <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)}>
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="disagreements">Disagreements</ToggleButton>
            <ToggleButton value="risk">Risk</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                {selectedProviders.map((provider) => <TableCell key={provider} align="center">{provider}</TableCell>)}
                <TableCell>Normalized result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleTokens.map((token) => (
                <TableRow key={`${token.network}-${token.symbol}`} hover>
                  <TableCell>
                    <Typography fontWeight={750}>{token.symbol}</Typography>
                    <Typography variant="caption" color="text.secondary">{token.network} · {token.value}</Typography>
                  </TableCell>
                  {selectedProviders.map((provider) => (
                    <TableCell key={provider} align="center">
                      {token.foundBy.includes(provider) ? (
                        <CheckCircleRoundedIcon color="success" fontSize="small" />
                      ) : (
                        <Typography color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1}>
                      {token.risk ? <Chip size="small" color="error" label="Exclude" /> : <Chip size="small" variant="outlined" label={`${token.foundBy.length}/5`} />}
                      <Typography variant="caption" color="text.secondary">{token.note}</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper variant="outlined" sx={(theme) => ({ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) })}>
        <Stack direction="row" gap={1.5} alignItems="flex-start">
          <HubRoundedIcon color="info" />
          <Box>
            <Typography fontWeight={750}>Live harness design</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Each server-side adapter should return the same token shape: provider, chain ID, contract, raw balance, decimals, price, value, quality flags, latency and raw-response hash. Run adapters in parallel, store fixtures without wallet-identifying logs, and diff by <code>chainId-contract</code>. Superfluid data is then joined locally to mark Super Tokens and supply authoritative live-flow state.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

const conceptMeta: Record<ConceptId, { label: string; description: string; icon: typeof ViewListRoundedIcon }> = {
  ledger: { label: "A · Unified ledger", description: "One sortable list; stream rows expand in place.", icon: ViewListRoundedIcon },
  streaming: { label: "B · Streaming first", description: "Streaming activity gets a dedicated band above holdings.", icon: ShowChartRoundedIcon },
  networks: { label: "C · Network stacks", description: "Preserves chain grouping in denser portfolio cards.", icon: LayersRoundedIcon },
};

const PortfolioLab: NextPage = () => {
  const [section, setSection] = useState<"designs" | "providers">("designs");
  const [concept, setConcept] = useState<ConceptId>("ledger");
  const [chosenConcept, setChosenConcept] = useState<ConceptId | null>(null);
  const ActiveConceptIcon = conceptMeta[concept].icon;

  return (
    <Container maxWidth="lg">
      <Stack gap={3.5}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "flex-end" }} justifyContent="space-between" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }}>
              <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
              <Typography variant="overline" color="primary" fontWeight={800}>EXPLORATION · PRODUCTION PAGE UNCHANGED</Typography>
            </Stack>
            <Typography variant="h3" component="h1">Portfolio design lab</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 740 }}>
              Compare three ways to combine arbitrary wallet assets with Superfluid’s live streaming state, then inspect how a multi-provider discovery harness would explain token coverage.
            </Typography>
          </Box>
          {chosenConcept ? <Chip color="success" icon={<CheckCircleRoundedIcon />} label={`Current pick: ${conceptMeta[chosenConcept].label}`} /> : null}
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <Tabs value={section} onChange={(_, value) => setSection(value)} variant="scrollable" scrollButtons="auto">
            <Tab value="designs" icon={<AccountBalanceWalletRoundedIcon />} iconPosition="start" label="Portfolio concepts" />
            <Tab value="providers" icon={<CompareArrowsRoundedIcon />} iconPosition="start" label="Provider comparison" />
          </Tabs>
        </Paper>

        {section === "providers" ? (
          <ProviderComparisonPanel />
        ) : (
          <Stack gap={3}>
            <PortfolioHero />

            <Paper variant="outlined" sx={{ p: 1, borderRadius: 3 }}>
              <ToggleButtonGroup
                fullWidth
                exclusive
                value={concept}
                onChange={(_, value) => value && setConcept(value)}
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}
              >
                {(Object.keys(conceptMeta) as ConceptId[]).map((conceptId) => {
                  const Icon = conceptMeta[conceptId].icon;
                  return (
                    <ToggleButton key={conceptId} value={conceptId} sx={{ justifyContent: "flex-start", gap: 1.25, p: 1.5, textAlign: "left" }}>
                      <Icon />
                      <Box>
                        <Typography variant="body2" fontWeight={800}>{conceptMeta[conceptId].label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>{conceptMeta[conceptId].description}</Typography>
                      </Box>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Paper>

            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" gap={1.5}>
              <Stack direction="row" gap={1.25} alignItems="center">
                <ActiveConceptIcon color="primary" />
                <Box>
                  <Typography variant="h5">{conceptMeta[concept].label}</Typography>
                  <Typography variant="body2" color="text.secondary">{conceptMeta[concept].description}</Typography>
                </Box>
              </Stack>
              <Button variant={chosenConcept === concept ? "contained" : "outlined"} startIcon={chosenConcept === concept ? <CheckCircleRoundedIcon /> : undefined} onClick={() => setChosenConcept(concept)}>
                {chosenConcept === concept ? "Selected" : "Choose this direction"}
              </Button>
            </Stack>

            {concept === "ledger" ? <UnifiedLedgerConcept /> : concept === "streaming" ? <StreamingFocusConcept /> : <NetworkStackConcept />}

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography fontWeight={800}>Rules shared by every concept</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="primary" fontWeight={800}>TOTAL</Typography>
                  <Typography variant="body2" color="text.secondary">Sum priced current balances once, deduplicated by chain and contract. Never double-count an ERC-20 that is also known locally as a Super Token.</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="primary" fontWeight={800}>AUTHORITY</Typography>
                  <Typography variant="body2" color="text.secondary">Providers discover and price. Superfluid’s protocol data owns the live balance, net flow, stream count and critical-date state.</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="primary" fontWeight={800}>TRUST</Typography>
                  <Typography variant="body2" color="text.secondary">Show provider consensus quietly; exclude risky or unpriced dust from the headline total while still allowing an advanced “all detected” view.</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={98.6} sx={{ mt: 2.5, height: 5, borderRadius: 4 }} />
            </Paper>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default withStaticSEO(
  { title: "Portfolio Design Lab | Superfluid" },
  PortfolioLab
);
