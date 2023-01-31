import { Box, Container, Paper, Typography, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ReactElement, useMemo } from "react";
import ConnectOrImpersonate from "../components/ConnectOrImpersonate/ConnectOrImpersonate";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useFeatureFlags } from "../features/featureFlags/FeatureFlagContext";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  networkDefinition,
  networks,
  vestingSupportedNetworks,
} from "../features/network/networks";
import NetworkSwitchLink from "../features/network/NetworkSwitchLink";
import VestingHeader from "../features/vesting/VestingHeader";
import VestingLayout from "../features/vesting/VestingLayout";
import VestingScheduleTables from "../features/vesting/VestingScheduleTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { NextPageWithLayout } from "./_app";

const VESTING_SUPPORTED_NETWORK_IDS = vestingSupportedNetworks.map(
  (network) => network.id
);

const VestingNotSupportedCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { isMainnetEnabled } = useFeatureFlags();

  const NetworkLinks = useMemo(
    () =>
      vestingSupportedNetworks.map((network, index) => {
        if (VESTING_SUPPORTED_NETWORK_IDS.length - 1 === index) {
          return (
            <NetworkSwitchLink
              key={network.id}
              network={network}
              disabled={
                network.id === networkDefinition.ethereum.id &&
                !isMainnetEnabled
              }
            />
          );
        }

        if (VESTING_SUPPORTED_NETWORK_IDS.length - 2 === index) {
          return (
            <>
              <NetworkSwitchLink
                key={network.id}
                network={network}
                disabled={
                  network.id === networkDefinition.ethereum.id &&
                  !isMainnetEnabled
                }
              />
              {" or "}
            </>
          );
        }

        return (
          <>
            <NetworkSwitchLink
              key={network.id}
              network={network}
              disabled={
                network.id === networkDefinition.ethereum.id &&
                !isMainnetEnabled
              }
            />
            {", "}
          </>
        );
      }),
    []
  );

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
        Change your network to {NetworkLinks}
      </Typography>
    </Paper>
  );
};

const VestingPage: NextPageWithLayout = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const networkSupported = useMemo(
    () => VESTING_SUPPORTED_NETWORK_IDS.includes(network.id),
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
            <VestingScheduleTables />
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
            No Vesting Schedules Available
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

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default withStaticSEO({ title: "Vesting | Superfluid" }, VestingPage);
