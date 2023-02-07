import { FC, PropsWithChildren, useMemo } from "react";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import Page404 from "../../pages/404";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "../common/Link";
import { Container, useTheme } from "@mui/material";
import VestingHeader from "./VestingHeader";
import Box from "@mui/material/Box/Box";
import Stack from "@mui/material/Stack";
import { useLayoutContext } from "../layout/LayoutContext";
import { useSwitchNetwork } from "wagmi";
import ConnectOrImpersonate from "../../components/ConnectOrImpersonate/ConnectOrImpersonate";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import NetworkSwitchLink from "../network/NetworkSwitchLink";
import {
  networkDefinition,
  vestingSupportedNetworks,
} from "../network/networks";

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
    [isMainnetEnabled]
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
      <Typography
        data-cy={"not-supported-network-msg"}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        This network is not supported.
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        Change your network to {NetworkLinks}
      </Typography>
    </Paper>
  );
};

const NotConnectedCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

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
        No Vesting Schedules Available
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        Received and Sent Vesting Schedules will appear here.
      </Typography>

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
        <ConnectOrImpersonate />
      </Box>
    </Paper>
  );
};

const UnlockVestingCard = () => {
  const { setAccessCodeDialogContent } = useLayoutContext();
  const { switchNetwork } = useSwitchNetwork();

  const openVestingAccessCodeDialog = () => {
    setAccessCodeDialogContent({
      title: "Access Vesting",
      description: (
        <Typography>
          Unlock Vesting by entering your unique access code. With this feature,
          you&apos;ll be able to set up vesting schedules and track your vesting
          assets.
        </Typography>
      ),
    });
  };

  return (
    <Card component={Stack} sx={{ p: 3, pt: 8 }} alignItems="center">
      <Typography variant="h4">Unlock Vesting with Superfluid</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Provide your Access Code or try out Vesting Schedule on Goerli Testnet.
      </Typography>
      <Stack
        gap={1.5}
        sx={{ mb: 2.5, maxWidth: "400px", width: "100%" }}
        alignItems="stretch"
      >
        <Button
          variant="contained"
          size="large"
          onClick={openVestingAccessCodeDialog}
        >
          Enter Access Code
        </Button>
        <Button variant="outlined" size="large">
          Try out on Goerli Testnet
        </Button>
      </Stack>
      <Typography variant="body1" color="text.secondary">
        Want to Vest tokens? Apply for the access code{" "}
        <Link href="superfluid.finance" target="_blank">
          here
        </Link>
        .
      </Typography>
    </Card>
  );
};

interface VestingLayoutProps extends PropsWithChildren {}

const VestingLayout: FC<VestingLayoutProps> = ({ children }) => {
  const { isVestingEnabled } = useFeatureFlags();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const networkSupported = useMemo(
    () => VESTING_SUPPORTED_NETWORK_IDS.includes(network.id),
    [network]
  );

  if (!visibleAddress) {
    return (
      <Container maxWidth="lg">
        <VestingHeader hideCreate>
          <Typography component="h1" variant="h4">
            Vesting
          </Typography>
        </VestingHeader>
        <NotConnectedCard />
      </Container>
    );
  }

  if (!isVestingEnabled && !network.testnet) {
    return (
      <Container maxWidth="lg">
        <VestingHeader hideCreate>
          <Typography component="h1" variant="h4">
            Vesting
          </Typography>
        </VestingHeader>
        <UnlockVestingCard />
      </Container>
    );
  }

  if (networkSupported) {
    return (
      <Container maxWidth="lg">
        <VestingHeader hideCreate>
          <Typography component="h1" variant="h4">
            Vesting
          </Typography>
        </VestingHeader>
        <VestingNotSupportedCard />
      </Container>
    );
  }

  return <ReduxPersistGate>{children}</ReduxPersistGate>;
};

export default VestingLayout;
