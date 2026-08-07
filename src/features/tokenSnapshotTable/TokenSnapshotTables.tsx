import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
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
import { useAppCurrency } from "../settings/appSettingsHooks";

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
}) => {
  const currency = useAppCurrency();
  const sumEntries = (key: keyof PortfolioValueEntry) =>
    entries.reduce((total, entry) => {
      const value = entry[key];
      return typeof value === "string" ? total.plus(value) : total;
    }, new Decimal(0));
  const total = sumEntries("value");
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
  const showSkeleton = loading;

  const flowMetrics = [
    {
      label: "Net flow / month",
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
      value: monthlyInflow.isZero()
        ? currency.format("0.00")
        : `+${currency.format(monthlyInflow.toFixed(2))}`,
      color: monthlyInflow.isZero() ? "text.primary" : "primary.main",
      dataCy: "portfolio-monthly-inflow",
    },
    {
      label: "Streaming out / month",
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
      sx={{ px: { xs: 2.5, md: 3 }, py: 2.5, mb: 4, borderRadius: 3 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "minmax(240px, 1.35fr) repeat(3, minmax(135px, 0.75fr))",
          },
          columnGap: { sm: 2.5, md: 3 },
          rowGap: 2,
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            gap: 0.5,
            alignItems: "flex-start",
            gridColumn: { xs: "1", sm: "1 / -1", md: "auto" },
            pb: { xs: 2, md: 0 },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Portfolio balance
          </Typography>
          {showSkeleton ? (
            <Skeleton width={220} height={52} />
          ) : (
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <Typography
                variant="h3"
                data-cy="portfolio-total-value"
                sx={{
                  fontSize: { xs: "2rem", sm: "3rem" },
                  lineHeight: { xs: 1.15, sm: 1.2 },
                }}
              >
                {formattedTotal}
              </Typography>
              {missingPriceSymbols.length > 0 ? (
                <PortfolioMissingPriceWarning symbols={missingPriceSymbols} />
              ) : null}
            </Stack>
          )}
        </Stack>

        {flowMetrics.map(({ label, value, color, dataCy }) => (
          <Stack
            key={dataCy}
            sx={{
              gap: 0.5,
              minWidth: 0,
              pl: { md: 3 },
              borderLeft: { md: "1px solid" },
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {label}
            </Typography>
            {showSkeleton ? (
              <Skeleton width="72%" height={36} />
            ) : (
              <Typography
                variant="h5mono"
                data-cy={dataCy}
                sx={{ color, whiteSpace: "nowrap" }}
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
  const [portfolioValues, setPortfolioValues] = useState<
    Record<string, PortfolioValueEntry>
  >({});

  const portfolioTokensQuery = platformApi.usePortfolioTokensQuery({
    address,
    chainIds: activeNetworks.map(({ id }) => id),
  });

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

  return (
    <>
      <Stack
        direction="row"
        translate="yes"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
          Portfolio
        </Typography>

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
        <NetworkSelectionFilter
          open={networkSelectionOpen}
          anchorEl={networkSelectionRef.current}
          onClose={closeNetworkSelection}
        />
      </Stack>
      <PortfolioTotalCard
        entries={Object.values(portfolioValues)}
        loading={isLoading}
      />

      {!hasContent && !isLoading && (
        <Stack sx={{ gap: 4 }}>
          <TokenSnapshotEmptyCard includesERC20s />
          {/* <FaucetCard /> */}
        </Stack>
      )}
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
              portfolioTokensQuery.isLoading || portfolioTokensQuery.isFetching
            }
            useERC20Fallback={fallbackChainIds.has(network.id)}
            fetchingCallback={fetchingCallback}
            portfolioValueCallback={portfolioValueCallback}
          />
        ))}
        {isLoading && <TokenSnapshotLoadingTable />}
      </Stack>
    </>
  );
};

export default TokenSnapshotTables;
