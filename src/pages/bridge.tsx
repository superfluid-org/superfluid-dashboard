import type { LiFiWidget, WidgetConfig } from "@lifi/widget";
import dynamic from "next/dynamic";

import { Container, Paper, Stack, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useMemo } from "react";
import { useDisconnect, useSigner, useSwitchNetwork } from "wagmi";
import SEO from "../components/SEO/SEO";
import { useConnectButton } from "../features/wallet/ConnectButtonProvider";
import {
  buildTheme,
  ELEVATION1_BG,
  FONT_FAMILY,
} from "../features/theme/theme";
import { deepmerge } from "@mui/utils";

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

  const widgetTheme = useMemo(() => {
    return deepmerge(theme, {
      components: {},
    });
  }, [theme]);

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
      appearance: widgetTheme.palette.mode,
      integrator: "Superfluid",
      theme: widgetTheme,

      containerStyle: {
        animation: "none",
        background: "none",
        width: 560,
        height: 700,
        margin: "0 auto",
        // border: `1px solid ${theme.palette.other.outline}`,
        // background: theme.palette.background.paper,
        // backgroundImage: ELEVATION1_BG,
        // border: `1px solid rgb(234, 234, 234)`,
        borderRadius: "16px",
        display: "flex",
        maxWidth: 560,
      },
      disableAppearance: true,
    }),
    [
      signer,
      fetchSigner,
      openConnectModal,
      switchNetworkAsync,
      disconnectAsync,
      widgetTheme,
    ]
  );

  return (
    <SEO title="Bridge | Superfluid">
      <Container maxWidth="lg">
        <Stack
          flex={1}
          sx={{
            ".MuiScopedCssBaseline-root, #widget-header, .MuiAppBar-root": {
              background: "transparent",
            },
          }}
        >
          <LiFiWidgetDynamic config={widgetConfig} />
        </Stack>
      </Container>
    </SEO>
  );
};

export default Bridge;
