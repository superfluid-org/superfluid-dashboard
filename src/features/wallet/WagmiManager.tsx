import { createContext, FC } from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { createClient as createWagmiClient, WagmiConfig } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@mui/material";
import { networks, networksByChainId } from "../network/networks";
import { getAppWallets } from "./getAppWallets";
import { configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";

const { chains, provider } = configureChains(networks, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: networksByChainId.get(chain.id)!.rpcUrls.superfluid,
    }),
  }),
]);

const { connectors } = getAppWallets({
  appName: "Superfluid Dashboard",
  chains: chains,
});

export const wagmiClient = createWagmiClient({
  autoConnect: false, // Disable because of special Gnosis Safe handling in useAutoConnect.
  connectors,
  provider,
});

const WagmiManager: FC = ({ children }) => {
  return <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>;
};

export default WagmiManager;

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you accept our{" "}
    <Link href="https://www.superfluid.finance/termsofuse/">Terms of Use</Link>
    {" and "}
    <Link href="https://www.iubenda.com/privacy-policy/34415583/legal">
      Privacy Policy
    </Link>
  </Text>
);

export const RainbowKitManager: FC = ({ children }) => {
  const muiTheme = useTheme();
  const { network } = useExpectedNetwork();
  return (
    <RainbowKitProvider
      chains={chains}
      initialChain={network.id}
      avatar={AddressAvatar}
      appInfo={{ disclaimer: Disclaimer }}
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
