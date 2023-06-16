import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { MockConnector } from "wagmi/connectors/mock";
import { createWalletClient, custom } from "viem";

export interface MockConnectorOptions {
  chains: Chain[];
}

const mockConnector = ({ chains }: MockConnectorOptions): Wallet => ({
  id: "mock",
  name: "Mock",
  shortName: "Mock",
  iconUrl: "/icons/icon-96x96.png",
  iconBackground: "#000000",
  createConnector: () => {
    const mockSigner = (window as any).mockSigner;
    return {
      connector: new MockConnector({
        chains,
        options: {
          walletClient: createWalletClient({
            transport: custom(mockSigner.provider.provider as any),
          }),
        },
      }),
    };
  },
});

export default mockConnector;
