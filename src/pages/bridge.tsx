import type { LiFiWidget, WidgetConfig } from "@lifi/widget";
import dynamic from "next/dynamic";

import { LiFi } from "@lifi/sdk";
import { Box, Container, Stack, Typography, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useEffect, useMemo } from "react";
import { useDisconnect, useSwitchNetwork, useWalletClient } from "wagmi";
import useFeaturedTokens from "../features/bridge/useFeaturedTokens";
import { ELEVATION1_BG } from "../features/theme/theme";
import { useConnectButton } from "../features/wallet/ConnectButtonProvider";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { useAvailableNetworks } from "../features/network/AvailableNetworksContext";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import {
  walletClientToSigner,
  useEthersSigner,
} from "../utils/wagmiEthersAdapters";
import Link from "../features/common/Link";

const LiFiWidgetDynamic = dynamic(
  () => import("@lifi/widget").then((module) => module.LiFiWidget) as any,
  {
    ssr: false,
  }
) as typeof LiFiWidget;

const Bridge: NextPage = () => {
  const theme = useTheme();

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  useEffect(() => {
    stopAutoSwitchToWalletNetwork(); // We don't know when the Li.Fi widget form is filled and we don't want to automatically switch the expected network because that would re-render the Li.Fi widget.
  }, []);

  const { refetch } = useWalletClient();
  const signer = useEthersSigner();
  const { isEOA } = useVisibleAddress();
  const { disconnectAsync } = useDisconnect();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectButton();
  const { availableNetworks } = useAvailableNetworks();

  const lifi = useMemo(() => new LiFi({
    integrator: "Superfluid"
  }), []);
  const featuredTokens = useFeaturedTokens(lifi);
  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      walletManagement: {
        switchChain: async (chainId) => {
          await switchNetworkAsync?.(chainId);
          return refetch().then((x) =>
            x.data ? walletClientToSigner(x.data) : signer!
          );
        },
        disconnect: disconnectAsync,
        connect: async () => {
          openConnectModal();
          return Promise.reject();
        },
        signer: signer ?? undefined,
      },
      featuredTokens,
      appearance: theme.palette.mode,
      integrator: "Superfluid",
      containerStyle: {
        maxWidth: "560px",
        margin: "32px auto",
        display: "flex",
        width: "100%",
        minWidth: 0,
        borderRadius: "20px",
        border:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.other.outline}`
            : "none",
        backgroundColor: theme.palette.background.paper,
        backgroundImage: ELEVATION1_BG,
        boxShadow: theme.shadows[1],
      },
      chains: {
        allow: availableNetworks.map((x) => x.id),
      },
      disableAppearance: true,
      theme: theme,
      requiredUI: isEOA ? [] : ["toAddress"], // Force to fill in receiver address when smart contract wallet.
      // Uncomment for testnets
      // sdkConfig: {
      //   apiUrl: "https://staging.li.quest/v1/"
      // },
    }),
    [
      theme,
      signer,
      featuredTokens,
      availableNetworks,
      isEOA,
      // fetchSigner,
      // openConnectModal,
      // switchNetworkAsync,
      // disconnectAsync,
      // TODO(KK): These deps need to be not included because otherwise disconnect doesn't work...
    ]
  );

  return (
    <Container
      data-cy={"lifi-widget"}
      maxWidth="lg"
      sx={{
        ".MuiScopedCssBaseline-root, #widget-header, .MuiAppBar-root": {
          background: "none",
        },
        ".MuiButton-root": {
          color: "#fff",
          textTransform: "initial",
          padding: "14px 24px",
          fontSize: "16px",
          backgroundColor: theme.palette.primary.main,
        },
        ".MuiButton-root:hover": {
          color: "#fff",
          backgroundColor: "rgba(12, 149, 42, 1)",
        },
        ".MuiButton-sizeMedium": {
          letterSpacing: "0.17px",
        },
      }}
    >
      <LiFiWidgetDynamic {...widgetConfig} />
      <Stack pt={6} alignItems="center">
        <Typography
          sx={{
            maxWidth: 524,
            textAlign: "inherit",
          }}
          variant="h7"
          component="p"
          color="secondary"
          textAlign="center"
        >
          The Bridge is operated by LI.FI, and we cannot take responsibility for
          any issues. For support related to the bridge, please refer to the
          LI.FI{" "}
          <Link href="https://discord.com/invite/lifi" target="_blank">
            Discord server
          </Link>.
        </Typography>
      </Stack>
    </Container>
  );
};

export default withStaticSEO({ title: "Bridge | Superfluid" }, Bridge);
