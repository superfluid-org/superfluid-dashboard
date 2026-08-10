import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
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
  | "deposit"
  | "loan"
  | "locked"
  | "reward";

const positionFilters: Array<{ value: PositionFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "staked", label: "Staked" },
  { value: "deposit", label: "Deposits" },
  { value: "loan", label: "Loans" },
  { value: "locked", label: "Locked" },
  { value: "reward", label: "Rewards" },
];

const titleCase = (value: string) =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getNetworkName = (chainId: string) => {
  const aliases: Record<string, string> = {
    arbitrum: "Arbitrum One",
    binance: "BNB Smart Chain",
    ethereum: "Ethereum",
  };
  return (
    tryFindNetwork(allNetworks, chainId)?.name ??
    aliases[chainId.toLowerCase()] ??
    titleCase(chainId)
  );
};

const Change: FC<{ value?: number }> = ({ value }) => {
  if (value === undefined) return null;
  const positive = value > 0;
  const negative = value < 0;
  return (
    <Typography
      variant="caption"
      sx={{
        color: positive
          ? "primary.main"
          : negative
          ? "error.main"
          : "text.secondary",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {positive ? "+" : ""}
      {value.toFixed(2)}% today
    </Typography>
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
        md: "minmax(220px, 1.5fr) minmax(110px, .7fr) minmax(120px, .7fr) minmax(120px, .7fr)",
      },
      gap: { xs: 1.5, md: 2 },
      alignItems: "center",
      px: { xs: 2, md: 3 },
      py: 2,
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
        <Typography noWrap sx={{ fontWeight: 600 }}>
          {position.symbol === "—" ? position.name : position.symbol}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {position.protocol || position.name}
        </Typography>
        <Stack
          direction="row"
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 0.75,
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {titleCase(position.positionType)}
          </Typography>
          <Box
            component="span"
            sx={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              bgcolor: "divider",
            }}
          />
          <Typography variant="caption" color="text.secondary" noWrap>
            {getNetworkName(position.chainId)}
          </Typography>
        </Stack>
      </Box>
    </Stack>

    <Chip
      size="small"
      variant="outlined"
      label={titleCase(position.positionType)}
      sx={{ display: { xs: "none", md: "inline-flex" }, justifySelf: "start" }}
    />
    <Typography
      variant="body2"
      color="text.secondary"
      noWrap
      sx={{ display: { xs: "none", md: "block" } }}
    >
      {getNetworkName(position.chainId)}
    </Typography>
    <Stack sx={{ alignItems: "flex-end", minWidth: 0 }}>
      <Typography
        variant="body1mono"
        sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
      >
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
  <Paper
    variant="outlined"
    data-cy="zerion-nft-position"
    sx={{ borderRadius: 2, overflow: "hidden", minWidth: 0 }}
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
      <Typography noWrap sx={{ fontWeight: 600 }}>
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
          {getNetworkName(nft.chainId)}
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
  </Paper>
);

const ZerionDefiPortfolio: FC<ZerionDefiPortfolioProps> = ({ address }) => {
  const currency = useAppCurrency();
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const query = platformApi.useZerionDefiPortfolioQuery({ address });

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "—";
    const maximumFractionDigits = Math.abs(value) >= 1_000 ? 0 : 2;
    return currency.format(
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits,
      })
    );
  };

  const filteredPositions = useMemo(
    () =>
      positionFilter === "all"
        ? query.data?.positions ?? []
        : (query.data?.positions ?? []).filter(
            ({ positionType }) => positionType === positionFilter
          ),
    [positionFilter, query.data?.positions]
  );

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

  const summaryMetrics = [
    {
      label: "Portfolio total",
      value: query.data?.overview.total,
      dataCy: "zerion-portfolio-total",
    },
    {
      label: "DeFi positions",
      value: query.data?.overview.defiTotal,
      dataCy: "zerion-defi-total",
    },
    {
      label: "Staked",
      value: query.data?.overview.stakedTotal,
      dataCy: "zerion-staked-total",
    },
  ];

  return (
    <Stack sx={{ gap: 4 }}>
      <Paper
        variant="outlined"
        aria-busy={query.isLoading || query.isFetching}
        sx={{
          px: { xs: 1.5, md: 3 },
          py: { xs: 2, md: 2.5 },
          bgcolor: { xs: "transparent", md: "background.paper" },
          borderColor: "divider",
          borderStyle: "solid",
          borderWidth: { xs: "1px 0", md: 1 },
          borderRadius: { xs: 0, md: 3 },
          boxShadow: { xs: "none", md: 1 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            rowGap: 2,
          }}
        >
          {summaryMetrics.map(({ label, value, dataCy }, index) => (
            <Stack
              key={dataCy}
              sx={{
                gap: 0.5,
                minWidth: 0,
                pl: index % 2 ? { xs: 2, md: 3 } : { xs: 0, md: index ? 3 : 0 },
                borderLeft:
                  index % 2
                    ? "1px solid"
                    : { xs: "none", md: index ? "1px solid" : "none" },
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              {query.isLoading ? (
                <Skeleton width="72%" height={34} />
              ) : (
                <Typography
                  variant="h5mono"
                  data-cy={dataCy}
                  sx={{
                    fontSize: { xs: "1rem", md: "1.5rem" },
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrency(value)}
                </Typography>
              )}
              {index === 0 && !query.isLoading ? (
                <Change value={query.data?.overview.changePercent24h} />
              ) : null}
            </Stack>
          ))}

          <Stack
            sx={{
              gap: 0.5,
              minWidth: 0,
              pl: { xs: 2, md: 3 },
              borderLeft: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              NFTs
            </Typography>
            {query.isLoading ? (
              <Skeleton width="45%" height={34} />
            ) : (
              <Typography
                variant="h5mono"
                data-cy="zerion-nft-count"
                sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }}
              >
                {query.data?.nfts.length ?? 0}
                {query.data?.hasMoreNfts ? "+" : ""}
              </Typography>
            )}
            <Link
              href="https://zerion.io"
              target="_blank"
              rel="noreferrer"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Data by Zerion
            </Link>
          </Stack>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ borderRadius: { xs: 0, md: 3 }, overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h6">DeFi positions</Typography>
            <Typography variant="body2" color="text.secondary">
              {query.data?.positions.length ?? 0} protocol assets
            </Typography>
          </Box>
          <Stack
            direction="row"
            sx={{ gap: 0.75, maxWidth: "100%", flexWrap: "wrap" }}
          >
            {positionFilters.map(({ value, label }) => (
              <Chip
                key={value}
                size="small"
                label={label}
                clickable
                color={positionFilter === value ? "primary" : "default"}
                variant={positionFilter === value ? "filled" : "outlined"}
                onClick={() => setPositionFilter(value)}
              />
            ))}
          </Stack>
        </Stack>

        {query.data?.positionsUnavailable ? (
          <Alert severity="warning" sx={{ mx: { xs: 2, md: 3 }, mb: 2 }}>
            Position details are temporarily unavailable. The portfolio and
            staked totals are still available.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns:
              "minmax(220px, 1.5fr) minmax(110px, .7fr) minmax(120px, .7fr) minmax(120px, .7fr)",
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
            Type
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Network
          </Typography>
          <Typography variant="body2" color="text.secondary" align="right">
            Value
          </Typography>
        </Box>

        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0, 1fr) 100px",
                gap: 1.5,
                alignItems: "center",
                px: { xs: 2, md: 3 },
                py: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Skeleton variant="circular" width={40} height={40} />
              <Box>
                <Skeleton width="35%" />
                <Skeleton width="22%" />
              </Box>
              <Skeleton width={82} sx={{ justifySelf: "end" }} />
            </Box>
          ))
        ) : query.data
            ?.positionsUnavailable ? null : filteredPositions.length ? (
          filteredPositions.map((position) => (
            <DefiPositionRow
              key={position.id}
              position={position}
              formatCurrency={formatCurrency}
            />
          ))
        ) : (
          <Typography
            color="text.secondary"
            sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
          >
            {positionFilter === "all"
              ? "No DeFi positions found."
              : `No ${positionFilters
                  .find(({ value }) => value === positionFilter)
                  ?.label.toLowerCase()} found.`}
          </Typography>
        )}
      </Paper>

      <Stack sx={{ gap: 2 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "baseline", justifyContent: "space-between" }}
        >
          <Typography variant="h5">NFTs</Typography>
          {query.data?.hasMoreNfts ? (
            <Typography variant="body2" color="text.secondary">
              Showing the first 24
            </Typography>
          ) : null}
        </Stack>

        {query.data?.nftsPending ? (
          <Alert severity="info">
            Zerion is still indexing NFTs for this wallet.
          </Alert>
        ) : null}
        {query.data?.nftsUnavailable ? (
          <Alert severity="warning">
            NFT positions are temporarily unavailable. DeFi totals are still up
            to date.
          </Alert>
        ) : null}

        {query.isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
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
        ) : query.data?.nfts.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {query.data.nfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} formatCurrency={formatCurrency} />
            ))}
          </Box>
        ) : !query.data?.nftsPending && !query.data?.nftsUnavailable ? (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">No NFTs found.</Typography>
          </Paper>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default ZerionDefiPortfolio;
