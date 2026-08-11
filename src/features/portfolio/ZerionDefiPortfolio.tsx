import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { allNetworks, tryFindNetwork } from "../network/networks";
import { platformApi } from "../redux/platformApi/platformApi";
import { useAppCurrency } from "../settings/appSettingsHooks";
import { ZerionDefiPosition } from "./zerionDefiPortfolioTypes";

interface ZerionDefiPortfolioProps {
  address: string;
}

type PositionFilter =
  | "all"
  | "staked"
  | "liquidity"
  | "supplied"
  | "loan"
  | "locked"
  | "reward";

const positionFilters: Array<{ value: PositionFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "staked", label: "Staked" },
  { value: "liquidity", label: "Liquidity" },
  { value: "supplied", label: "Supplied" },
  { value: "loan", label: "Borrowed" },
  { value: "locked", label: "Locked" },
  { value: "reward", label: "Rewards" },
];

const dashboardNetworkAliases: Record<string, string> = {
  arbitrum: "arbitrum-one",
  "binance-smart-chain": "bsc",
  xdai: "gnosis",
};

const titleCase = (value: string) =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getDashboardNetwork = (chainId: string) =>
  tryFindNetwork(
    allNetworks,
    dashboardNetworkAliases[chainId.toLowerCase()] ?? chainId
  );

const getNetworkName = (chainId: string) =>
  getDashboardNetwork(chainId)?.name ?? titleCase(chainId);

const getPositionLabel = (position: ZerionDefiPosition) => {
  if (position.isLiquidityPosition) return "Liquidity";
  switch (position.positionType) {
    case "deposit":
      return "Supplied";
    case "loan":
      return "Borrowed";
    case "reward":
      return "Reward";
    case "wallet":
      return "Held";
    default:
      return titleCase(position.positionType);
  }
};

const matchesPositionFilter = (
  position: ZerionDefiPosition,
  filter: PositionFilter
) => {
  switch (filter) {
    case "all":
      return true;
    case "liquidity":
      return position.isLiquidityPosition;
    case "supplied":
      return (
        position.positionType === "deposit" && !position.isLiquidityPosition
      );
    default:
      return position.positionType === filter;
  }
};

const Change: FC<{ value?: number }> = ({ value }) => {
  if (value === undefined) return null;
  return (
    <Typography
      variant="caption"
      sx={{
        color:
          value > 0
            ? "primary.main"
            : value < 0
            ? "error.main"
            : "text.secondary",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}% · 24h
    </Typography>
  );
};

const NetworkSectionHeading: FC<{ chainId: string; count: number }> = ({
  chainId,
  count,
}) => {
  const network = getDashboardNetwork(chainId);
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 2, px: { xs: 2, md: 4 }, py: 2 }}
    >
      {network ? (
        <NetworkIcon network={network} size={36} />
      ) : (
        <Avatar sx={{ width: 36, height: 36, fontSize: 16 }}>
          {getNetworkName(chainId).slice(0, 1)}
        </Avatar>
      )}
      <Box>
        <Typography variant="h5" translate="no">
          {getNetworkName(chainId)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count} {count === 1 ? "position" : "positions"}
        </Typography>
      </Box>
    </Stack>
  );
};

const AssetAvatar: FC<{
  name: string;
  src?: string;
  protocolSrc?: string;
}> = ({ name, src, protocolSrc }) => (
  <Box sx={{ position: "relative", flexShrink: 0 }}>
    <Avatar
      src={src}
      alt=""
      sx={{ width: 40, height: 40, bgcolor: "background.default" }}
    >
      {name.slice(0, 1).toUpperCase()}
    </Avatar>
    {protocolSrc ? (
      <Avatar
        src={protocolSrc}
        alt=""
        sx={{
          position: "absolute",
          right: -3,
          bottom: -3,
          width: 18,
          height: 18,
          border: "2px solid",
          borderColor: "background.paper",
        }}
      />
    ) : null}
  </Box>
);

const DefiPositionRow: FC<{
  position: ZerionDefiPosition;
  formatCurrency: (value?: number) => string;
}> = ({ position, formatCurrency }) => (
  <Box
    data-cy="zerion-defi-position"
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "minmax(0, 1fr) auto",
        md: "minmax(240px, 1.5fr) minmax(140px, .7fr) minmax(140px, .7fr)",
      },
      gap: { xs: 1.5, md: 2 },
      alignItems: "center",
      px: { xs: 2, md: 3 },
      py: 1.5,
      borderTop: "1px solid",
      borderColor: "divider",
      minWidth: 0,
    }}
  >
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <AssetAvatar
        name={position.name}
        src={position.iconUrl}
        protocolSrc={position.protocolIconUrl}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" noWrap>
          {position.symbol === "—" ? position.name : position.symbol}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {position.protocol || position.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "block", md: "none" }, mt: 0.25 }}
        >
          {getPositionLabel(position)}
        </Typography>
      </Box>
    </Stack>

    <Chip
      size="small"
      variant="outlined"
      label={getPositionLabel(position)}
      sx={{ display: { xs: "none", md: "inline-flex" }, justifySelf: "start" }}
    />
    <Stack sx={{ alignItems: "flex-end", minWidth: 0 }}>
      <Typography variant="h6mono" sx={{ whiteSpace: "nowrap" }}>
        {formatCurrency(position.value)}
      </Typography>
      <Change value={position.changePercent24h} />
    </Stack>
  </Box>
);

const ZerionDefiPortfolio: FC<ZerionDefiPortfolioProps> = ({ address }) => {
  const currency = useAppCurrency();
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const query = platformApi.useZerionDefiPortfolioQuery({ address });

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "—";
    return currency.format(
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const filteredPositions = useMemo(
    () =>
      (query.data?.positions ?? []).filter((position) =>
        matchesPositionFilter(position, positionFilter)
      ),
    [positionFilter, query.data?.positions]
  );

  const positionGroups = useMemo(() => {
    const groups = filteredPositions.reduce<
      Record<string, ZerionDefiPosition[]>
    >((currentGroups, position) => {
      (currentGroups[position.chainId] ??= []).push(position);
      return currentGroups;
    }, {});
    return Object.entries(groups).sort(([firstChain], [secondChain]) =>
      getNetworkName(firstChain).localeCompare(getNetworkName(secondChain))
    );
  }, [filteredPositions]);

  if (query.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Portfolio positions could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      <Paper
        variant="outlined"
        aria-busy={query.isLoading || query.isFetching}
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          mx: { xs: -2, md: 0 },
          borderRadius: { xs: 0, md: 3 },
          boxShadow: { xs: "none", md: 1 },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", gap: 3 }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Protocol position value
            </Typography>
            {query.isLoading ? (
              <Skeleton width={180} height={42} />
            ) : (
              <Typography variant="h4mono" data-cy="zerion-defi-total">
                {formatCurrency(query.data?.overview.defiTotal)}
              </Typography>
            )}
            {!query.isLoading ? (
              <Change value={query.data?.overview.changePercent24h} />
            ) : null}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              Staked
            </Typography>
            {query.isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant="h6mono" data-cy="zerion-staked-total">
                {formatCurrency(query.data?.overview.stakedTotal)}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Stack sx={{ gap: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="h5">Protocol positions</Typography>
          <Stack
            direction="row"
            sx={{ gap: 0.5, maxWidth: "100%", flexWrap: "wrap" }}
          >
            {positionFilters.map(({ value, label }) => (
              <Button
                key={value}
                size="small"
                variant="textContained"
                color={positionFilter === value ? "primary" : "secondary"}
                onClick={() => setPositionFilter(value)}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Stack>

        {query.data?.positionsUnavailable ? (
          <Alert severity="warning">
            Position details are temporarily unavailable. The aggregate total is
            still available.
          </Alert>
        ) : null}

        {query.isLoading ? (
          <Paper
            variant="outlined"
            sx={{ mx: { xs: -2, md: 0 }, borderRadius: { xs: 0, md: 3 } }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Stack
                key={index}
                direction="row"
                sx={{
                  alignItems: "center",
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderTop: index ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="32%" />
                  <Skeleton width="20%" />
                </Box>
                <Skeleton width={86} />
              </Stack>
            ))}
          </Paper>
        ) : query.data?.positionsUnavailable ? null : positionGroups.length ? (
          <Stack sx={{ gap: 4 }}>
            {positionGroups.map(([chainId, positions]) => (
              <Paper
                key={chainId}
                variant="outlined"
                sx={{
                  mx: { xs: -2, md: 0 },
                  borderRadius: { xs: 0, md: 3 },
                  overflow: "hidden",
                  boxShadow: { xs: "none", md: 1 },
                }}
              >
                <NetworkSectionHeading
                  chainId={chainId}
                  count={positions.length}
                />
                <Box
                  sx={{
                    display: { xs: "none", md: "grid" },
                    gridTemplateColumns:
                      "minmax(240px, 1.5fr) minmax(140px, .7fr) minmax(140px, .7fr)",
                    gap: 2,
                    px: 3,
                    py: 1.5,
                    bgcolor: "background.default",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Asset
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Position
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="right"
                  >
                    Value
                  </Typography>
                </Box>
                {positions.map((position) => (
                  <DefiPositionRow
                    key={position.id}
                    position={position}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mx: { xs: -2, md: 0 },
              borderRadius: { xs: 0, md: 3 },
            }}
          >
            <Typography color="text.secondary">
              No matching protocol positions found.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
};

export default ZerionDefiPortfolio;
