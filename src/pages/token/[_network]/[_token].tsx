import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { TabContext, TabList } from "@mui/lab";
import {
  Box,
  Card,
  Chip,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import SEO from "../../../components/SEO/SEO";
import withStaticSEO from "../../../components/SEO/withStaticSEO";
import { useAutoConnect } from "../../../features/autoConnect/AutoConnect";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import SubscriptionsTable from "../../../features/index/SubscriptionsTable";
import NetworkIcon from "../../../features/network/NetworkIcon";
import {
  Network,
  allNetworks,
  tryFindNetwork,
} from "../../../features/network/networks";
import { rpcApi, subgraphApi } from "../../../features/redux/store";
import { UnitOfTime } from "../../../features/send/FlowRateInput";
import StreamsTable from "../../../features/streamsTable/StreamsTable";
import Amount from "../../../features/token/Amount";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenBalanceGraph from "../../../features/token/TokenGraph/TokenBalanceGraph";
import TokenToolbar from "../../../features/token/TokenToolbar";
import FlowingFiatBalance from "../../../features/tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import TransferEventsTable from "../../../features/transfers/TransferEventsTable";
import { useVisibleAddress } from "../../../features/wallet/VisibleAddressContext";
import useNavigateBack from "../../../hooks/useNavigateBack";
import Page404 from "../../404";

export const getTokenPagePath = ({
  network,
  token,
}: {
  network: string;
  token: string;
}) => `/token/${network}/${token}`;

const TokenPageContainer: FC<
  PropsWithChildren<{
    tokenSymbol?: string;
  }>
> = ({ tokenSymbol = "Super Token", children }) => (
  <SEO
    title={`${tokenSymbol} | Superfluid`}
    ogTitle={`${tokenSymbol} | Superfluid`}
  >
    <Container maxWidth="lg">{children}</Container>
  </SEO>
);

const TokenPage: NextPage = () => {
  const router = useRouter();
  const [network, setNetwork] = useState<Network | undefined>();
  const [tokenAddress, setTokenAddress] = useState<string | undefined>();
  const { visibleAddress } = useVisibleAddress();
  const { isAutoConnecting } = useAutoConnect();
  const [routeHandled, setRouteHandled] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setNetwork(tryFindNetwork(allNetworks, router.query._network));
      setTokenAddress(
        isString(router.query._token) ? router.query._token : undefined
      );
      setRouteHandled(true);
    }
  }, [setRouteHandled, router.isReady, router.query._token, router.query._network]);

  useEffect(() => {
    if (!isAutoConnecting && !visibleAddress) {
      router.push("/");
    }
  }, [isAutoConnecting, visibleAddress]);

  const isPageReady = routeHandled && visibleAddress;
  if (!isPageReady) return <TokenPageContainer />;

  if (network && tokenAddress && visibleAddress) {
    return (
      <TokenPageContent
        key={`${tokenAddress}-${visibleAddress}`.toLowerCase()}
        network={network}
        tokenAddress={tokenAddress}
        accountAddress={visibleAddress}
      />
    );
  } else {
    return <Page404 />;
  }
};

enum TokenDetailsTabs {
  Streams = "streams",
  Distributions = "distributions",
  Transfers = "transfers",
}

const GraphTimeUnitFilters = [
  TimeUnitFilterType.Week,
  TimeUnitFilterType.Month,
  TimeUnitFilterType.Quarter,
  TimeUnitFilterType.Year,
  TimeUnitFilterType.YTD,
  TimeUnitFilterType.All,
];

const TokenPageContent: FC<{
  network: Network;
  tokenAddress: string;
  accountAddress: string;
}> = ({ network, tokenAddress, accountAddress }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState(TokenDetailsTabs.Streams);
  const [graphFilter, setGraphFilter] = useState(TimeUnitFilterType.All);
  const [showForecast, setShowForecast] = useState(true);
  const navigateBack = useNavigateBack();

  const tokenPrice = useTokenPrice(network.id, tokenAddress);

  const realTimeBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    tokenAddress: tokenAddress,
    accountAddress: accountAddress,
  });

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress.toLowerCase(),
  });

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId: network.id,
    id: `${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`,
  }, {
    refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
  });

  const onShowForecastChange = (_e: unknown, checked: boolean) =>
    setShowForecast(checked);

  if (tokenQuery.isLoading || tokenSnapshotQuery.isLoading) {
    return <TokenPageContainer />;
  }

  if (!tokenQuery.data || !tokenSnapshotQuery.data) {
    return <Page404 />;
  }

  const onTabChange = (_e: unknown, newTab: TokenDetailsTabs) =>
    setActiveTab(newTab);

  const onGraphFilterChange = (newGraphFilter: TimeUnitFilterType) =>
    setGraphFilter(newGraphFilter);

  const {
    tokenSymbol,
    balanceUntilUpdatedAt,
    totalNetFlowRate,
    totalInflowRate,
    totalOutflowRate,
    updatedAtTimestamp,
    maybeCriticalAtTimestamp,
  } = tokenSnapshotQuery.data;

  const {
    balance = balanceUntilUpdatedAt,
    balanceTimestamp: balanceTimestamp = updatedAtTimestamp,
    flowRate = totalNetFlowRate,
  } = realTimeBalanceQuery.data || {};

  return (
    <TokenPageContainer tokenSymbol={tokenSymbol}>
      <Stack gap={isBelowMd ? 3 : 4}>
        <TokenToolbar
          token={tokenQuery.data}
          network={network}
          onBack={navigateBack}
        />

        <Card
          sx={{
            pb: 2,
            [theme.breakpoints.down("md")]: {
              p: 2,
              mx: -2,
              border: 0,
              background: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Stack
            data-cy={"token-container-by-graph"}
            direction="row"
            justifyContent="space-between"
            sx={{
              mb: 4,
              [theme.breakpoints.down("md")]: {
                mb: 0,
                alignItems: "end",
              },
            }}
          >
            <Stack gap={0.5}>
              <Typography
                variant={isBelowMd ? "body2" : "body1"}
                color="text.secondary"
                translate="yes"
              >
                Balance
              </Typography>
              <Stack direction="row" alignItems="flex-end" columnGap={1}>
                <Typography data-cy={"token-balance"} variant="h3mono">
                  <FlowingBalance
                    balance={balance}
                    flowRate={flowRate}
                    balanceTimestamp={balanceTimestamp}
                    disableRoundingIndicator
                  />
                </Typography>
                <Typography
                  data-cy={"token-symbol"}
                  variant="h5mono"
                  color="text.secondary"
                  sx={{ lineHeight: "30px" }}
                >
                  {tokenSymbol}
                </Typography>
              </Stack>

              {tokenPrice && (
                <Typography
                  data-cy={"token-fiat-balance"}
                  variant="h5mono"
                  color="text.secondary"
                >
                  <FlowingFiatBalance
                    balance={balance}
                    flowRate={flowRate}
                    balanceTimestamp={balanceTimestamp}
                    price={tokenPrice}
                  />
                </Typography>
              )}
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  translate="yes"
                >
                  Liquidation Date:
                </Typography>
                <Typography
                  data-cy={"liquidation-date"}
                  variant="h7"
                  color="text.secondary"
                >
                  {!!maybeCriticalAtTimestamp
                    ? format(maybeCriticalAtTimestamp * 1000, "MMMM do, yyyy")
                    : "-"}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              alignItems={isBelowMd ? "start" : "end"}
              justifyContent="space-between"
            >
              {!isBelowMd && (
                <TimeUnitFilter
                  activeFilter={graphFilter}
                  onChange={onGraphFilterChange}
                  options={GraphTimeUnitFilters}
                />
              )}

              <Stack alignItems="end">
                {isBelowMd && (
                  <Chip
                    size="small"
                    label={network.name}
                    avatar={
                      <NetworkIcon network={network} size={18} fontSize={14} />
                    }
                    sx={{ mb: 1 }}
                  />
                )}
                <Stack direction="row" alignItems="center">
                  <Typography data-cy={"net-incoming"} variant="h5mono">
                    <Amount
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    {` /mo`}
                  </Typography>
                  <ArrowDropUpIcon color="primary" />
                </Stack>

                <Stack direction="row" alignItems="center">
                  <Typography data-cy={"net-outgoing"} variant="h5mono">
                    <Amount
                      wei={BigNumber.from(totalOutflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    {` /mo`}
                  </Typography>
                  <ArrowDropDownIcon color="error" />
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {accountAddress && tokenAddress && (
            <TokenBalanceGraph
              filter={graphFilter}
              network={network}
              account={accountAddress}
              token={tokenAddress}
              showForecast={showForecast}
              height={180}
            />
          )}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {isBelowMd ? (
              <TimeUnitFilter
                activeFilter={graphFilter}
                onChange={onGraphFilterChange}
                options={GraphTimeUnitFilters}
              />
            ) : (
              <Box />
            )}
            <FormGroup>
              <FormControlLabel
                translate="yes"
                control={
                  <Switch
                    checked={showForecast}
                    onChange={onShowForecastChange}
                  />
                }
                label="Forecast"
                labelPlacement="start"
              />
            </FormGroup>
          </Stack>
        </Card>

        <TabContext value={activeTab}>
          <TabList
            variant={isBelowMd ? "fullWidth" : "standard"}
            onChange={onTabChange}
            sx={{
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
              [theme.breakpoints.down("md")]: {
                mx: -2,
              },
            }}
          >
            <Tab
              data-cy="streams-tab"
              label="Streams"
              value={TokenDetailsTabs.Streams}
            />
            <Tab
              data-cy="distribution-tab"
              label="Distributions"
              value={TokenDetailsTabs.Distributions}
            />
            <Tab
              data-cy="transfers-tab"
              label="Transfers"
              value={TokenDetailsTabs.Transfers}
            />
          </TabList>

          {activeTab === TokenDetailsTabs.Streams && (
            <StreamsTable network={network} tokenAddress={tokenAddress} />
          )}

          {activeTab === TokenDetailsTabs.Distributions && (
            <SubscriptionsTable network={network} tokenAddress={tokenAddress} />
          )}

          {activeTab === TokenDetailsTabs.Transfers && (
            <TransferEventsTable
              network={network}
              tokenAddress={tokenAddress}
            />
          )}
        </TabContext>
      </Stack>
    </TokenPageContainer>
  );
};

export default withStaticSEO({ title: "Super Token | Superfluid" }, TokenPage);
