import { FC } from "react";
import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { createWagmiClient, WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@mui/material";
import { networks, networksByChainId } from "../network/networks";

const { chains, provider } = configureChains(networks, [
  apiProvider.jsonRpc((chain) => {
    return {
      rpcUrl: networksByChainId.get(chain.id)!.rpcUrls.superfluid,
    };
  }),
]);

const { connectors } = getDefaultWallets({
  appName: "Superfluid Dashboard",
  chains: chains,
});

export const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors,
  provider,
});

const WagmiManager: FC = ({ children }) => {
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
