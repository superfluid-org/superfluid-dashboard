import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { MockConnector } from "wagmi/connectors/mock";
import { Address, createWalletClient, custom } from "viem";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";

export interface MockConnectorOptions {
  chains: Chain[];
}

type EthereumProvider = Parameters<typeof custom>[0];

const mockConnector = ({ chains }: MockConnectorOptions): Wallet => ({
  id: "mock",
  name: "Mock",
  shortName: "Mock",
  iconUrl: "/icons/icon-96x96.png",
  iconBackground: "#000000",
  createConnector: () => {
    const mockBridge = (window as any).mockBridge as EthereumProvider;
    const mockWallet = (window as any).mockWallet as {
      chainId: number;
      getAddress(): Address,
    };
    const chain = findNetworkOrThrow(allNetworks, mockWallet.chainId);

    return {
      connector: new MockConnector({
        chains,
        options: {
          walletClient: createWalletClient({
            chain,
            account: mockWallet.getAddress(),
            transport: custom(mockBridge),
          }),
        },
      }),
    };
  },
});

export default mockConnector;
