import { TabContext, TabList } from "@mui/lab";
import {
  Box,
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
import { useNetworkContext } from "../../features/network/NetworkContext";
import { subgraphApi } from "../../features/redux/store";
import { UnitOfTime } from "../../features/send/FlowRateInput";
import StreamsTable from "../../features/streamsTable/StreamsTable";
import EtherFormatted from "../../features/token/EtherFormatted";
import FlowingBalance from "../../features/token/FlowingBalance";
import TokenBalanceGraph from "../../features/token/TokenBalanceGraph";
import TokenToolbar from "../../features/token/TokenToolbar";
import { useWalletContext } from "../../features/wallet/WalletContext";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

enum TokenDetailsTabs {
  Streams = "streams",
  Distributions = "distributions",
  Transfers = "transfers",
}

const Token: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useNetworkContext();
  const { walletAddress = "" } = useWalletContext();
  const [activeTab, setActiveTab] = useState(TokenDetailsTabs.Streams);

  const tokenId = (router.query.token || "") as string;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.chainId,
    id: tokenId.toLowerCase(),
  });

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId: network.chainId,
    id: `${walletAddress.toLowerCase()}-${tokenId.toLowerCase()}`,
  });

  const handleBack = () => router.back();

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

  const { symbol, name, id } = tokenQuery.data;

  return (
    <Container maxWidth="lg">
      <Stack
        sx={{
          my: 4,
        }}
        gap={4}
      >
        <TokenToolbar name={name} symbol={symbol} onBack={handleBack} />

        <Card sx={{ px: 4, pt: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
            <Stack gap={0.5}>
              <Typography variant="h5">Balance</Typography>
              <Typography variant="h3">
                <FlowingBalance
                  balance={balanceUntilUpdatedAt}
                  flowRate={totalNetFlowRate}
                  balanceTimestamp={updatedAtTimestamp}
                  etherDecimalPlaces={totalNetFlowRate === "0" ? 8 : undefined}
                  disableRoundingIndicator
                />
              </Typography>
              <Typography variant="body2">
                Liquidation Date: June 15th, 2022{" "}
              </Typography>
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
                  <Typography variant="h7mono">
                    <EtherFormatted
                      wei={BigNumber.from(totalInflowRate).mul(
                        UnitOfTime.Month
                      )}
                      etherDecimalPlaces={8}
                      disableRoundingIndicator
                    />
                  </Typography>
                  <Typography variant="h7">/mo</Typography>
                  <ArrowDropUpIcon color="primary" />
                </Stack>

                <Stack direction="row" alignItems="center">
                  <Typography variant="h7mono">
                    <EtherFormatted
                      wei={BigNumber.from(totalOutflowRate).mul(
                        UnitOfTime.Month
                      )}
                      etherDecimalPlaces={8}
                      disableRoundingIndicator
                    />
                  </Typography>
                  <Typography variant="h7">/mo</Typography>
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
            <StreamsTable network={network} tokenAddress={id} />
          )}

          {activeTab === TokenDetailsTabs.Distributions && (
            <div>Distributions</div>
          )}

          {activeTab === TokenDetailsTabs.Transfers && <div>Transfers</div>}
        </TabContext>
      </Stack>
    </Container>
  );
};

export default Token;
