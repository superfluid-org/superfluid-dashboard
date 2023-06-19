import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { MockConnector } from "wagmi/connectors/mock";
import { createWalletClient, custom } from "viem";
import { providers } from "ethers";
import { Eip1193Bridge } from "../../../EIP1193Bridge";

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
    const mockSigner = (window as any).mockSigner as providers.JsonRpcSigner;
    const mockProvider = mockSigner.provider as providers.Web3Provider;

    const eip1193Bridge = new Eip1193Bridge(mockSigner, mockProvider);
    return {
      connector: new MockConnector({
        chains,
        options: {
          walletClient: createWalletClient({
            account: mockSigner._address as `0x${string}`,
            transport: custom(eip1193Bridge),
          }),
        },
      }),
    };
  },
});

export default mockConnector;
