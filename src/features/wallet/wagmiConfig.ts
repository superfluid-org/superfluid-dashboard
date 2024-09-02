import { Connector, createConnector, CreateConnectorFn, custom, fallback, http } from "wagmi";
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { defaultAppDescription } from '../../components/SEO/StaticSEO';
import { allNetworks, findNetworkOrThrow } from '../network/networks';
import appConfig from "../../utils/config";
import { safe } from 'wagmi/connectors';
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { getPublicClient, GetPublicClientReturnType } from "wagmi/actions"
import { Address, createWalletClient } from "viem";

type Web3ModalMetadata = Parameters<typeof defaultWagmiConfig>[0]["metadata"];

const metadata: Web3ModalMetadata = {
  name: 'Superfluid Dashboard',
  description: defaultAppDescription,
  url: 'https://app.superfluid.finance',
  icons: ['https://app.superfluid.finance/icons/icon-96x96.png']
}

const projectId = appConfig.walletConnectProjectId;

const appTransports = Object.fromEntries(
  allNetworks.map((x) => {
    const chainId = x.id;

    const transport = fallback([
      http(x.rpcUrls.superfluid.http[0]), // Prioritize Superfluid API
      http(x.rpcUrls.default.http[0]) // Fallback to wagmi-defined default public RPC
    ])

    return [
      chainId,
      transport,
    ];
  })
);

const enableEIP6963 = true;

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
    const mockBridge = (window as any).mockBridge as EthereumProvider;
    const mockWallet = (window as any).mockWallet as {
      chainId: number;
      getAddress(): Address,
    };
    const chain = findNetworkOrThrow(allNetworks, mockWallet.chainId);
    const walletClient = createWalletClient({
      chain,
      account: mockWallet.getAddress(),
      transport: custom(mockBridge),
    })

    // const wagmiMock = mock({
    //   accounts: [mockWallet.getAddress()],
    // })({
    //   chains,
    //   emitter
    // });

    const connector: Connector = {
      id: "Mock",
      name: "Mock",
      type: "mock",
      emitter,
      uid: "15967486-c8a1-4142-a0c2-53520e654529",
      async connect() {
        return {
          accounts: await walletClient.getAddresses(),
          chainId: walletClient.chain.id
        };
      },
      async disconnect() {
        // No-op for mock connector
      },
      async getAccount() {
        return walletClient.getAddresses().then(addresses => addresses[0]);
      },
      async getAccounts() {
        return [...(await walletClient.getAddresses())] as const;
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
      },
      onChainChanged(chainId) {
        const chain = findNetworkOrThrow(allNetworks, Number(chainId));
        walletClient.switchChain(chain);
      },
      onDisconnect() {
        // No-op for test connector
      },
    }
    return connector
  })
  testConnectors.push(testConnector);
}
// ---

export const wagmiConfig = defaultWagmiConfig({
  ssr: false,
  chains: allNetworks,
  projectId,
  metadata,
  enableCoinbase: true,
  enableInjected: true,
  enableWalletConnect: true,
  enableEIP6963: enableEIP6963,
  auth: {
    email: false,
  },
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
  transports: appTransports,
  batch: {
    // NOTE: It is very important to enable the multicall support, otherwise token balance queries will run into rate limits.
    multicall: {
      wait: 100,
    },
  }
});

const _web3Modal = createWeb3Modal({
  metadata,
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  enableSwaps: false,
  enableEIP6963: enableEIP6963,
  privacyPolicyUrl: "https://www.iubenda.com/privacy-policy/34415583/legal",
  termsConditionsUrl: "https://www.superfluid.finance/termsofuse",
  featuredWalletIds: [
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709"
  ],
  themeVariables: {
    "--w3m-z-index": 2147483646
  }
})

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
