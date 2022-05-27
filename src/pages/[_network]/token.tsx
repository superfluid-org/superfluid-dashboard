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
import { BigNumber } from "ethers";
import { NextPage } from "next";
import Error from "next/error";
import { useRouter } from "next/router";
import { useState } from "react";
import SubscriptionsTable from "../../features/index/SubscriptionsTable";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { subgraphApi } from "../../features/redux/store";
import { UnitOfTime } from "../../features/send/FlowRateInput";
import StreamsTable from "../../features/streamsTable/StreamsTable";
import EtherFormatted from "../../features/token/EtherFormatted";
import FlowingBalance from "../../features/token/FlowingBalance";
import TokenBalanceGraph from "../../features/token/TokenBalanceGraph";
import TokenToolbar from "../../features/token/TokenToolbar";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";

enum TokenDetailsTabs {
  Streams = "streams",
  Distributions = "distributions",
  Transfers = "transfers",
}

const Token: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useExpectedNetwork();
  const { visibleAddress = "" } = useVisibleAddress();
  const [activeTab, setActiveTab] = useState(TokenDetailsTabs.Streams);

  const tokenId = (router.query.token || "") as string;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenId.toLowerCase(),
  });

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId: network.id,
    id: `${visibleAddress.toLowerCase()}-${tokenId.toLowerCase()}`,
  });

  const handleBack = () => router.back();

  console.log(tokenQuery, tokenSnapshotQuery);
  if (
    tokenQuery.isUninitialized ||
    tokenQuery.isLoading ||
    tokenSnapshotQuery.isUninitialized ||
    tokenSnapshotQuery.isLoading
  ) {
    return <Container maxWidth="lg">LOADING</Container>;
  }

  if (!tokenQuery.data || !tokenSnapshotQuery.data) {
    return <Error statusCode={404} />;
  }

  const onTabChange = (_e: unknown, newTab: TokenDetailsTabs) =>
    setActiveTab(newTab);

  const {
    balanceUntilUpdatedAt,
    totalNetFlowRate,
    totalInflowRate,
    totalOutflowRate,
    updatedAtTimestamp,
  } = tokenSnapshotQuery.data;

  const { id: tokenAddress } = tokenQuery.data;

  return (
    <Container maxWidth="lg">
      <Stack gap={4}>
        <TokenToolbar
          token={tokenQuery.data}
          network={network}
          onBack={handleBack}
        />

        <Card sx={{ px: 4, pt: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
            <Stack gap={0.5}>
              <Typography variant="body1" color="text.secondary">
                Balance
              </Typography>
              <Typography variant="h3mono">
                <FlowingBalance
                  balance={balanceUntilUpdatedAt}
                  flowRate={totalNetFlowRate}
                  balanceTimestamp={updatedAtTimestamp}
                  etherDecimalPlaces={totalNetFlowRate === "0" ? 8 : undefined}
                  disableRoundingIndicator
                />
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Liquidation Date:
                </Typography>
                <Typography variant="h7" color="text.secondary">
                  June 15th, 2022
                </Typography>
              </Stack>
            </Stack>

            <Stack alignItems="end" justifyContent="space-between">
              <Stack direction="row" gap={0.5}>
                <Button variant="textContained" size="xs">
                  1D
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  7D
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  1M
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  3M
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  1Y
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  YTD
                </Button>
                <Button variant="textContained" color="secondary" size="xs">
                  All
                </Button>
              </Stack>

              <Stack alignItems="end">
                <Stack direction="row" alignItems="center">
                  <Typography variant="h5mono">
                    <EtherFormatted
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                      etherDecimalPlaces={8}
                      disableRoundingIndicator
                    />
                    {` /mo`}
                  </Typography>
                  <ArrowDropUpIcon color="primary" />
                </Stack>

                <Stack direction="row" alignItems="center">
                  <Typography variant="h5mono">
                    <EtherFormatted
                      wei={BigNumber.from(totalOutflowRate).mul(
                        UnitOfTime.Month
                      )}
                      etherDecimalPlaces={8}
                      disableRoundingIndicator
                    />
                    {` /mo`}
                  </Typography>
                  <ArrowDropDownIcon color="error" />
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <TokenBalanceGraph height={180} />

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={<Switch defaultChecked />}
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

          {activeTab === TokenDetailsTabs.Transfers && <div>Transfers</div>}
        </TabContext>
      </Stack>
    </Container>
  );
};

export default Token;
