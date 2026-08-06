import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Decimal from "decimal.js";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import FaucetCard from "../faucet/FaucetCard";
import { useActiveNetworks } from "../network/ActiveNetworksContext";
import NetworkSelectionFilter from "../network/NetworkSelectionFilter";
import TokenSnapshotEmptyCard from "./TokenSnapshotEmptyCard";
import TokenSnapshotLoadingTable from "./TokenSnapshotLoadingTable";
import TokenSnapshotTable from "./TokenSnapshotTable";
import { platformApi } from "../redux/platformApi/platformApi";
import { TokenType } from "../redux/endpoints/tokenTypes";
import { ERC20Balance } from "./useERC20Balances";
import { PortfolioToken } from "../portfolio/portfolioTokens";
import { useAppCurrency } from "../settings/appSettingsHooks";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";
import { Currency } from "../../utils/currencyUtils";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

export interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

interface TokenSnapshotTablesProps {
  address: Address;
}

interface PortfolioTotalCardProps {
  tokens: PortfolioToken[];
  loading: boolean;
  unavailable: boolean;
  fallbackNetworkCount: number;
}

const PortfolioTotalCard: FC<PortfolioTotalCardProps> = ({
  tokens,
  loading,
  unavailable,
  fallbackNetworkCount,
}) => {
  const currency = useAppCurrency();
  const exchangeRates = tokenPriceApi.useGetUSDExchangeRateQuery();
  const pricedTokens = tokens.filter(
    (token): token is PortfolioToken & { valueUsd: number } =>
      token.valueUsd !== undefined
  );
  const totalUsd = pricedTokens.reduce(
    (total, token) => total.plus(token.valueUsd),
    new Decimal(0)
  );
  const exchangeRate =
    currency === Currency.USD
      ? 1
      : exchangeRates.currentData?.[currency.toString()];
  const formattedTotal = exchangeRate
    ? currency.format(totalUsd.mul(exchangeRate).toFixed(2))
    : undefined;
  const pricedNetworkCount = new Set(
    pricedTokens.map(({ chainId }) => chainId)
  ).size;
  const coverage = tokens.length
    ? Math.round((pricedTokens.length / tokens.length) * 100)
    : 0;

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2.5, md: 3 }, mb: 4, borderRadius: 3 }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ md: "flex-end" }}
        justifyContent="space-between"
        gap={3}
      >
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Estimated portfolio value
            </Typography>
            {fallbackNetworkCount > 0 ? (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label="Partial coverage"
              />
            ) : null}
          </Stack>
          {loading && tokens.length === 0 ? (
            <Skeleton width={220} height={52} />
          ) : unavailable || !formattedTotal ? (
            <Typography variant="h3">—</Typography>
          ) : (
            <Typography variant="h3" data-cy="portfolio-total-value">
              {formattedTotal}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Based on priced assets returned by the portfolio provider
          </Typography>
        </Box>

        <Stack direction="row" gap={{ xs: 4, md: 6 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              PRICED ASSETS
            </Typography>
            <Typography variant="h6">{pricedTokens.length}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              COVERAGE
            </Typography>
            <Typography variant="h6">{coverage}%</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              NETWORKS
            </Typography>
            <Typography variant="h6">{pricedNetworkCount}</Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

const TokenSnapshotTables: FC<TokenSnapshotTablesProps> = ({ address }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { activeNetworks } = useActiveNetworks();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);

  const [fetchingStatuses, setFetchingStatuses] =
    useState<NetworkFetchingStatuses>({});

  const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

  const portfolioTokensQuery = platformApi.usePortfolioTokensQuery(
    {
      address,
      chainIds: activeNetworks.map(({ id }) => id),
    }
  );

  const erc20BalancesByChainId = useMemo(() => {
    const balancesByChainId: Record<number, ERC20Balance[]> = {};
    portfolioTokensQuery.currentData?.tokens.forEach((portfolioToken) => {
      const chainBalances =
        balancesByChainId[portfolioToken.chainId] ||
        (balancesByChainId[portfolioToken.chainId] = []);
      chainBalances.push({
        balance: portfolioToken.balance,
        priceUsd: portfolioToken.priceUsd,
        token: {
          address: portfolioToken.tokenAddress,
          decimals: portfolioToken.decimals,
          isSuperToken: false,
          logoURI: portfolioToken.logoURI,
          name: portfolioToken.name,
          symbol: portfolioToken.symbol,
          type: TokenType.ERC20UnderlyingToken,
        },
      });
    });
    return balancesByChainId;
  }, [portfolioTokensQuery.currentData]);

  const fallbackChainIds = useMemo(
    () =>
      new Set(
        portfolioTokensQuery.isError
          ? activeNetworks.map(({ id }) => id)
          : portfolioTokensQuery.currentData?.fallbackChainIds || []
      ),
    [
      activeNetworks,
      portfolioTokensQuery.currentData?.fallbackChainIds,
      portfolioTokensQuery.isError,
    ]
  );

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  const fetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) =>
      setFetchingStatuses((currentStatuses) => ({
        ...currentStatuses,
        [networkId]: fetchingStatus,
      })),
    [setFetchingStatuses]
  );

  const hasContent = useMemo(
    () => activeNetworks.some(({ id }) => fetchingStatuses[id]?.hasContent),
    [activeNetworks, fetchingStatuses]
  );

  const isLoading = useMemo(
    () =>
      activeNetworks.some(
        ({ id }) => fetchingStatuses[id]?.isLoading !== false
      ),
    [activeNetworks, fetchingStatuses]
  );

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
        translate="yes"
      >
        <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
          Portfolio
        </Typography>

        <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 2 }}>
          <Button
            data-cy={"network-selection-button"}
            ref={networkSelectionRef}
            variant="outlined"
            color="secondary"
            endIcon={<OpenIcon open={networkSelectionOpen} />}
            onClick={openNetworkSelection}
          >
            All networks
          </Button>
        </Stack>
        <NetworkSelectionFilter
          open={networkSelectionOpen}
          anchorEl={networkSelectionRef.current}
          onClose={closeNetworkSelection}
        />
      </Stack>

      <PortfolioTotalCard
        tokens={portfolioTokensQuery.currentData?.tokens ?? []}
        loading={portfolioTokensQuery.isLoading}
        unavailable={portfolioTokensQuery.isError}
        fallbackNetworkCount={fallbackChainIds.size}
      />

      {!hasContent && !isLoading && (
        <Stack gap={4}>
          <TokenSnapshotEmptyCard includesERC20s />
          {/* <FaucetCard /> */}
        </Stack>
      )}

      <Stack gap={4}>
        {activeNetworks.map((network) => (
          <TokenSnapshotTable
            key={network.id}
            address={address}
            network={network}
            erc20Balances={erc20BalancesByChainId[network.id] || []}
            erc20BalancesLoading={
              (portfolioTokensQuery.isLoading ||
                portfolioTokensQuery.isFetching)
            }
            useERC20Fallback={fallbackChainIds.has(network.id)}
            fetchingCallback={fetchingCallback}
          />
        ))}
        {isLoading && <TokenSnapshotLoadingTable />}
      </Stack>
    </>
  );
};

export default TokenSnapshotTables;
