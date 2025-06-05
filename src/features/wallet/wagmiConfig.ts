import { Connector, createConnector, CreateConnectorFn, createStorage, custom } from "wagmi";
import { defaultAppDescription } from '../../components/SEO/StaticSEO';
import { allNetworks, findNetworkOrThrow } from '../network/networks';
import appConfig from "../../utils/config";
import { safe } from 'wagmi/connectors';
import { getPublicClient, GetPublicClientReturnType } from "wagmi/actions"
import { Address, createWalletClient } from "viem";

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { CustomRpcUrlMap } from '@reown/appkit-common'

const metadata = {
  name: 'Superfluid Dashboard',
  description: defaultAppDescription,
  url: 'https://app.superfluid.org',
  icons: ['https://app.superfluid.org/icons/icon-96x96.png']
}

const projectId = appConfig.walletConnectProjectId;

const customRpcUrls = allNetworks.reduce<CustomRpcUrlMap>((acc, x) => {
  const chainId = x.id;

  // const transport = fallback([
  //   http(x.rpcUrls.superfluid.http[0]), // Prioritize Superfluid API
  //   http(x.rpcUrls.default.http[0]) // Fallback to wagmi-defined default public RPC
  // ], {
  //   rank: false
  // })

  acc[`eip155:${chainId}`] = [{
    url: x.rpcUrls.superfluid.http[0],
  }, {
    url: x.rpcUrls.default.http[0]
  }];

  return acc;
}, {});

// # Test Connector
type EthereumProvider = Parameters<typeof custom>[0];

const needsTestConnector =
  typeof window !== "undefined" &&
  typeof (window as any).mockBridge !== "undefined";

const testConnectors: CreateConnectorFn[] = [];
if (needsTestConnector) {
  const testConnector = createConnector(({
    emitter,
  }) => {
    try {
      const mockBridge = (window as any).mockBridge as EthereumProvider;
      const mockWallet = (window as any).mockWallet as {
        chainId: number;
        getAddress(): Address,
      };

      if (!mockBridge || !mockWallet) {
        console.error("Mock wallet or bridge is undefined", { mockBridge, mockWallet });
        throw new Error("Mock wallet or bridge not properly initialized");
      }

      const chain = findNetworkOrThrow(allNetworks, mockWallet.chainId);
      const walletClient = createWalletClient({
        chain,
        account: mockWallet.getAddress(),
        transport: custom(mockBridge),
      });

      console.log("Mock wallet initialized successfully", {
        chainId: mockWallet.chainId,
        address: mockWallet.getAddress(),
        chain: chain.name
      });

      const connector: Connector = {
        id: "Mock",
        name: "Mock",
        type: "mock",
        emitter,
        uid: "15967486-c8a1-4142-a0c2-53520e654529",
        async connect() {
          try {
            const accounts = await walletClient.getAddresses();
            const chainId = walletClient.chain.id;

            console.log("Mock wallet connected successfully", { accounts, chainId });

            return {
              accounts,
              chainId
            };
          } catch (err) {
            console.error("Error connecting mock wallet:", err);
            throw err;
          }
        },
        async disconnect() {
          // No-op for mock connector
          console.log("Mock wallet disconnected");
        },
        async getAccount() {
          try {
            const address = await walletClient.getAddresses().then(addresses => addresses[0]);
            return address;
          } catch (err) {
            console.error("Error getting mock wallet account:", err);
            throw err;
          }
        },
        async getAccounts() {
          try {
            return [...(await walletClient.getAddresses())] as const;
          } catch (err) {
            console.error("Error getting mock wallet accounts:", err);
            throw err;
          }
        },
        async getChainId() {
          return walletClient.chain.id;
        },
        async getProvider() {
          return mockBridge;
        },
        async getSigner() {
          return walletClient;
        },
        async isAuthorized() {
          return true;
        },
        onAccountsChanged(accounts: string[]) {
          // No-op for test connector
          console.log("Mock wallet accounts changed:", accounts);
        },
        onChainChanged(chainId) {
          console.log("Mock wallet chain changed:", chainId);
          const chain = findNetworkOrThrow(allNetworks, Number(chainId));
          walletClient.switchChain(chain);
        },
        onDisconnect() {
          // No-op for test connector
          console.log("Mock wallet disconnected");
        },
      }
      return connector;
    } catch (error) {
      console.error("Failed to initialize mock connector:", error);

      // Return a minimal connector that reports initialization failure
      const connector: Connector = {
        id: "Mock",
        name: "Mock (Failed)",
        type: "mock",
        emitter,
        uid: "15967486-c8a1-4142-a0c2-53520e654529",
        async connect() {
          console.error("Cannot connect - mock wallet initialization failed");
          throw new Error("Mock wallet initialization failed");
        },
        async disconnect() { },
        async getAccount() { throw new Error("Mock wallet initialization failed"); },
        async getAccounts() { return [] as const; },
        async getChainId() { return 0; },
        async getProvider() { throw new Error("Mock wallet initialization failed"); },
        async getSigner() { throw new Error("Mock wallet initialization failed"); },
        async isAuthorized() { return false; },
        onAccountsChanged() { },
        onChainChanged() { },
        onDisconnect() { },
      }
      return connector;
    }
  })
  testConnectors.push(testConnector);
}
// ---

const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  networks: allNetworks,
  customRpcUrls,
  projectId,
  storage: typeof window !== "undefined" ? createStorage({ storage: window.localStorage }) : undefined,
  connectors: [
    safe({
      allowedDomains: [
        /gnosis-safe.io$/,
        /app.safe.global$/,
        /^https:\/\/(?:[^\/]+\.)?coinshift\.xyz$/,
        /^http:\/\/(localhost|127\.0\.0\.1):(\d+)$/,
      ],
      debug: false,
      shimDisconnect: true
    }),
    ...testConnectors,
  ],
  batch: {
    // NOTE: It is very important to enable the multicall support, otherwise token balance queries will run into rate limits.
    multicall: {
      wait: 100,
    },
  }
})

// @ts-ignore
// wagmiAdapter.wagmiConfig._internal.transports = appTransports;

export const wagmiConfig = wagmiAdapter.wagmiConfig;

const _appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: allNetworks,
  customRpcUrls,
  metadata: metadata,
  projectId,
  features: {
    analytics: false,
    email: false,
    onramp: false,
    swaps: false,
    socials: false
  },
  privacyPolicyUrl: "https://www.iubenda.com/privacy-policy/34415583/legal",
  termsConditionsUrl: "https://www.superfluid.finance/termsofuse",
  featuredWalletIds: [
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709"
  ],
  themeVariables: {
    "--w3m-z-index": 2147483646
  }
})

// const _web3Modal = createWeb3Modal({
//   metadata,
//   wagmiConfig,
//   projectId,
//   enableAnalytics: false,
//   enableOnramp: false,
//   enableSwaps: false,
//   enableEIP6963: enableEIP6963,
//   privacyPolicyUrl: "https://www.iubenda.com/privacy-policy/34415583/legal",
//   termsConditionsUrl: "https://www.superfluid.finance/termsofuse",
//   featuredWalletIds: [
//     "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709"
//   ],
//   themeVariables: {
//     "--w3m-z-index": 2147483646
//   }
// })

type PublicClient = NonNullable<GetPublicClientReturnType<typeof wagmiConfig, number>>;

// Note: We need to create the public clients and re-use them to have the automatic multicall batching work.
export const resolvedWagmiClients = allNetworks.reduce((publicClients, chain) => {
  publicClients[chain.id] = () => {
    const publicClient = getPublicClient(wagmiConfig, {
      chainId: chain.id,
    });
    if (!publicClient) {
      throw new Error("PublicClient not found. This should never happen!");
    }
    return publicClient;
  };
  return publicClients;
}, {} as Record<number, () => PublicClient>);
