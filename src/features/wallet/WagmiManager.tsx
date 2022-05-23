import { FC, useEffect, useState } from "react";
import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { Chain, createWagmiClient, WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@mui/material";
import { networks } from "../network/networks";

const wagmiChains: Chain[] = networks.map(network => ({
  id: network.chainId,
  name: network.displayName,
  rpcUrls: {
    default: network.rpcUrl
  }
}));
const { chains, provider } = configureChains(
  wagmiChains,
  [
    apiProvider.jsonRpc((chain) => ({
      rpcUrl: chain.rpcUrls.default,
    })),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Superfluid Dashboard",
  chains: chains,
});

export const wagmiClient = createWagmiClient({
  connectors,
  provider,
});

const WagmiManager: FC = ({ children }) => {
  useEffect(() => {
    wagmiClient.autoConnect().then((provider) => {
      if (provider?.chain) {
      }
    });
  }, []);

  return <WagmiProvider client={wagmiClient}>{children}</WagmiProvider>;
};

export default WagmiManager;

export const RainbowKitManager: FC = ({ children }) => {
  const muiTheme = useTheme();
  return (
    <RainbowKitProvider
      chains={chains}
      theme={
        muiTheme.palette.mode === "dark"
          ? darkTheme({
              accentColor: muiTheme.palette.primary.main,
              borderRadius: "medium",
            })
          : lightTheme({
              accentColor: muiTheme.palette.primary.main,
              borderRadius: "medium",
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
};
