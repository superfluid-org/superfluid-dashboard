import { Box, Container, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FC, Fragment, PropsWithChildren, useCallback, useMemo } from "react";
import { useAccount, useSwitchNetwork } from "wagmi";
import ConnectOrImpersonate from "../../components/ConnectOrImpersonate/ConnectOrImpersonate";
import Link from "../common/Link";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  networkDefinition,
  vestingSupportedNetworks,
} from "../network/networks";
import NetworkSwitchLink from "../network/NetworkSwitchLink";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingHeader from "./VestingHeader";

const VESTING_SUPPORTED_NETWORK_IDS = vestingSupportedNetworks.map(
  (network) => network.id
);

const VestingNotSupportedCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const NetworkSwitchLinks = useMemo(
    () =>
      vestingSupportedNetworks.map((network, index) => {
        if (VESTING_SUPPORTED_NETWORK_IDS.length - 1 === index) {
          return <NetworkSwitchLink key={network.id} network={network} />;
        }

        if (VESTING_SUPPORTED_NETWORK_IDS.length - 2 === index) {
          return (
            <Fragment key={network.id}>
              <NetworkSwitchLink network={network} />
              {" or "}
            </Fragment>
          );
        }

        return (
          <Fragment key={network.id}>
            <NetworkSwitchLink network={network} />
            {", "}
          </Fragment>
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
      <Typography
        data-cy={"not-supported-network-msg"}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        This network is not supported.
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        Change your network to {NetworkSwitchLinks}
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
        pt: 7,
        pb: 3,
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

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4, mb: 3 }}>
        <ConnectOrImpersonate />
      </Box>

      <Typography color="text.secondary" textAlign="center">
        Want to Vest tokens? Apply for the access code{" "}
        <Link
          data-cy="vesting-form-link"
          href="https://use.superfluid.finance/vesting"
          target="_blank"
        >
          here
        </Link>
        .
      </Typography>
    </Paper>
  );
};

const UnlockVestingCard = () => {
  const { setAccessCodeDialogContent } = useLayoutContext();
  const { setExpectedNetwork } = useExpectedNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address: accountAddress } = useAccount();

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

  const switchToMumbai = useCallback(() => {
    setExpectedNetwork(networkDefinition.polygonMumbai.id);

    if (accountAddress && switchNetwork) {
      switchNetwork(networkDefinition.polygonMumbai.id);
    }
  }, [setExpectedNetwork, switchNetwork, accountAddress]);

  return (
    <Card component={Stack} sx={{ p: 3, pt: 8 }} alignItems="center">
      <Typography variant="h4">Unlock Vesting with Superfluid</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Provide your Access Code or try out Vesting Schedule on Mumbai Testnet.
      </Typography>
      <Stack
        gap={1.5}
        sx={{ mb: 2.5, maxWidth: "400px", width: "100%" }}
        alignItems="stretch"
      >
        <Button
          data-cy={"vesting-code-button"}
          variant="contained"
          size="large"
          onClick={openVestingAccessCodeDialog}
        >
          Enter Access Code
        </Button>
        <Button
          data-cy={"try-on-mumbai-button"}
          variant="outlined"
          size="large"
          onClick={switchToMumbai}
        >
          Try out on Mumbai Testnet
        </Button>
      </Stack>
      <Typography variant="body1" color="text.secondary">
        Want to Vest tokens? Apply for the access code{" "}
        <Link
          data-cy="vesting-form-link"
          href="https://use.superfluid.finance/vesting"
          target="_blank"
        >
          here
        </Link>
        .
      </Typography>
    </Card>
  );
};

const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
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

  if (!networkSupported) {
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
