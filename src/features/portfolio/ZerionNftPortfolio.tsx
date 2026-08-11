import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { allNetworks, tryFindNetwork } from "../network/networks";
import { platformApi } from "../redux/platformApi/platformApi";
import { useAppCurrency } from "../settings/appSettingsHooks";
import { ZerionNftPosition } from "./zerionDefiPortfolioTypes";

interface ZerionNftPortfolioProps {
  address: string;
}

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

const NetworkLabel: FC<{ chainId: string }> = ({ chainId }) => {
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
      <Typography variant="h5" translate="no">
        {getNetworkName(chainId)}
      </Typography>
    </Stack>
  );
};

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
          {nft.amount !== "1" ? `×${nft.amount}` : nft.interface?.toUpperCase()}
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

const ZerionNftPortfolio: FC<ZerionNftPortfolioProps> = ({ address }) => {
  const currency = useAppCurrency();
  const [selectedNetwork, setSelectedNetwork] = useState<string>();
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const networksQuery = platformApi.useZerionNftNetworksQuery({
    address,
    nftNetworks: true,
  });
  const availableNetworks = useMemo(
    () =>
      Object.keys(networksQuery.currentData?.byChain ?? {})
        .filter((chainId) => chainId !== "unknown")
        .sort((first, second) =>
          getNetworkName(first).localeCompare(getNetworkName(second))
        ),
    [networksQuery.currentData?.byChain]
  );

  useEffect(() => {
    setSelectedNetwork(undefined);
    setPage(0);
    setCursors([undefined]);
  }, [address]);

  useEffect(() => {
    if (!availableNetworks.length) return;
    setSelectedNetwork((currentNetwork) =>
      currentNetwork && availableNetworks.includes(currentNetwork)
        ? currentNetwork
        : availableNetworks[0]
    );
  }, [availableNetworks]);

  const currentCursor = cursors[page];
  const pageQuery = platformApi.useZerionNftPageQuery(
    {
      address,
      chainId: selectedNetwork ?? "",
      cursor: currentCursor,
      nftPage: true,
    },
    {
      skip:
        !selectedNetwork || networksQuery.isLoading || networksQuery.isError,
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

  const changeNetwork = (chainId: string) => {
    setSelectedNetwork(chainId);
    setPage(0);
    setCursors([undefined]);
  };

  const goToNextPage = () => {
    const nextCursor = pageQuery.currentData?.nextNftCursor;
    if (!nextCursor) return;
    setCursors((currentCursors) => {
      const nextCursors = currentCursors.slice(0, page + 1);
      nextCursors[page + 1] = nextCursor;
      return nextCursors;
    });
    setPage((currentPage) => currentPage + 1);
  };

  if (networksQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => networksQuery.refetch()}
          >
            Retry
          </Button>
        }
      >
        NFT networks could not be loaded.
      </Alert>
    );
  }

  const isLoading =
    networksQuery.isLoading || pageQuery.isLoading || pageQuery.isFetching;
  const nftsPending =
    networksQuery.currentData?.nftsPending ||
    pageQuery.currentData?.nftsPending;
  const nfts = pageQuery.currentData?.nfts ?? [];
  const nextCursor = pageQuery.currentData?.nextNftCursor;

  return (
    <Stack sx={{ gap: 2 }}>
      {nftsPending ? (
        <Alert severity="info">
          NFTs are still being indexed for this wallet.
        </Alert>
      ) : null}
      {pageQuery.isError ? (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => pageQuery.refetch()}
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
        aria-busy={isLoading}
        sx={{
          mx: { xs: -2, md: 0 },
          borderRadius: { xs: 0, md: 3 },
          overflow: "hidden",
          boxShadow: { xs: "none", md: 1 },
        }}
      >
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
          {selectedNetwork ? (
            <NetworkLabel chainId={selectedNetwork} />
          ) : (
            <Skeleton width={150} height={40} />
          )}
          {availableNetworks.length ? (
            <Select
              size="small"
              value={selectedNetwork ?? ""}
              onChange={(event) => changeNetwork(String(event.target.value))}
              aria-label="NFT network"
              data-cy="zerion-nft-network"
              sx={{ minWidth: { xs: 140, sm: 200 } }}
            >
              {availableNetworks.map((chainId) => (
                <MenuItem key={chainId} value={chainId}>
                  {getNetworkName(chainId)}
                </MenuItem>
              ))}
            </Select>
          ) : null}
        </Stack>

        {isLoading ? (
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
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                sx={{ aspectRatio: "4 / 5" }}
              />
            ))}
          </Box>
        ) : nfts.length ? (
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
              <NftCard key={nft.id} nft={nft} formatCurrency={formatCurrency} />
            ))}
          </Box>
        ) : !nftsPending && !pageQuery.isError ? (
          <Stack
            sx={{ alignItems: "center", textAlign: "center", gap: 1, p: 5 }}
          >
            <CollectionsRoundedIcon
              sx={{ color: "text.disabled", fontSize: 44 }}
            />
            <Typography variant="h6">No NFTs found</Typography>
          </Stack>
        ) : null}

        {(page > 0 || nextCursor) && !pageQuery.isError ? (
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
              disabled={page === 0 || isLoading}
              onClick={() =>
                setPage((currentPage) => Math.max(0, currentPage - 1))
              }
            >
              Previous
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 56, textAlign: "center" }}
            >
              Page {page + 1}
            </Typography>
            <Button
              size="small"
              color="secondary"
              endIcon={<ChevronRightRoundedIcon />}
              disabled={!nextCursor || isLoading}
              onClick={goToNextPage}
            >
              Next
            </Button>
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
};

export default ZerionNftPortfolio;
