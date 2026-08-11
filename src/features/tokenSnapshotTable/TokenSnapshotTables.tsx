import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Decimal from "decimal.js";
import {
  FC,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useAppCurrency } from "../settings/appSettingsHooks";
import ZerionDefiPortfolio from "../portfolio/ZerionDefiPortfolio";
import ZerionNftPortfolio from "../portfolio/ZerionNftPortfolio";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

export interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

export interface PortfolioValueEntry {
  symbol: string;
  hasBalance: boolean;
  hasFlow: boolean;
  hasPrice: boolean;
  value?: string;
  monthlyNetFlowValue?: string;
  monthlyInflowValue?: string;
  monthlyOutflowValue?: string;
}

export type PortfolioValueCallback = (
  id: string,
  entry: PortfolioValueEntry | undefined
) => void;

interface TokenSnapshotTablesProps {
  address: Address;
}

interface PortfolioTotalCardProps {
  entries: PortfolioValueEntry[];
  loading: boolean;
  zerionTotal?: number;
  zerionLoading: boolean;
}

enum PortfolioView {
  Balances = "balances",
  Defi = "defi",
  Nfts = "nfts",
}

const PortfolioMissingPriceWarning: FC<{ symbols: string[] }> = ({
  symbols,
}) => {
  const [open, setOpen] = useState(false);
  const message = `No price was found for ${symbols.join(", ")}. ${
    symbols.length === 1 ? "It is" : "They are"
  } not included in the portfolio or streaming totals.`;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box component="span" sx={{ display: "inline-flex" }}>
        <Tooltip
          arrow
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          disableTouchListener
          title={message}
        >
          <IconButton
            color="warning"
            size="small"
            aria-label={message}
            aria-expanded={open}
            onClick={() => setOpen((currentlyOpen) => !currentlyOpen)}
            sx={{ p: 0.25 }}
            data-cy="portfolio-missing-price-warning"
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </ClickAwayListener>
  );
};

const PortfolioTotalCard: FC<PortfolioTotalCardProps> = ({
  entries,
  loading,
  zerionTotal,
  zerionLoading,
}) => {
  const currency = useAppCurrency();
  const sumEntries = (key: keyof PortfolioValueEntry) =>
    entries.reduce((total, entry) => {
      const value = entry[key];
      return typeof value === "string" ? total.plus(value) : total;
    }, new Decimal(0));
  const calculatedWalletTotal = sumEntries("value");
  const total =
    zerionTotal === undefined
      ? calculatedWalletTotal
      : new Decimal(zerionTotal);
  const monthlyNetFlow = sumEntries("monthlyNetFlowValue");
  const monthlyInflow = sumEntries("monthlyInflowValue");
  const monthlyOutflow = sumEntries("monthlyOutflowValue");
  const missingPriceSymbols = [
    ...new Set(
      entries
        .filter(
          ({ hasBalance, hasFlow, hasPrice }) =>
            (hasBalance || hasFlow) && !hasPrice
        )
        .map(({ symbol }) => symbol)
    ),
  ];
  const formattedTotal = currency.format(total.toFixed(2));
  const formatSigned = (value: Decimal) => {
    const formattedAbsoluteValue = currency.format(value.abs().toFixed(2));
    if (value.gt(0)) return `+${formattedAbsoluteValue}`;
    if (value.lt(0)) return `−${formattedAbsoluteValue}`;
    return currency.format("0.00");
  };
  const showSkeleton = loading || (zerionLoading && zerionTotal === undefined);
  const isZerionTotal = zerionTotal !== undefined;

  const flowMetrics = [
    {
      label: "Net flow / month",
      mobileLabel: "Net / mo",
      value: formatSigned(monthlyNetFlow),
      color: monthlyNetFlow.gt(0)
        ? "primary.main"
        : monthlyNetFlow.lt(0)
        ? "error.main"
        : "text.primary",
      dataCy: "portfolio-monthly-net-flow",
    },
    {
      label: "Streaming in / month",
      mobileLabel: "In / mo",
      value: monthlyInflow.isZero()
        ? currency.format("0.00")
        : `+${currency.format(monthlyInflow.toFixed(2))}`,
      color: monthlyInflow.isZero() ? "text.primary" : "primary.main",
      dataCy: "portfolio-monthly-inflow",
    },
    {
      label: "Streaming out / month",
      mobileLabel: "Out / mo",
      value: monthlyOutflow.isZero()
        ? currency.format("0.00")
        : `−${currency.format(monthlyOutflow.toFixed(2))}`,
      color: monthlyOutflow.isZero() ? "text.primary" : "error.main",
      dataCy: "portfolio-monthly-outflow",
    },
  ];

  return (
    <Paper
      aria-busy={showSkeleton}
      variant="outlined"
      sx={{
        px: { xs: 1.5, md: 3 },
        py: { xs: 2, md: 2.5 },
        mb: 4,
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
            xs: "minmax(110px, 1.35fr) repeat(3, minmax(0, 0.75fr))",
            md: "minmax(240px, 1.35fr) repeat(3, minmax(135px, 0.75fr))",
          },
          columnGap: { xs: 1, md: 3 },
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            gap: 0.5,
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "inline", md: "none" } }}
            >
              Portfolio
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              Portfolio balance
            </Box>
          </Typography>
          {showSkeleton ? (
            <Skeleton
              sx={{
                width: { xs: 96, sm: 150, md: 220 },
                height: { xs: 26, sm: 34, md: 52 },
              }}
            />
          ) : (
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <Typography
                variant="h3"
                data-cy="portfolio-total-value"
                sx={{
                  fontSize: { xs: "1.125rem", sm: "1.5rem", md: "3rem" },
                  lineHeight: { xs: 1.15, sm: 1.2 },
                  whiteSpace: "nowrap",
                }}
              >
                {formattedTotal}
              </Typography>
              {!isZerionTotal && missingPriceSymbols.length > 0 ? (
                <PortfolioMissingPriceWarning symbols={missingPriceSymbols} />
              ) : null}
            </Stack>
          )}
        </Stack>

        {flowMetrics.map(({ label, mobileLabel, value, color, dataCy }) => (
          <Stack
            key={dataCy}
            sx={{
              gap: 0.5,
              minWidth: 0,
              pl: { xs: 1, md: 3 },
              borderLeft: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "inline", md: "none" } }}
              >
                {mobileLabel}
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "none", md: "inline" } }}
              >
                {label}
              </Box>
            </Typography>
            {showSkeleton ? (
              <Skeleton
                sx={{
                  width: { xs: "78%", md: "72%" },
                  height: { xs: 22, md: 36 },
                }}
              />
            ) : (
              <Typography
                variant="h5mono"
                data-cy={dataCy}
                sx={{
                  color,
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1.5rem" },
                }}
              >
                {value}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>
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
  const [portfolioView, setPortfolioView] = useState(PortfolioView.Balances);
  const [portfolioValues, setPortfolioValues] = useState<
    Record<string, PortfolioValueEntry>
  >({});

  const portfolioTokensQuery = platformApi.usePortfolioTokensQuery({
    address,
    chainIds: activeNetworks.map(({ id }) => id),
  });
  const zerionPortfolioQuery = platformApi.useZerionDefiPortfolioQuery({
    address,
  });

  const zerionPortfolioTotal = useMemo(() => {
    const byChain = zerionPortfolioQuery.currentData?.overview.byChain;
    if (!byChain) return undefined;

    const zerionChainAliases: Record<string, string> = {
      "arbitrum-one": "arbitrum",
      bsc: "binance-smart-chain",
      gnosis: "xdai",
    };
    let matchedNetwork = false;
    const total = activeNetworks.reduce((currentTotal, network) => {
      const chainId = zerionChainAliases[network.slugName] ?? network.slugName;
      if (!(chainId in byChain)) return currentTotal;
      matchedNetwork = true;
      return currentTotal + byChain[chainId];
    }, 0);
    return matchedNetwork ? total : undefined;
  }, [activeNetworks, zerionPortfolioQuery.currentData?.overview.byChain]);

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
  const changePortfolioView = (
    _event: SyntheticEvent,
    nextView: PortfolioView
  ) => {
    setPortfolioView(nextView);
    setNetworkSelectionOpen(false);
  };

  const fetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) =>
      setFetchingStatuses((currentStatuses) => {
        const currentStatus = currentStatuses[networkId];
        if (
          currentStatus?.isLoading === fetchingStatus.isLoading &&
          currentStatus.hasContent === fetchingStatus.hasContent
        ) {
          return currentStatuses;
        }

        return {
          ...currentStatuses,
          [networkId]: fetchingStatus,
        };
      }),
    [setFetchingStatuses]
  );

  const portfolioValueCallback = useCallback<PortfolioValueCallback>(
    (id, entry) =>
      setPortfolioValues((currentValues) => {
        if (!entry) {
          if (!(id in currentValues)) return currentValues;
          const nextValues = { ...currentValues };
          delete nextValues[id];
          return nextValues;
        }

        const currentEntry = currentValues[id];
        if (
          currentEntry?.symbol === entry.symbol &&
          currentEntry.hasBalance === entry.hasBalance &&
          currentEntry.hasFlow === entry.hasFlow &&
          currentEntry.hasPrice === entry.hasPrice &&
          currentEntry.value === entry.value &&
          currentEntry.monthlyNetFlowValue === entry.monthlyNetFlowValue &&
          currentEntry.monthlyInflowValue === entry.monthlyInflowValue &&
          currentEntry.monthlyOutflowValue === entry.monthlyOutflowValue
        ) {
          return currentValues;
        }

        return { ...currentValues, [id]: entry };
      }),
    []
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

  const isPortfolioSummaryLoading = useMemo(
    () =>
      !activeNetworks.some(
        ({ id }) => fetchingStatuses[id]?.isLoading === false
      ),
    [activeNetworks, fetchingStatuses]
  );

  return (
    <>
      <Stack
        direction="row"
        translate="yes"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
          Portfolio
        </Typography>

        {portfolioView === PortfolioView.Balances ? (
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
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
        ) : null}
        <NetworkSelectionFilter
          open={networkSelectionOpen}
          anchorEl={networkSelectionRef.current}
          onClose={closeNetworkSelection}
        />
      </Stack>
      <Tabs
        value={portfolioView}
        onChange={changePortfolioView}
        variant={isBelowMd ? "fullWidth" : "standard"}
        aria-label="Portfolio views"
        sx={{
          mb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tab
          value={PortfolioView.Balances}
          label="Balances"
          data-cy="portfolio-balances-tab"
        />
        <Tab
          value={PortfolioView.Defi}
          label="DeFi"
          data-cy="portfolio-defi-tab"
        />
        <Tab
          value={PortfolioView.Nfts}
          label="NFTs"
          data-cy="portfolio-nfts-tab"
        />
      </Tabs>

      {portfolioView === PortfolioView.Balances ? (
        <>
          <PortfolioTotalCard
            entries={Object.values(portfolioValues)}
            loading={isPortfolioSummaryLoading}
            zerionTotal={zerionPortfolioTotal}
            zerionLoading={zerionPortfolioQuery.isLoading}
          />

          {!hasContent && !isLoading ? (
            <Stack sx={{ gap: 4 }}>
              <TokenSnapshotEmptyCard includesERC20s />
              {/* <FaucetCard /> */}
            </Stack>
          ) : null}
          <Stack
            sx={{
              gap: 4,
            }}
          >
            {activeNetworks.map((network) => (
              <TokenSnapshotTable
                key={network.id}
                address={address}
                network={network}
                erc20Balances={erc20BalancesByChainId[network.id] || []}
                erc20BalancesLoading={
                  portfolioTokensQuery.isLoading ||
                  portfolioTokensQuery.isFetching
                }
                useERC20Fallback={fallbackChainIds.has(network.id)}
                fetchingCallback={fetchingCallback}
                portfolioValueCallback={portfolioValueCallback}
              />
            ))}
            {isLoading && <TokenSnapshotLoadingTable />}
          </Stack>
        </>
      ) : portfolioView === PortfolioView.Defi ? (
        <ZerionDefiPortfolio address={address} />
      ) : (
        <ZerionNftPortfolio address={address} />
      )}
    </>
  );
};

export default TokenSnapshotTables;
