import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { InjectedConnector } from "wagmi/connectors/injected";

export interface BitkeepConnectorOptions {
  chains: Chain[];
  shimDisconnect?: boolean;
}

const bitkeep = ({
  chains,
  shimDisconnect,
}: BitkeepConnectorOptions): Wallet => {
  const isBitkeepWalletInstalled =
    typeof window !== "undefined" && !!window.bitkeep && !!window.bitkeep?.ethereum;

  return {
    id: "bitkeep",
    name: "BitKeep", // Wallet name is from here: https://github.com/wagmi-dev/references/blob/main/packages/connectors/src/utils/getInjectedName.ts#L9
    shortName: "BitKeep",
    iconUrl: "/icons/bitkeep-icon.svg",
    iconBackground: "#7524f9",
    installed: isBitkeepWalletInstalled || undefined,
    downloadUrls: {
      android: "https://bitkeep.com/en/download?type=0",
      ios: "https://bitkeep.com/en/download?type=1",
      browserExtension: "https://bitkeep.com/en/download?type=2"
    },
    createConnector: () => ({
      connector: new InjectedConnector({
        chains,
        options: {
          shimDisconnect,
          name: "BitKeep",
          getProvider: () => typeof window !== "undefined" ? window.bitkeep?.ethereum : undefined,
        },
      }),
    }),
  };
};

export default bitkeep;
