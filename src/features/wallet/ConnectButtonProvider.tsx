import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createContext, FC, PropsWithChildren, useContext } from "react";

// TODO: PR to rainbowkit to expose this interface. It is inpossible to get it out atm.
interface ConnectButtonContextValue {
  account?: {
    address: string;
    balanceDecimals?: number;
    balanceFormatted?: string;
    balanceSymbol?: string;
    displayBalance?: string;
    displayName: string;
    ensAvatar?: string;
    ensName?: string;
    hasPendingTransactions: boolean;
  };
  chain?: {
    hasIcon: boolean;
    iconUrl?: string;
    iconBackground?: string;
    id: number;
    name?: string;
    unsupported?: boolean;
  };
  mounted: boolean;
  openAccountModal: () => void;
  openChainModal: () => void;
  openConnectModal: () => void;
  accountModalOpen: boolean;
  chainModalOpen: boolean;
  connectModalOpen: boolean;
}

const ConnectButtonContext = createContext<ConnectButtonContextValue>(null!);

const ConnectButtonProvider: FC<PropsWithChildren> = ({ children }) => (
  <ConnectButton.Custom>
    {(connectButtonContext) => (
      <ConnectButtonContext.Provider value={connectButtonContext}>
        {children}
      </ConnectButtonContext.Provider>
    )}
  </ConnectButton.Custom>
);

export const useConnectButton = () => useContext(ConnectButtonContext);

export default ConnectButtonProvider;
