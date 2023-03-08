import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { InjectedConnector } from "wagmi/connectors/injected";

export interface BitkeepConnectorOptions {
  chains: Chain[];
  shimDisconnect?: boolean;
}

const bitkeep = ({ chains, shimDisconnect }: BitkeepConnectorOptions): Wallet => {
  const isBitkeepWalletInjected =
    typeof window !== "undefined" && window.ethereum?.isBitKeep === true;

  return {
    id: "bitkeep",
    name: "BitKeep", // Wallet name is from here: https://github.com/wagmi-dev/references/blob/main/packages/connectors/src/utils/getInjectedName.ts#L9
    shortName: "BitKeep",
    iconUrl: "/icons/bitkeep-icon.svg",
    iconBackground: "#FFF",
    hidden: () => !isBitkeepWalletInjected,
    installed: isBitkeepWalletInjected || undefined,
    createConnector: () => ({
      connector: new InjectedConnector({
        chains,
        options: {
          shimDisconnect,
        },
      }),
    }),
  };
};

export default bitkeep;
