import { FC, PropsWithChildren, useMemo } from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { createConfig as createWagmiConfig, WagmiConfig, http, WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@mui/material";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { getAppWallets } from "./getAppWallets";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chain, createPublicClient } from "viem";

const queryClient = new QueryClient();

export const wagmiConfig =
  createWagmiConfig({
    chains: [ allNetworks[0], ...allNetworks.splice(0, 1)], // TODO: wagmi migration
    transports: Object.fromEntries(allNetworks.map(x => ([x.id, http(findNetworkOrThrow(allNetworks, x.id).rpcUrls.superfluid.http[0])]))),
    batch: {
      // NOTE: It is very important to enable the multicall support, otherwise token balance queries will run into rate limits.
      multicall: {
        wait: 100,
      },
    }
  }
);

const wagmiChains = wagmiConfig.chains;

// TODO: clean-up

// Note: We need to create the public clients and re-use them to have the automatic multicall batching work.
export const resolvedPublicClients = wagmiChains.reduce((acc, current) => {
  acc[current.id] = createPublicClient({ chain: current, transport: http(findNetworkOrThrow(allNetworks, current.id).rpcUrls.superfluid.http[0]),     batch: {
    // NOTE: It is very important to enable the multicall support, otherwise token balance queries will run into rate limits.
    multicall: {
      wait: 100,
    },
  } });
  return acc;
}, {} as Record<number, ReturnType<typeof createPublicClient>>);

const { connectors } = getAppWallets({
  appName: "Superfluid Dashboard",
  chains: (wagmiChains as unknown) as any[], // TODO: wagmi migration
});

// export const wagmiConfig = createWagmiConfig({
//   autoConnect: false, // Disable because of special Gnosis Safe handling in useAutoConnect.
//   connectors,
//   publicClient: (config) =>
//     (config.chainId ? resolvedPublicClients[config.chainId] : null) ??
//     createPublicClient(config),
// });

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
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

  const selectableChains = useMemo(() => [
    ...wagmiChains.filter((x) => x.id === network.id), // Filter the expected network to be the first chain. RainbowKit emphasizes the first chain...
    ...wagmiChains.filter((x) => x.id !== network.id),
  ], [wagmiChains, network.id]);

  const initialChainId = isAutoSwitchStopped ? network.id : undefined; // RainbowKit either uses the wallet's chain if it's supported by our app OR switches to the first support chain.

  return (
    <RainbowKitProvider
      // chains={selectableChains}
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
