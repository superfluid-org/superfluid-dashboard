"use client";

import { Box, useTheme } from "@mui/material";
import { ClientOnly } from "./ClientOnly";
import {
  WidgetConfig,
  WidgetSkeleton,
  WidgetTheme,
  jumperTheme,
} from "@lifi/widget";
import { EthereumProvider } from "@lifi/widget-provider-ethereum";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { ELEVATION1_BG } from "../theme/theme";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import { useEffect, useMemo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "../wallet/ConnectButtonProvider";
import useFeaturedTokens from "./useFeaturedTokens";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { isAddress } from "viem";

const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => <div>Loading LiFi Widget...</div>,
  }
);

// The Ethereum provider detects the app's surrounding WagmiProvider and reuses its
// connections. No reactive inputs, so a single module-level instance suffices.
const widgetProviders = [EthereumProvider()];

export function LiFiWidgetManager() {
  const theme = useTheme();
  const router = useRouter();
  const { isEOA } = useVisibleAddress();
  const { availableMainNetworks } = useAvailableNetworks();

  const { openConnectModal } = useConnectButton();

  const featuredTokens = useFeaturedTokens();
  const fromChainQuery = Array.isArray(router.query.fromChain)
    ? router.query.fromChain[0]
    : router.query.fromChain;
  const fromTokenQuery = Array.isArray(router.query.fromToken)
    ? router.query.fromToken[0]
    : router.query.fromToken;
  const parsedFromChain = Number(fromChainQuery);
  const preselectedFromChain =
    Number.isSafeInteger(parsedFromChain) &&
    availableMainNetworks.some(({ id }) => id === parsedFromChain)
      ? parsedFromChain
      : undefined;
  const preselectedFromToken =
    typeof fromTokenQuery === "string" && isAddress(fromTokenQuery)
      ? fromTokenQuery
      : undefined;

  const config = useMemo(() => {
    const widgetTheme = {
      container: {
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
      // components: theme.components,
      palette: theme.palette,
      shape: theme.shape,
      typography: {
        ...jumperTheme.typography,
        fontFamily: theme.typography.fontFamily,
      },
    } as Partial<WidgetTheme>;

    const config = {
      appearance: theme.palette.mode,
      theme: widgetTheme,
      chains: {
        allow: availableMainNetworks.map((x) => x.id),
      },
      requiredUI: { toAddress: !isEOA },
      hiddenUI: { appearance: true },
      providers: widgetProviders,
      walletConfig: {
        onConnect() {
          openConnectModal();
        },
      },
      tokens: {
        featured: featuredTokens,
      },
      fromChain: preselectedFromChain,
      fromToken: preselectedFromToken,
      formUpdateKey:
        preselectedFromChain && preselectedFromToken
          ? `${preselectedFromChain}:${preselectedFromToken.toLowerCase()}`
          : undefined,
    } as Partial<WidgetConfig>;

    return config;
  }, [
    isEOA,
    availableMainNetworks,
    theme,
    openConnectModal,
    featuredTokens,
    preselectedFromChain,
    preselectedFromToken,
  ]);

  // # Side
  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  useEffect(() => {
    // We don't know when the Li.Fi widget form is filled and we don't want to automatically switch the expected network because that would re-render the Li.Fi widget.
    stopAutoSwitchToWalletNetwork();
  }, [stopAutoSwitchToWalletNetwork]);
  // ---

  return (
    <ClientOnly fallback={<WidgetSkeleton config={config} />}>
      <Box
        sx={{
          ".MuiScopedCssBaseline-root, #widget-header, .MuiAppBar-root": {
            background: "none",
          },
          ".MuiButton-root": {
            color: "#fff",
            textTransform: "initial",
            // padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 500,
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
        <LiFiWidget config={config} integrator="Superfluid" />
      </Box>
    </ClientOnly>
  );
}
