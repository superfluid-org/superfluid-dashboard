import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { TabContext, TabList } from "@mui/lab";
import {
  Button,
  Card,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Tab,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { isString } from "lodash";
import Error from "next/error";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import SubscriptionsTable from "../../features/index/SubscriptionsTable";
import { rpcApi, subgraphApi } from "../../features/redux/store";
import {
  getNetworkStaticPaths,
  getNetworkStaticProps,
} from "../../features/routing/networkPaths";
import { UnitOfTime } from "../../features/send/FlowRateInput";
import StreamsTable from "../../features/streamsTable/StreamsTable";
import Ether from "../../features/token/Ether";
import FlowingBalance from "../../features/token/FlowingBalance";
import TokenBalanceGraph, {
  GraphType,
} from "../../features/token/TokenBalanceGraph";
import TokenToolbar from "../../features/token/TokenToolbar";
import TransferEventsTable from "../../features/transfers/TransferEventsTable";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import withPathNetwork, { NetworkPage } from "../../hoc/withPathNetwork";
import Page404 from "../404";

enum TokenDetailsTabs {
  Streams = "streams",
  Distributions = "distributions",
  Transfers = "transfers",
}

const Token: FC<NetworkPage> = ({ network }) => {
  const theme = useTheme();
  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();

  const [activeTab, setActiveTab] = useState(TokenDetailsTabs.Streams);
  const [graphType, setGraphType] = useState(GraphType.All);
  const [showForecast, setShowForecast] = useState(true);

  const tokenId = isString(router.query.token) ? router.query.token : undefined;

  const { data: _discard, ...realTimeBalanceQuery } =
    rpcApi.useRealtimeBalanceQuery(
      tokenId && visibleAddress
        ? {
            chainId: network.id,
            tokenAddress: tokenId,
            accountAddress: visibleAddress,
          }
        : skipToken
    );

  const tokenQuery = subgraphApi.useTokenQuery(
    tokenId
      ? {
          chainId: network.id,
          id: tokenId.toLowerCase(),
        }
      : skipToken
  );

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery(
    tokenId && visibleAddress
      ? {
          chainId: network.id,
          id: `${visibleAddress.toLowerCase()}-${tokenId.toLowerCase()}`,
        }
      : skipToken
  );

  useEffect(() => {
    if (!tokenId || !visibleAddress) router.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, visibleAddress]);

  const onShowForecastChange = (_e: unknown, checked: boolean) =>
    setShowForecast(checked);

  const handleBack = () => router.back();

  if (
    tokenQuery.isUninitialized ||
    tokenQuery.isLoading ||
    tokenSnapshotQuery.isUninitialized ||
    tokenSnapshotQuery.isLoading
  ) {
    return <Container />;
  }

  if (!tokenQuery.data || !tokenSnapshotQuery.data) {
    return <Page404 />;
  }

  const onTabChange = (_e: unknown, newTab: TokenDetailsTabs) =>
    setActiveTab(newTab);

  const onGraphTypeChange = (newGraphType: GraphType) => () =>
    setGraphType(newGraphType);

  const getGraphFilterColor = (type: GraphType) =>
    graphType === type ? "primary" : "secondary";

  const {
    balanceUntilUpdatedAt,
    totalNetFlowRate,
    totalInflowRate,
    totalOutflowRate,
    updatedAtTimestamp,
    maybeCriticalAtTimestamp,
  } = tokenSnapshotQuery.data;

  const {
    balance = balanceUntilUpdatedAt,
    balanceTimestamp = updatedAtTimestamp,
    flowRate = totalNetFlowRate,
  } = realTimeBalanceQuery.currentData || {};

  const { id: tokenAddress } = tokenQuery.data;

  return (
    <Container maxWidth="lg">
      <Stack gap={4}>
        <TokenToolbar
          token={tokenQuery.data}
          network={network}
          onBack={handleBack}
        />

        <Card sx={{ pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
            <Stack gap={0.5}>
              <Typography variant="body1" color="text.secondary">
                Balance
              </Typography>
              <Typography variant="h3mono">
                <FlowingBalance
                  balance={balance}
                  flowRate={flowRate}
                  balanceTimestamp={balanceTimestamp}
                  disableRoundingIndicator
                />
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Liquidation Date:
                </Typography>
                <Typography variant="h7" color="text.secondary">
                  {!!maybeCriticalAtTimestamp
                    ? format(maybeCriticalAtTimestamp * 1000, "MMMM do, yyyy")
                    : "-"}
                </Typography>
              </Stack>
            </Stack>

            <Stack alignItems="end" justifyContent="space-between">
              <Stack direction="row" gap={0.5}>
                {/* <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.Day)}
                  onClick={onGraphTypeChange(GraphType.Day)}
                  size="xs"
                >
                  1D
                </Button> */}
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.Week)}
                  onClick={onGraphTypeChange(GraphType.Week)}
                  size="xs"
                >
                  7D
                </Button>
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.Month)}
                  onClick={onGraphTypeChange(GraphType.Month)}
                  size="xs"
                >
                  1M
                </Button>
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.Quarter)}
                  onClick={onGraphTypeChange(GraphType.Quarter)}
                  size="xs"
                >
                  3M
                </Button>
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.Year)}
                  onClick={onGraphTypeChange(GraphType.Year)}
                  size="xs"
                >
                  1Y
                </Button>
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.YTD)}
                  onClick={onGraphTypeChange(GraphType.YTD)}
                  size="xs"
                >
                  YTD
                </Button>
                <Button
                  variant="textContained"
                  color={getGraphFilterColor(GraphType.All)}
                  onClick={onGraphTypeChange(GraphType.All)}
                  size="xs"
                >
                  All
                </Button>
              </Stack>

              <Stack alignItems="end">
                <Stack direction="row" alignItems="center">
                  <Typography variant="h5mono">
                    <Ether
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                    />
                    {` /mo`}
                  </Typography>
                  <ArrowDropUpIcon color="primary" />
                </Stack>

                <Stack direction="row" alignItems="center">
                  <Typography variant="h5mono">
                    <Ether
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

          {visibleAddress && tokenId && (
            <TokenBalanceGraph
              graphType={graphType}
              network={network}
              account={visibleAddress}
              token={tokenId}
              showForecast={showForecast}
              height={180}
            />
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <FormGroup>
              <FormControlLabel
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
            onChange={onTabChange}
            sx={{
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Tab label="Streams" value={TokenDetailsTabs.Streams} />
            <Tab label="Distributions" value={TokenDetailsTabs.Distributions} />
            <Tab label="Transfers" value={TokenDetailsTabs.Transfers} />
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
    </Container>
  );
};

export default withPathNetwork(Token);

export const getStaticPaths = getNetworkStaticPaths;
export const getStaticProps = getNetworkStaticProps;
