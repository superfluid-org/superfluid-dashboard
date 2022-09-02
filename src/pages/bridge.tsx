import type { LiFiWidget, WidgetConfig } from "@lifi/widget";
import dynamic from "next/dynamic";

import LIFI from "@lifi/sdk";
import { Container, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useMemo } from "react";
import { useDisconnect, useSigner, useSwitchNetwork } from "wagmi";
import useFeaturedTokens from "../features/bridge/useFeaturedTokens";
import { ELEVATION1_BG } from "../features/theme/theme";
import { useConnectButton } from "../features/wallet/ConnectButtonProvider";
import withStaticSEO from "../components/SEO/withStaticSEO";

const LiFiWidgetDynamic = dynamic(
  () => import("@lifi/widget").then((module) => module.LiFiWidget) as any,
  {
    ssr: false,
  }
) as typeof LiFiWidget;

const Bridge: NextPage = () => {
  const theme = useTheme();

  const { data: signer, refetch: fetchSigner } = useSigner();
  const { disconnectAsync } = useDisconnect();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectButton();

  const lifi = useMemo(() => new LIFI(), []);

  const featuredTokens = useFeaturedTokens(lifi);

  const widgetConfig: WidgetConfig = useMemo(
    () => ({
      walletManagement: {
        switchChain: async (chainId) => {
          await switchNetworkAsync?.(chainId);
          return fetchSigner().then((x) => x.data!);
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
        maxWidth: "100%",
        margin: "32px auto",
        display: "flex",
        width: 560,
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
      disableAppearance: true,
      theme: theme,
    }),
    [
      theme,
      signer,
      featuredTokens,
      // fetchSigner,
      // openConnectModal,
      // switchNetworkAsync,
      // disconnectAsync,
      // TODO(KK): These deps need to be not included because otherwise disconnect doesn't work...
    ]
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        ".MuiScopedCssBaseline-root, #widget-header, .MuiAppBar-root": {
          background: "none",
        },
        ".MuiLoadingButton-root": {
          color: "#fff",
          textTransform: "initial",
          padding: "14px 24px",
          fontSize: "16px",
          backgroundColor: theme.palette.primary.main,
        },
        ".MuiLoadingButton-root:hover": {
          color: "#fff",
          backgroundColor: "rgba(12, 149, 42, 1)",
        },
        ".MuiButton-sizeMedium": {
          letterSpacing: "0.17px",
        },
      }}
    >
      <LiFiWidgetDynamic config={widgetConfig} />
    </Container>
  );
};

export default withStaticSEO({ title: "Bridge | Superfluid" }, Bridge);
