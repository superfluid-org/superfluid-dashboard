import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import AccountModal from "./AccountModal";

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
  closeAccountModal: () => void;
  openChainModal: () => void;
  openConnectModal: () => void;
  accountModalOpen: boolean;
  chainModalOpen: boolean;
  connectModalOpen: boolean;
}

const ConnectButtonContext = createContext<ConnectButtonContextValue>(null!);

const ConnectButtonProvider: FC<PropsWithChildren> = ({ children }) => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { address } = useAccount();

  const openAccountModal = useCallback(
    () => address && setAccountModalOpen(true),
    [setAccountModalOpen, address]
  );

  const closeAccountModal = useCallback(
    () => setAccountModalOpen(false),
    [setAccountModalOpen]
  );

  const overriddenContext = useMemo(
    () => ({ accountModalOpen, openAccountModal, closeAccountModal }),
    [accountModalOpen, openAccountModal, closeAccountModal]
  );

  return (
    <ConnectButton.Custom>
      {(connectButtonContext) => (
        <ConnectButtonContext.Provider
          value={{
            ...connectButtonContext,
            ...overriddenContext,
          }}
        >
          {children}
          <AccountModal open={accountModalOpen} onClose={closeAccountModal} />
        </ConnectButtonContext.Provider>
      )}
    </ConnectButton.Custom>
  );
};

export const useConnectButton = () => useContext(ConnectButtonContext);

export default ConnectButtonProvider;
