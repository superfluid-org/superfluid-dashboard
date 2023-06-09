import { Box, Container, useTheme } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FC, Fragment, PropsWithChildren, useMemo } from "react";
import ConnectOrImpersonate from "../../components/ConnectOrImpersonate/ConnectOrImpersonate";
import Link from "../common/Link";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkSwitchLink from "../network/NetworkSwitchLink";
import { vestingSupportedNetworks } from "../network/networks";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import SimpleVestingHeader from "./SimpleVestingHeader";

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

const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const networkSupported = useMemo(
    () => VESTING_SUPPORTED_NETWORK_IDS.includes(network.id),
    [network]
  );

  if (!visibleAddress) {
    return (
      <Container maxWidth="lg">
        <SimpleVestingHeader />
        <NotConnectedCard />
      </Container>
    );
  }

  if (!networkSupported) {
    return (
      <Container maxWidth="lg">
        <SimpleVestingHeader />
        <VestingNotSupportedCard />
      </Container>
    );
  }

  return <ReduxPersistGate>{children}</ReduxPersistGate>;
};

export default VestingLayout;
