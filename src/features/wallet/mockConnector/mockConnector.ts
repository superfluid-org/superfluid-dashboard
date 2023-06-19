import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { MockConnector } from "wagmi/connectors/mock";
import { createWalletClient, custom } from "viem";
import { Signer } from "ethers";
import { Eip1193Bridge } from "@ethersproject/experimental";

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
    const mockSigner = (window as any).mockSigner as Signer;
    const eip1193Bridge = new Eip1193Bridge(mockSigner, mockSigner.provider);
    return {
      connector: new MockConnector({
        chains,
        options: {
          walletClient: createWalletClient({
            transport: custom(eip1193Bridge),
          }),
        },
      }),
    };
  },
});

export default mockConnector;
