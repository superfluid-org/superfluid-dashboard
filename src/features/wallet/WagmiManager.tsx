import { FC, PropsWithChildren } from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { createClient as createWagmiClient, WagmiConfig } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@mui/material";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { getAppWallets } from "./getAppWallets";
import { configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import AddressAvatar from "../../components/Avatar/AddressAvatar";

export const { chains: wagmiChains, provider: wagmiRpcProvider } =
  configureChains(allNetworks, [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: findNetworkOrThrow(allNetworks, chain.id).rpcUrls.superfluid,
      }),
    }),
  ]);

const { connectors } = getAppWallets({
  appName: "Superfluid Dashboard",
  chains: wagmiChains,
});

export const wagmiClient = createWagmiClient({
  autoConnect: false, // Disable because of special Gnosis Safe handling in useAutoConnect.
  connectors,
  provider: wagmiRpcProvider,
});

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
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

export const RainbowKitManager: FC<PropsWithChildren> = ({ children }) => {
  const muiTheme = useTheme();
  const { network, isAutoSwitchStopped } = useExpectedNetwork();

  const selectableChains = [
    ...wagmiChains.filter((x) => x.id === network.id), // Filter the expected network to be the first chain. RainbowKit emphasizes the first chain...
    ...wagmiChains.filter((x) => x.id !== network.id),
  ];
  const initialChainId = isAutoSwitchStopped ? network.id : undefined; // RainbowKit either uses the wallet's chain if it's supported by our app OR switches to the first support chain.

  return (
    <RainbowKitProvider
      chains={selectableChains}
      initialChain={initialChainId}
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
