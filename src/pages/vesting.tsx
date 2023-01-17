import {
  Box,
  Card,
  Container,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { NextPage } from "next";
import { useMemo } from "react";
import ConnectOrImpersonate from "../components/ConnectOrImpersonate/ConnectOrImpersonate";
import { useFeatureFlags } from "../features/featureFlags/FeatureFlagContext";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { networkDefinition, networks } from "../features/network/networks";
import NetworkSwitchLink from "../features/network/NetworkSwitchLink";
import { ReceivedVestingScheduleTable } from "../features/vesting/ReceivedVestingScheduleTable";
import { SentVestingScheduleTable } from "../features/vesting/SentVestingScheduleTable";
import VestingHeader from "../features/vesting/VestingHeader";
import { VestingSchedulerAllowances } from "../features/vesting/VestingSchedulerAllowances";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const VestingNotSupportedCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { isMainnetEnabled } = useFeatureFlags();

  return (
    <Paper
      elevation={1}
      sx={{
        px: 4,
        py: 7,
        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        },
      }}
    >
      <Typography variant={isBelowMd ? "h5" : "h4"} textAlign="center">
        This network is not supported.
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        Change your network to{" "}
        <NetworkSwitchLink
          network={networkDefinition.ethereum}
          disabled={!isMainnetEnabled}
        />
        , <NetworkSwitchLink network={networkDefinition.polygon} /> or{" "}
        <NetworkSwitchLink network={networkDefinition.goerli} />.
      </Typography>
    </Paper>
  );
};

const VESTING_SUPPORTED_NETWORKS = networks
  .filter((network) => network.vestingContractAddress)
  .map((network) => network.id);

const VestingPage: NextPage = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const networkSupported = useMemo(
    () => VESTING_SUPPORTED_NETWORKS.includes(network.id),
    [network]
  );

  return (
    <Container maxWidth="lg">
      <VestingHeader>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
      </VestingHeader>

      {visibleAddress && (
        <>
          {networkSupported ? (
            <Stack gap={2}>
              <Typography variant="h6">Received Vesting Schedules</Typography>
              <Card sx={{ p: 0, mb: 3 }}>
                <ReceivedVestingScheduleTable />
              </Card>

              <Typography variant="h6">Sent Vesting Schedules</Typography>
              <Card sx={{ p: 0 }}>
                <SentVestingScheduleTable />
              </Card>
              <Card sx={{ p: 0 }}>
                <VestingSchedulerAllowances />
              </Card>
            </Stack>
          ) : (
            <VestingNotSupportedCard />
          )}
        </>
      )}

      {!visibleAddress && (
        <Paper
          elevation={1}
          sx={{
            px: 4,
            py: 7,
            [theme.breakpoints.down("md")]: {
              px: 2,
              py: 3,
            },
          }}
        >
          <Typography variant={isBelowMd ? "h5" : "h4"} textAlign="center">
            No Vesting Schedule Available
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            Received and Sent Vesting Schedules will appear here.
          </Typography>

          <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
            <ConnectOrImpersonate />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default VestingPage;
