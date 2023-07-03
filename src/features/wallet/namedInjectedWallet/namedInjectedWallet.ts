import { InjectedConnector } from "wagmi/connectors/injected";
import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";

export interface InjectedWalletOptions {
  chains: Chain[];
  shimDisconnect?: boolean;
}

export const namedInjectedWallet = ({
  chains,
  shimDisconnect,
}: InjectedWalletOptions): Wallet => {
  const injectedConnector = new InjectedConnector({
    chains,
    options: { shimDisconnect },
  });
  const defaultInjectedWallet = injectedWallet({ chains });

  return {
    id: defaultInjectedWallet.id,
    name: injectedConnector.name,
    iconUrl: defaultInjectedWallet.iconUrl,
    iconBackground: defaultInjectedWallet.iconBackground,
    hidden: ({ wallets }) =>
      wallets.some(
        ({ installed, connector }) =>
          installed &&
          (connector instanceof InjectedConnector ||
            connector.name.toLowerCase() ===
              injectedConnector.name.toLowerCase())
      ),
    createConnector: () => ({
      connector: injectedConnector
    }),
  };
};
