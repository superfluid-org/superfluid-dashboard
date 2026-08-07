import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
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
  InputAdornment,
  LinearProgress,
  MenuItem,
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
type ActivityFilter = "all" | "streaming" | "passive";
type ValueFilter = "all" | "100" | "1000";

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
  monthlyInflowUsd?: number;
  monthlyOutflowUsd?: number;
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
    monthlyInflowUsd: 512.8,
    monthlyOutflowUsd: 226.4,
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
    monthlyInflowUsd: 41.26,
    monthlyOutflowUsd: 60,
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
    monthlyInflowUsd: 91.2,
    monthlyOutflowUsd: 17.6,
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

const NETWORKS = [...new Set(ASSETS.map((asset) => asset.network))].sort();

const DISCOVERY_TOKENS: DiscoveryToken[] = [
  {
    symbol: "ETH",
    network: "Ethereum",
    value: "$5,251.96",
    foundBy: PROVIDERS,
    note: "Native asset consensus",
  },
  {
    symbol: "USDC",
    network: "Base",
    value: "$3,520.24",
    foundBy: PROVIDERS,
    note: "Price spread <0.01%",
  },
  {
    symbol: "USDCx",
    network: "Base",
    value: "$2,184.90",
    foundBy: PROVIDERS,
    note: "Classified as Super Token locally",
  },
  {
    symbol: "WETH",
    network: "Arbitrum",
    value: "$925.32",
    foundBy: PROVIDERS,
    note: "Full consensus",
  },
  {
    symbol: "DAIx",
    network: "Gnosis",
    value: "$610.06",
    foundBy: ["Alchemy", "Mobula", "DeBank", "1inch"],
    note: "Missing from OKX sample",
  },
  {
    symbol: "AERO",
    network: "Base",
    value: "$205.44",
    foundBy: ["Alchemy", "OKX", "Mobula", "DeBank"],
    note: "Missing from 1inch sample",
  },
  {
    symbol: "OP",
    network: "Optimism",
    value: "$40.00",
    foundBy: ["Alchemy", "OKX", "Mobula", "1inch"],
    note: "Missing from DeBank sample",
  },
  {
    symbol: "GNO",
    network: "Gnosis",
    value: "$0.18",
    foundBy: ["Mobula", "DeBank"],
    note: "Below other providers’ value threshold",
  },
  {
    symbol: "CLAIM",
    network: "Ethereum",
    value: "$0.00",
    foundBy: ["Alchemy", "DeBank"],
    note: "Risk / spam candidate",
    risk: true,
  },
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
  const label =
    kind === "super" ? "Streaming" : kind === "native" ? "Native" : "ERC-20";
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
      p: { xs: 1.5, md: 2 },
      borderRadius: 2.5,
      bgcolor: alpha(theme.palette.primary.main, 0.07),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
    })}
  >
    <Stack
      direction={{ xs: "column", lg: "row" }}
      sx={{
        gap: 2,
        alignItems: { lg: "center" },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1,
          flex: 1,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            INCOMING / MO
          </Typography>
          <Typography
            variant="body2mono"
            color="primary"
            sx={{
              fontWeight: 750,
            }}
          >
            +${asset.monthlyInflowUsd?.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            OUTGOING / MO
          </Typography>
          <Typography
            variant="body2mono"
            color="error"
            sx={{
              fontWeight: 750,
            }}
          >
            −${asset.monthlyOutflowUsd?.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            NET / MO
          </Typography>
          <Typography
            variant="body2mono"
            color={(asset.netFlowUsd ?? 0) >= 0 ? "primary" : "error"}
            sx={{
              fontWeight: 750,
            }}
          >
            {formatSignedUsd(asset.netFlowUsd ?? 0)}
          </Typography>
        </Box>
      </Box>
      <Divider flexItem orientation="vertical" />
      <Stack
        sx={{
          gap: 0.75,
          minWidth: { lg: 330 },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={(theme) => ({
              width: 25,
              height: 25,
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: "primary.main",
            })}
          >
            <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="caption" sx={{ flex: 1 }}>
            From 0xA7F2…39C1
          </Typography>
          <Typography variant="body2mono" color="primary">
            +${asset.monthlyInflowUsd?.toFixed(2)}/mo
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={(theme) => ({
              width: 25,
              height: 25,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
            })}
          >
            <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="caption" sx={{ flex: 1 }}>
            To 0x92B4…10F4
          </Typography>
          <Typography variant="body2mono" color="error">
            −${asset.monthlyOutflowUsd?.toFixed(2)}/mo
          </Typography>
        </Stack>
      </Stack>
      <Button
        href="/send"
        size="small"
        variant="contained"
        startIcon={<SendRoundedIcon />}
      >
        New stream
      </Button>
    </Stack>
  </Box>
);

const UnifiedLedgerConcept: FC<{ assets: LabAsset[] }> = ({ assets }) => {
  const [openAssetId, setOpenAssetId] = useState<string | null>("usdcx-base");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Stack
        sx={{
          gap: 1.25,
        }}
      >
        {assets.map((asset) => {
          const open = openAssetId === asset.id;
          return (
            <Paper
              key={asset.id}
              variant="outlined"
              sx={{ overflow: "hidden", borderRadius: 3 }}
            >
              <Stack
                direction="row"
                onClick={() =>
                  asset.kind === "super" &&
                  setOpenAssetId(open ? null : asset.id)
                }
                sx={{
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  pt: 2,
                  pb: 1.25,
                }}
              >
                <AssetAvatar asset={asset} size={38} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 750,
                      }}
                    >
                      {asset.symbol}
                    </Typography>
                    {asset.kind === "super" ? (
                      <TypeChip kind={asset.kind} />
                    ) : null}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {asset.network}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2mono"
                    sx={{
                      fontWeight: 750,
                    }}
                  >
                    {asset.valueLabel}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={
                      asset.netFlowUsd === undefined
                        ? "text.secondary"
                        : asset.netFlowUsd >= 0
                        ? "primary"
                        : "error"
                    }
                  >
                    {asset.netFlowUsd === undefined
                      ? asset.balance
                      : `${formatSignedUsd(asset.netFlowUsd)}/mo`}
                  </Typography>
                </Box>
                {asset.kind === "super" ? (
                  <IconButton
                    size="small"
                    aria-label={`Show ${asset.symbol} streams`}
                  >
                    <ExpandMoreRoundedIcon
                      sx={{
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 160ms",
                      }}
                    />
                  </IconButton>
                ) : null}
              </Stack>
              <Stack
                direction="row"
                onClick={(event) => event.stopPropagation()}
                sx={{
                  gap: 1,
                  px: 2,
                  pb: 1.5,
                }}
              >
                {asset.kind === "super" ? (
                  <Button
                    href="/send"
                    size="small"
                    variant="contained"
                    startIcon={<SendRoundedIcon />}
                  >
                    Stream
                  </Button>
                ) : asset.kind === "erc20" ? (
                  <Button href="/wrap?upgrade" size="small" variant="text">
                    Wrap to stream
                  </Button>
                ) : null}
                <Button
                  href="/transfer"
                  size="small"
                  variant="outlined"
                  startIcon={<SwapHorizRoundedIcon />}
                >
                  Transfer
                </Button>
              </Stack>
              <Collapse in={open} unmountOnExit>
                <StreamDetails asset={asset} />
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 3, maxWidth: "100%", overflowX: "auto" }}
    >
      <Table sx={{ minWidth: 940 }}>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Portfolio balance</TableCell>
            <TableCell>Monthly flow</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => {
            const open = openAssetId === asset.id;
            return (
              <Fragment key={asset.id}>
                <TableRow hover>
                  <TableCell>
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <AssetAvatar asset={asset} />
                      <Box>
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 750,
                            }}
                          >
                            {asset.symbol}
                          </Typography>
                          <TypeChip kind={asset.kind} />
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          {asset.name} · {asset.network}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <ProviderEvidence asset={asset} compact />
                        </Box>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2mono"
                      sx={{
                        fontWeight: 750,
                      }}
                    >
                      {asset.valueLabel}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {asset.balance} {asset.symbol} · {asset.priceLabel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {asset.netFlowUsd === undefined ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        No active streams
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2mono"
                            color={asset.netFlowUsd >= 0 ? "primary" : "error"}
                          >
                            {formatSignedUsd(asset.netFlowUsd)} / mo
                          </Typography>
                          <Stack
                            direction="row"
                            sx={{
                              alignItems: "center",
                              gap: 0.75,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                              }}
                            >
                              {asset.activeStreams} active streams
                            </Typography>
                          </Stack>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setOpenAssetId(open ? null : asset.id)}
                          aria-label={`Show ${asset.symbol} streams`}
                        >
                          <ExpandMoreRoundedIcon
                            sx={{
                              transform: open ? "rotate(180deg)" : "none",
                              transition: "transform 160ms",
                            }}
                          />
                        </IconButton>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      sx={{
                        gap: 0.75,
                        justifyContent: "flex-end",
                      }}
                    >
                      {asset.kind === "super" ? (
                        <Button
                          href="/send"
                          size="small"
                          variant="contained"
                          startIcon={<SendRoundedIcon />}
                        >
                          Stream
                        </Button>
                      ) : asset.kind === "erc20" ? (
                        <Button
                          href="/wrap?upgrade"
                          size="small"
                          variant="text"
                        >
                          Wrap
                        </Button>
                      ) : null}
                      <Button
                        href="/transfer"
                        size="small"
                        variant="outlined"
                        startIcon={<SwapHorizRoundedIcon />}
                      >
                        Transfer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{ p: 0, border: open ? undefined : 0 }}
                  >
                    <Collapse in={open} unmountOnExit>
                      <StreamDetails asset={asset} />
                    </Collapse>
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

const StreamingFocusConcept: FC<{ assets: LabAsset[] }> = ({ assets }) => {
  const streamingAssets = assets.filter((asset) => asset.kind === "super");
  return (
    <Stack
      sx={{
        gap: 3,
      }}
    >
      <Box>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5">Streaming now</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Protocol-native activity stays visually first-class.
            </Typography>
          </Box>
          <Chip label="6 active streams" color="primary" />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 1.5,
          }}
        >
          {streamingAssets.map((asset) => (
            <Paper
              key={asset.id}
              variant="outlined"
              sx={(theme) => ({
                p: 2.25,
                borderRadius: 3,
                background: `linear-gradient(145deg, ${alpha(
                  theme.palette.primary.main,
                  0.12
                )}, transparent 70%)`,
              })}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <AssetAvatar asset={asset} size={36} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 750,
                    }}
                  >
                    {asset.symbol}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {asset.network}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${asset.activeStreams} live`}
                  color="primary"
                />
              </Stack>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {asset.valueLabel}
              </Typography>
              <Typography
                variant="body2mono"
                color={(asset.netFlowUsd ?? 0) >= 0 ? "primary" : "error"}
              >
                {formatSignedUsd(asset.netFlowUsd ?? 0)} / month
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" color="primary">
                  +${asset.monthlyInflowUsd?.toFixed(2)} in
                </Typography>
                <Typography variant="caption" color="error">
                  −${asset.monthlyOutflowUsd?.toFixed(2)} out
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  gap: 1,
                  mt: 1.5,
                }}
              >
                <Button
                  href="/send"
                  size="small"
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                >
                  Stream
                </Button>
                <Button href="/transfer" size="small" variant="outlined">
                  Transfer
                </Button>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6">All holdings</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              A compact financial list; stream details live above.
            </Typography>
          </Box>
          <Chip label="Sorted by value" variant="outlined" />
        </Box>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {assets.map((asset) => (
            <Stack
              key={asset.id}
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1.4,
              }}
            >
              <AssetAvatar asset={asset} size={34} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 750,
                    }}
                  >
                    {asset.symbol}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {asset.network}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {asset.balance} · {asset.priceLabel}
                </Typography>
              </Box>
              <ProviderEvidence asset={asset} compact />
              <Box sx={{ minWidth: 96, textAlign: "right" }}>
                <Typography
                  variant="body2mono"
                  sx={{
                    fontWeight: 750,
                  }}
                >
                  {asset.valueLabel}
                </Typography>
                {asset.netFlowUsd !== undefined ? (
                  <Typography
                    variant="caption"
                    color={asset.netFlowUsd >= 0 ? "primary" : "error"}
                  >
                    {formatSignedUsd(asset.netFlowUsd)}/mo
                  </Typography>
                ) : null}
              </Box>
              <Tooltip title="Transfer">
                <IconButton
                  href="/transfer"
                  size="small"
                  color="primary"
                  aria-label={`Transfer ${asset.symbol}`}
                >
                  <SwapHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

const NetworkStackConcept: FC<{ assets: LabAsset[] }> = ({ assets }) => {
  const groupedAssets = useMemo(() => {
    const groups = new Map<string, LabAsset[]>();
    assets.forEach((asset) =>
      groups.set(asset.network, [...(groups.get(asset.network) ?? []), asset])
    );
    return [...groups.entries()];
  }, [assets]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        gap: 2,
      }}
    >
      {groupedAssets.map(([network, assets]) => {
        const networkTotal = assets.reduce(
          (sum, asset) => sum + asset.value,
          0
        );
        return (
          <Paper
            key={network}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                p: 2.25,
              }}
            >
              <Box>
                <Typography variant="h6">{network}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {assets.length} assets
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  NETWORK TOTAL
                </Typography>
                <Typography
                  variant="body2mono"
                  sx={{
                    fontWeight: 750,
                  }}
                >
                  $
                  {networkTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Stack>
            <Divider />
            <Stack divider={<Divider flexItem />}>
              {assets.map((asset) => (
                <Stack
                  key={asset.id}
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1.25,
                    p: 2,
                  }}
                >
                  <AssetAvatar asset={asset} size={34} />
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 750,
                        }}
                      >
                        {asset.symbol}
                      </Typography>
                      <TypeChip kind={asset.kind} />
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {asset.balance}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="body2mono"
                      sx={{
                        fontWeight: 750,
                      }}
                    >
                      {asset.valueLabel}
                    </Typography>
                    {asset.netFlowUsd !== undefined ? (
                      <Typography
                        variant="caption"
                        color={asset.netFlowUsd >= 0 ? "primary" : "error"}
                      >
                        {formatSignedUsd(asset.netFlowUsd)}/mo
                      </Typography>
                    ) : null}
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
  <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 3 }}>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.08fr 1fr" },
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <AccountBalanceWalletRoundedIcon color="primary" />
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            TOTAL PORTFOLIO VALUE
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: { xs: 42, md: 62 },
            lineHeight: 1,
            fontWeight: 650,
            letterSpacing: "-0.055em",
          }}
        >
          $12,842.61
        </Typography>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1.25,
            mt: 1.5,
          }}
        >
          <Chip label="+$218.42 · 24h" size="small" color="success" />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            98.6% price coverage
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{
            gap: 1,
            mt: 3,
          }}
        >
          <Button
            href="/send"
            variant="contained"
            startIcon={<SendRoundedIcon />}
          >
            New stream
          </Button>
          <Button
            href="/transfer"
            variant="outlined"
            startIcon={<SwapHorizRoundedIcon />}
          >
            Transfer
          </Button>
        </Stack>
      </Box>
      <Box
        sx={(theme) => ({
          p: { xs: 2.5, md: 3.5 },
          bgcolor: alpha(theme.palette.primary.main, 0.045),
          borderLeft: { md: `1px solid ${theme.palette.divider}` },
          borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 0 },
        })}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
              }}
            >
              STREAMING THIS MONTH
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>
              6 active streams
            </Typography>
          </Box>
          <Chip
            label="Net positive"
            color="success"
            size="small"
            variant="outlined"
          />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1.5,
            mt: 3,
          }}
        >
          <Box>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <ArrowDownwardRoundedIcon color="primary" sx={{ fontSize: 17 }} />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
                INCOMING
              </Typography>
            </Stack>
            <Typography variant="h6" color="primary">
              +$645.26
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              per month
            </Typography>
          </Box>
          <Box>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <ArrowUpwardRoundedIcon color="error" sx={{ fontSize: 17 }} />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                }}
              >
                OUTGOING
              </Typography>
            </Stack>
            <Typography variant="h6" color="error">
              −$304.00
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              per month
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              NET FLOW
            </Typography>
            <Typography variant="h6" color="primary">
              +$341.26
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              per month
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              mb: 0.75,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              Incoming vs outgoing volume
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 750,
              }}
            >
              68% incoming
            </Typography>
          </Stack>
          <Box
            sx={(theme) => ({
              height: 7,
              borderRadius: 8,
              overflow: "hidden",
              bgcolor: alpha(theme.palette.error.main, 0.18),
            })}
          >
            <Box
              sx={{
                width: "68%",
                height: "100%",
                borderRadius: 8,
                bgcolor: "primary.main",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  </Paper>
);

const ProviderComparisonPanel: FC = () => {
  const [selectedProviders, setSelectedProviders] =
    useState<ProviderName[]>(PROVIDERS);
  const [filter, setFilter] = useState<"all" | "disagreements" | "risk">("all");
  const visibleTokens = useMemo(
    () =>
      DISCOVERY_TOKENS.filter((token) => {
        if (filter === "risk") return token.risk;
        if (filter === "disagreements")
          return token.foundBy.length !== PROVIDERS.length;
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
    <Stack
      sx={{
        gap: 3,
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          sx={{
            alignItems: { lg: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">Provider discovery benchmark</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Run one address and chain set through every configured adapter,
              normalize by chain + contract, then expose misses, price spread,
              risk flags and latency.
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Wallet under test"
            value="0xEb85…c28d"
            slotProps={{ input: { readOnly: true } }}
            sx={{ width: { xs: "100%", lg: 210 } }}
          />
          <Button variant="contained" startIcon={<CompareArrowsRoundedIcon />}>
            Run sample fixture
          </Button>
        </Stack>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 1,
            mt: 2.5,
          }}
        >
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
                "& .MuiFormControlLabel-label": {
                  fontSize: 12,
                  fontWeight: 700,
                },
              })}
            />
          ))}
          <Chip
            label="Alchemy key configured"
            size="small"
            color="success"
            variant="outlined"
            sx={{ ml: { md: "auto" } }}
          />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            CONSENSUS HOLDINGS
          </Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>
            4
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Found by all five providers
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            DISAGREEMENTS
          </Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>
            4
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Threshold, coverage or indexing differences
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            RISK CANDIDATES
          </Typography>
          <Typography variant="h4" sx={{ my: 0.75 }}>
            1
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Never include in total without verification
          </Typography>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: { md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            p: 2,
          }}
        >
          <Box>
            <Typography variant="h6">Token pickup matrix</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Representative fixture illustrating the normalized output.
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(_, value) => value && setFilter(value)}
          >
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
                {selectedProviders.map((provider) => (
                  <TableCell key={provider} align="center">
                    {provider}
                  </TableCell>
                ))}
                <TableCell>Normalized result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleTokens.map((token) => (
                <TableRow key={`${token.network}-${token.symbol}`} hover>
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 750,
                      }}
                    >
                      {token.symbol}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {token.network} · {token.value}
                    </Typography>
                  </TableCell>
                  {selectedProviders.map((provider) => (
                    <TableCell key={provider} align="center">
                      {token.foundBy.includes(provider) ? (
                        <CheckCircleRoundedIcon
                          color="success"
                          fontSize="small"
                        />
                      ) : (
                        <Typography
                          sx={{
                            color: "text.disabled",
                          }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {token.risk ? (
                        <Chip size="small" color="error" label="Exclude" />
                      ) : (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${token.foundBy.length}/5`}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        {token.note}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper
        variant="outlined"
        sx={(theme) => ({
          p: 2.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.info.main, 0.05),
        })}
      >
        <Stack
          direction="row"
          sx={{
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <HubRoundedIcon color="info" />
          <Box>
            <Typography
              sx={{
                fontWeight: 750,
              }}
            >
              Live harness design
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Each server-side adapter should return the same token shape:
              provider, chain ID, contract, raw balance, decimals, price, value,
              quality flags, latency and raw-response hash. Run adapters in
              parallel, store fixtures without wallet-identifying logs, and diff
              by <code>chainId-contract</code>. Superfluid data is then joined
              locally to mark Super Tokens and supply authoritative live-flow
              state.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

interface PortfolioFilterBarProps {
  query: string;
  kind: AssetKind | "all";
  activity: ActivityFilter;
  network: string;
  minimumValue: ValueFilter;
  resultCount: number;
  resultValue: number;
  onQueryChange: (value: string) => void;
  onKindChange: (value: AssetKind | "all") => void;
  onActivityChange: (value: ActivityFilter) => void;
  onNetworkChange: (value: string) => void;
  onMinimumValueChange: (value: ValueFilter) => void;
  onReset: () => void;
}

const PortfolioFilterBar: FC<PortfolioFilterBarProps> = ({
  query,
  kind,
  activity,
  network,
  minimumValue,
  resultCount,
  resultValue,
  onQueryChange,
  onKindChange,
  onActivityChange,
  onNetworkChange,
  onMinimumValueChange,
  onReset,
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 1,
        }}
      >
        <FilterAltRoundedIcon color="primary" />
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            Filter the portfolio
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            Find an asset, isolate streaming activity, or remove small
            positions.
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box sx={{ textAlign: { md: "right" } }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            SHOWING {resultCount} OF {ASSETS.length}
          </Typography>
          <Typography
            variant="body2mono"
            sx={{
              fontWeight: 750,
            }}
          >
            $
            {resultValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <Tooltip title="Reset filters">
          <IconButton onClick={onReset} aria-label="Reset portfolio filters">
            <RestartAltRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" },
        gap: 1.25,
        mt: 2,
      }}
    >
      <TextField
        size="small"
        label="Search assets"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="USDC, Ether…"
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
      <TextField
        select
        size="small"
        label="Network"
        value={network}
        onChange={(event) => onNetworkChange(event.target.value)}
      >
        <MenuItem value="all">All networks</MenuItem>
        {NETWORKS.map((networkOption) => (
          <MenuItem key={networkOption} value={networkOption}>
            {networkOption}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Minimum position"
        value={minimumValue}
        onChange={(event) =>
          onMinimumValueChange(event.target.value as ValueFilter)
        }
      >
        <MenuItem value="all">Any value</MenuItem>
        <MenuItem value="100">$100+</MenuItem>
        <MenuItem value="1000">$1,000+</MenuItem>
      </TextField>
    </Box>

    <Divider sx={{ my: 2 }} />
    <Stack
      direction={{ xs: "column", lg: "row" }}
      sx={{
        gap: 1.25,
        alignItems: { lg: "center" },
        flexWrap: "wrap",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 750,
          minWidth: 66,
        }}
      >
        ASSET TYPE
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={kind}
        onChange={(_, value) => value && onKindChange(value)}
        sx={{ flexWrap: "wrap" }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="super">Super Tokens</ToggleButton>
        <ToggleButton value="erc20">ERC-20</ToggleButton>
        <ToggleButton value="native">Native</ToggleButton>
      </ToggleButtonGroup>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 750,
          minWidth: 66,
          ml: { lg: 2 },
        }}
      >
        ACTIVITY
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={activity}
        onChange={(_, value) => value && onActivityChange(value)}
        sx={{ flexWrap: "wrap" }}
      >
        <ToggleButton value="all">Any</ToggleButton>
        <ToggleButton value="streaming">Streaming now</ToggleButton>
        <ToggleButton value="passive">No active streams</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  </Paper>
);

const conceptMeta: Record<
  ConceptId,
  { label: string; description: string; icon: typeof ViewListRoundedIcon }
> = {
  ledger: {
    label: "A · Stream-aware portfolio",
    description:
      "Balances, monthly flows and direct actions in one dashboard-native table.",
    icon: ViewListRoundedIcon,
  },
  streaming: {
    label: "B · Streaming first",
    description: "Streaming activity gets a dedicated band above holdings.",
    icon: ShowChartRoundedIcon,
  },
  networks: {
    label: "C · Network stacks",
    description: "Preserves chain grouping in denser portfolio cards.",
    icon: LayersRoundedIcon,
  },
};

const PortfolioLab: NextPage = () => {
  const [section, setSection] = useState<"designs" | "providers">("designs");
  const [concept, setConcept] = useState<ConceptId>("ledger");
  const [chosenConcept, setChosenConcept] = useState<ConceptId | null>(null);
  const [assetQuery, setAssetQuery] = useState("");
  const [assetKind, setAssetKind] = useState<AssetKind | "all">("all");
  const [assetActivity, setAssetActivity] = useState<ActivityFilter>("all");
  const [assetNetwork, setAssetNetwork] = useState("all");
  const [minimumValue, setMinimumValue] = useState<ValueFilter>("all");
  const ActiveConceptIcon = conceptMeta[concept].icon;
  const filteredAssets = useMemo(() => {
    const normalizedQuery = assetQuery.trim().toLowerCase();
    const valueFloor = minimumValue === "all" ? 0 : Number(minimumValue);

    return ASSETS.filter((asset) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${asset.symbol} ${asset.name}`.toLowerCase().includes(normalizedQuery);
      const matchesKind = assetKind === "all" || asset.kind === assetKind;
      const matchesNetwork =
        assetNetwork === "all" || asset.network === assetNetwork;
      const hasActiveStreams = (asset.activeStreams ?? 0) > 0;
      const matchesActivity =
        assetActivity === "all" ||
        (assetActivity === "streaming" ? hasActiveStreams : !hasActiveStreams);
      return (
        matchesQuery &&
        matchesKind &&
        matchesNetwork &&
        matchesActivity &&
        asset.value >= valueFloor
      );
    });
  }, [assetActivity, assetKind, assetNetwork, assetQuery, minimumValue]);
  const filteredValue = filteredAssets.reduce(
    (total, asset) => total + asset.value,
    0
  );

  const resetFilters = () => {
    setAssetQuery("");
    setAssetKind("all");
    setAssetActivity("all");
    setAssetNetwork("all");
    setMinimumValue("all");
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minWidth: 0,
        maxWidth: { lg: "min(1200px, calc(100vw - 260px)) !important" },
      }}
    >
      <Stack
        sx={{
          gap: 3.5,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: { md: "flex-end" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1,
                mb: 0.75,
              }}
            >
              <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
              <Typography
                variant="overline"
                color="primary"
                sx={{
                  fontWeight: 800,
                }}
              >
                EXPLORATION · PRODUCTION PAGE UNCHANGED
              </Typography>
            </Stack>
            <Typography variant="h3" component="h1">
              Portfolio design lab
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                mt: 1,
                maxWidth: 740,
              }}
            >
              A dashboard-native exploration of wallet balances and live
              streaming state, with direct actions for starting streams,
              transferring assets and wrapping ERC-20s.
            </Typography>
          </Box>
          {chosenConcept ? (
            <Chip
              color="success"
              icon={<CheckCircleRoundedIcon />}
              label={`Current pick: ${conceptMeta[chosenConcept].label}`}
            />
          ) : null}
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <Tabs
            value={section}
            onChange={(_, value) => setSection(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="designs"
              icon={<AccountBalanceWalletRoundedIcon />}
              iconPosition="start"
              label="Portfolio concepts"
            />
            <Tab
              value="providers"
              icon={<CompareArrowsRoundedIcon />}
              iconPosition="start"
              label="Provider comparison"
            />
          </Tabs>
        </Paper>

        {section === "providers" ? (
          <ProviderComparisonPanel />
        ) : (
          <Stack
            sx={{
              gap: 3,
            }}
          >
            <PortfolioHero />

            <PortfolioFilterBar
              query={assetQuery}
              kind={assetKind}
              activity={assetActivity}
              network={assetNetwork}
              minimumValue={minimumValue}
              resultCount={filteredAssets.length}
              resultValue={filteredValue}
              onQueryChange={setAssetQuery}
              onKindChange={setAssetKind}
              onActivityChange={setAssetActivity}
              onNetworkChange={setAssetNetwork}
              onMinimumValueChange={setMinimumValue}
              onReset={resetFilters}
            />

            <Paper variant="outlined" sx={{ p: 1, borderRadius: 3 }}>
              <ToggleButtonGroup
                fullWidth
                exclusive
                value={concept}
                onChange={(_, value) => value && setConcept(value)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                }}
              >
                {(Object.keys(conceptMeta) as ConceptId[]).map((conceptId) => {
                  const Icon = conceptMeta[conceptId].icon;
                  return (
                    <ToggleButton
                      key={conceptId}
                      value={conceptId}
                      sx={{
                        justifyContent: "flex-start",
                        gap: 1.25,
                        p: 1.5,
                        textAlign: "left",
                      }}
                    >
                      <Icon />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                          }}
                        >
                          {conceptMeta[conceptId].label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          {conceptMeta[conceptId].description}
                        </Typography>
                      </Box>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Paper>

            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{
                alignItems: { md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  gap: 1.25,
                  alignItems: "center",
                }}
              >
                <ActiveConceptIcon color="primary" />
                <Box>
                  <Typography variant="h5">
                    {conceptMeta[concept].label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {conceptMeta[concept].description}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant={chosenConcept === concept ? "contained" : "outlined"}
                startIcon={
                  chosenConcept === concept ? (
                    <CheckCircleRoundedIcon />
                  ) : undefined
                }
                onClick={() => setChosenConcept(concept)}
              >
                {chosenConcept === concept
                  ? "Selected"
                  : "Choose this direction"}
              </Button>
            </Stack>

            {filteredAssets.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 5, borderRadius: 3, textAlign: "center" }}
              >
                <SearchRoundedIcon color="disabled" sx={{ fontSize: 42 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  No assets match these filters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Try another token name, lower the value floor, or reset the
                  filters.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </Paper>
            ) : concept === "ledger" ? (
              <UnifiedLedgerConcept assets={filteredAssets} />
            ) : concept === "streaming" ? (
              <StreamingFocusConcept assets={filteredAssets} />
            ) : (
              <NetworkStackConcept assets={filteredAssets} />
            )}

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                }}
              >
                Rules shared by every concept
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                  mt: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    TOTAL
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Sum priced current balances once, deduplicated by chain and
                    contract. Never double-count an ERC-20 that is also known
                    locally as a Super Token.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    AUTHORITY
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Providers discover and price. Superfluid’s protocol data
                    owns the live balance, net flow, stream count and
                    critical-date state.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    TRUST
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Show provider consensus quietly; exclude risky or unpriced
                    dust from the headline total while still allowing an
                    advanced “all detected” view.
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={98.6}
                sx={{ mt: 2.5, height: 5, borderRadius: 4 }}
              />
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
