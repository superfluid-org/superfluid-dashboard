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
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useAutoConnect } from "../../../features/autoConnect/AutoConnect";
import SubscriptionsTable from "../../../features/index/SubscriptionsTable";
import NetworkIcon from "../../../features/network/NetworkIcon";
import { Network, networksBySlug } from "../../../features/network/networks";
import { rpcApi, subgraphApi } from "../../../features/redux/store";
import { UnitOfTime } from "../../../features/send/FlowRateInput";
import StreamsTable from "../../../features/streamsTable/StreamsTable";
import Ether from "../../../features/token/Ether";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenBalanceGraph, {
  GraphType,
} from "../../../features/token/TokenGraph/TokenBalanceGraph";
import TokenGraphFilter from "../../../features/token/TokenGraph/TokenGraphFilter";
import TokenToolbar from "../../../features/token/TokenToolbar";
import TransferEventsTable from "../../../features/transfers/TransferEventsTable";
import { useVisibleAddress } from "../../../features/wallet/VisibleAddressContext";
import { NextPage } from "next";
import Page404 from "../../404";

export const getTokenPagePath = ({
  network,
  token,
}: {
  network: string;
  token: string;
}) => `/token/${network}/${token}`;

const TokenPage: NextPage = () => {
  const router = useRouter();
  const [network, setNetwork] = useState<Network | undefined>();
  const [tokenAddress, setTokenAddress] = useState<string | undefined>();
  const { visibleAddress } = useVisibleAddress();
  const { isAutoConnecting } = useAutoConnect();

  useEffect(() => {
    if (router.isReady) {
      setNetwork(
        networksBySlug.get(
          isString(router.query._network) ? router.query._network : ""
        )
      );
      setTokenAddress(
        isString(router.query._token) ? router.query._token : undefined
      );
    }
  }, [router.isReady, router.query._token]);

  const isPageReady = router.isReady && !isAutoConnecting;
  if (!isPageReady) return <Container />;

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

const TokenPageContent: FC<{
  network: Network;
  tokenAddress: string;
  accountAddress: string;
}> = ({ network, tokenAddress, accountAddress }) => {
  const theme = useTheme();
  const router = useRouter();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState(TokenDetailsTabs.Streams);
  const [graphType, setGraphType] = useState(GraphType.All);
  const [showForecast, setShowForecast] = useState(true);

  const { data: _discard, ...realTimeBalanceQuery } =
    rpcApi.useRealtimeBalanceQuery({
      chainId: network.id,
      tokenAddress: tokenAddress,
      accountAddress: accountAddress,
    });

  const { data: _discard3, ...tokenQuery } = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress.toLowerCase(),
  });

  const { data: _discard2, ...tokenSnapshotQuery } =
    subgraphApi.useAccountTokenSnapshotQuery({
      chainId: network.id,
      id: `${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`,
    });

  const onShowForecastChange = (_e: unknown, checked: boolean) =>
    setShowForecast(checked);

  const handleBack = () => router.back();

  if (tokenQuery.isLoading || tokenSnapshotQuery.isLoading) {
    return <Container />;
  }

  if (!tokenQuery.currentData || !tokenSnapshotQuery.currentData) {
    return <Page404 />;
  }

  const onTabChange = (_e: unknown, newTab: TokenDetailsTabs) =>
    setActiveTab(newTab);

  const onGraphTypeChange = (newGraphType: GraphType) =>
    setGraphType(newGraphType);

  const {
    balanceUntilUpdatedAt,
    totalNetFlowRate,
    totalInflowRate,
    totalOutflowRate,
    updatedAtTimestamp,
    maybeCriticalAtTimestamp,
  } = tokenSnapshotQuery.currentData;

  const {
    balance = balanceUntilUpdatedAt,
    balanceTimestamp = updatedAtTimestamp,
    flowRate = totalNetFlowRate,
  } = realTimeBalanceQuery.currentData || {};

  return (
    <Container maxWidth="lg">
      <Stack gap={isBelowMd ? 3 : 4}>
        <TokenToolbar
          token={tokenQuery.currentData}
          network={network}
          onBack={handleBack}
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
              >
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

            <Stack
              alignItems={isBelowMd ? "start" : "end"}
              justifyContent="space-between"
            >
              {!isBelowMd && (
                <TokenGraphFilter
                  activeType={graphType}
                  onChange={onGraphTypeChange}
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

          {accountAddress && tokenAddress && (
            <TokenBalanceGraph
              graphType={graphType}
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
              <TokenGraphFilter
                activeType={graphType}
                onChange={onGraphTypeChange}
              />
            ) : (
              <Box />
            )}
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

export default TokenPage;
