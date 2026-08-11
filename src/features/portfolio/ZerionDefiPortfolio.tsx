import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, ReactNode, useMemo, useState } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { allNetworks, tryFindNetwork } from "../network/networks";
import { platformApi } from "../redux/platformApi/platformApi";
import { useAppCurrency } from "../settings/appSettingsHooks";
import {
  ZerionDefiPosition,
  ZerionNftPosition,
} from "./zerionDefiPortfolioTypes";

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

const NetworkLabel: FC<{ chainId: string; count?: number }> = ({
  chainId,
  count,
}) => {
  const network = getDashboardNetwork(chainId);
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
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
        {count !== undefined ? (
          <Typography variant="body2" color="text.secondary">
            {count} {count === 1 ? "item" : "items"}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
};

const NetworkSectionHeading: FC<{
  chainId: string;
  count?: number;
  trailing?: ReactNode;
}> = ({ chainId, count, trailing }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      px: { xs: 2, md: 4 },
      py: 2,
    }}
  >
    <NetworkLabel chainId={chainId} count={count} />
    {trailing}
  </Stack>
);

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

const NftCard: FC<{
  nft: ZerionNftPosition;
  formatCurrency: (value?: number) => string;
}> = ({ nft, formatCurrency }) => (
  <Box
    data-cy="zerion-nft-position"
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      overflow: "hidden",
      minWidth: 0,
      bgcolor: "background.paper",
    }}
  >
    <Box
      sx={{
        aspectRatio: "1 / 1",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {nft.imageUrl ? (
        <Box
          component="img"
          src={nft.imageUrl}
          alt={nft.name}
          loading="lazy"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <CollectionsRoundedIcon sx={{ color: "text.disabled", fontSize: 42 }} />
      )}
    </Box>
    <Stack sx={{ p: 1.5, gap: 0.25, minWidth: 0 }}>
      <Typography variant="h7" noWrap>
        {nft.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {nft.collectionName || getNetworkName(nft.chainId)}
      </Typography>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", gap: 1, mt: 0.75, minWidth: 0 }}
      >
        <Typography variant="caption" color="text.secondary" noWrap>
          {nft.amount !== "1" ? `×${nft.amount}` : getNetworkName(nft.chainId)}
        </Typography>
        {nft.value !== undefined ? (
          <Typography
            variant="body2mono"
            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {formatCurrency(nft.value)}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  </Box>
);

const ZerionDefiPortfolio: FC<ZerionDefiPortfolioProps> = ({ address }) => {
  const currency = useAppCurrency();
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [nftNetwork, setNftNetwork] = useState("all");
  const [nftPage, setNftPage] = useState(0);
  const [nftCursors, setNftCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const query = platformApi.useZerionDefiPortfolioQuery({ address });
  const currentNftCursor = nftCursors[nftPage];
  const usesEmbeddedNftPage = nftNetwork === "all" && nftPage === 0;
  const nftPageQuery = platformApi.useZerionNftPageQuery(
    {
      address,
      nftPage: true,
      chainId: nftNetwork === "all" ? undefined : nftNetwork,
      cursor: currentNftCursor,
    },
    {
      skip: usesEmbeddedNftPage || query.isLoading || query.isError,
    }
  );

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

  const availableNftNetworks = useMemo(() => {
    const chainIds = new Set<string>();
    Object.entries(query.data?.overview.byChain ?? {}).forEach(
      ([chainId, value]) => {
        if (value > 0) chainIds.add(chainId);
      }
    );
    query.data?.nfts.forEach(({ chainId }) => chainIds.add(chainId));
    chainIds.delete("unknown");
    return [...chainIds].sort((first, second) =>
      getNetworkName(first).localeCompare(getNetworkName(second))
    );
  }, [query.data?.nfts, query.data?.overview.byChain]);

  const currentNfts = usesEmbeddedNftPage
    ? query.data?.nfts ?? []
    : nftPageQuery.currentData?.nfts ?? [];
  const nextNftCursor = usesEmbeddedNftPage
    ? query.data?.nextNftCursor
    : nftPageQuery.currentData?.nextNftCursor;
  const nftsPending = usesEmbeddedNftPage
    ? query.data?.nftsPending
    : nftPageQuery.currentData?.nftsPending;
  const nftsLoading =
    query.isLoading ||
    (!usesEmbeddedNftPage &&
      (nftPageQuery.isLoading || nftPageQuery.isFetching));

  const nftGroups = useMemo(() => {
    const groups = currentNfts.reduce<Record<string, ZerionNftPosition[]>>(
      (currentGroups, nft) => {
        (currentGroups[nft.chainId] ??= []).push(nft);
        return currentGroups;
      },
      {}
    );
    return Object.entries(groups).sort(([firstChain], [secondChain]) =>
      getNetworkName(firstChain).localeCompare(getNetworkName(secondChain))
    );
  }, [currentNfts]);

  const changeNftNetwork = (chainId: string) => {
    setNftNetwork(chainId);
    setNftPage(0);
    setNftCursors([undefined]);
  };

  const goToNextNftPage = () => {
    if (!nextNftCursor) return;
    setNftCursors((currentCursors) => {
      const nextCursors = currentCursors.slice(0, nftPage + 1);
      nextCursors[nftPage + 1] = nextNftCursor;
      return nextCursors;
    });
    setNftPage((currentPage) => currentPage + 1);
  };

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
        Zerion portfolio data could not be loaded.
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
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
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
          <Stack
            direction="row"
            sx={{ alignItems: "center", gap: { xs: 3, md: 6 } }}
          >
            <Box>
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
            <Link
              href="https://zerion.io"
              target="_blank"
              rel="noreferrer"
              underline="hover"
              color="text.secondary"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
            >
              <Typography variant="body2">Data by Zerion</Typography>
              <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
            </Link>
          </Stack>
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
          <Box>
            <Typography variant="h5">Protocol positions</Typography>
            <Typography variant="body2" color="text.secondary">
              {query.data?.positions.length ?? 0} assets across protocols
            </Typography>
          </Box>
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
            sx={{ p: 3, mx: { xs: -2, md: 0 }, borderRadius: { xs: 0, md: 3 } }}
          >
            <Typography color="text.secondary">
              No matching protocol positions found.
            </Typography>
          </Paper>
        )}
      </Stack>

      <Stack sx={{ gap: 2 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}
        >
          <Box>
            <Typography variant="h5">NFTs</Typography>
            <Typography variant="body2" color="text.secondary">
              Paginated by network
            </Typography>
          </Box>
          <Select
            size="small"
            value={nftNetwork}
            onChange={(event) => changeNftNetwork(String(event.target.value))}
            aria-label="NFT network"
            data-cy="zerion-nft-network"
            sx={{ minWidth: { xs: 150, sm: 210 } }}
          >
            <MenuItem value="all">All networks</MenuItem>
            {availableNftNetworks.map((chainId) => (
              <MenuItem key={chainId} value={chainId}>
                {getNetworkName(chainId)}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {query.data?.nftsUnavailable ? (
          <Alert severity="warning">
            NFT positions are temporarily unavailable. Protocol totals are still
            up to date.
          </Alert>
        ) : null}
        {nftsPending ? (
          <Alert severity="info">
            Zerion is still indexing NFTs for this wallet.
          </Alert>
        ) : null}
        {nftPageQuery.isError ? (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => nftPageQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            This NFT page could not be loaded.
          </Alert>
        ) : null}

        <Paper
          variant="outlined"
          aria-busy={nftsLoading}
          sx={{
            mx: { xs: -2, md: 0 },
            borderRadius: { xs: 0, md: 3 },
            overflow: "hidden",
            boxShadow: { xs: "none", md: 1 },
          }}
        >
          {nftsLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
                p: { xs: 2, md: 3 },
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  sx={{ aspectRatio: "4 / 5" }}
                />
              ))}
            </Box>
          ) : nftGroups.length ? (
            nftGroups.map(([chainId, nfts]) => (
              <Box
                key={chainId}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "&:first-of-type": { borderTop: "none" },
                }}
              >
                <NetworkSectionHeading chainId={chainId} count={nfts.length} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(3, minmax(0, 1fr))",
                      md: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                    px: { xs: 2, md: 3 },
                    pb: 3,
                  }}
                >
                  {nfts.map((nft) => (
                    <NftCard
                      key={nft.id}
                      nft={nft}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </Box>
              </Box>
            ))
          ) : !nftsPending &&
            !query.data?.nftsUnavailable &&
            !nftPageQuery.isError ? (
            <Stack
              sx={{ alignItems: "center", textAlign: "center", gap: 1, p: 5 }}
            >
              <CollectionsRoundedIcon
                sx={{ color: "text.disabled", fontSize: 44 }}
              />
              <Typography variant="h6">No NFTs found</Typography>
              <Typography variant="body2" color="text.secondary">
                This wallet has no visible NFTs on the selected network.
              </Typography>
            </Stack>
          ) : null}

          {(nftPage > 0 || nextNftCursor) && !nftPageQuery.isError ? (
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
                px: { xs: 2, md: 3 },
                py: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size="small"
                color="secondary"
                startIcon={<ChevronLeftRoundedIcon />}
                disabled={nftPage === 0 || nftsLoading}
                onClick={() =>
                  setNftPage((currentPage) => Math.max(0, currentPage - 1))
                }
              >
                Previous
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 56, textAlign: "center" }}
              >
                Page {nftPage + 1}
              </Typography>
              <Button
                size="small"
                color="secondary"
                endIcon={<ChevronRightRoundedIcon />}
                disabled={!nextNftCursor || nftsLoading}
                onClick={goToNextNftPage}
              >
                Next
              </Button>
            </Stack>
          ) : null}
        </Paper>
      </Stack>
    </Stack>
  );
};

export default ZerionDefiPortfolio;
