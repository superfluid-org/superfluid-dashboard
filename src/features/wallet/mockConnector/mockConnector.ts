import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { MockConnector } from "wagmi/connectors/mock";

export interface MockConnectorOptions {
  chains: Chain[];
}

const mockConnector = ({ chains }: MockConnectorOptions): Wallet => ({
  id: "mock",
  name: "Mock",
  shortName: "Mock",
  iconUrl: "/icons/icon-96x96.png",
  iconBackground: "#000000",
  createConnector: () => ({
    connector: new MockConnector({
      chains,
      options: {
        signer: (window as any).mockSigner,
      },
    }),
  }),
});

export default mockConnector;
