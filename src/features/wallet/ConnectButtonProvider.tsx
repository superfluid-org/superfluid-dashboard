import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "@/hooks/useAccount"
import { useConnect } from "wagmi";
import AccountModal from "./AccountModal";
import { useAppKit, useAppKitState, useAppKitTheme } from '@reown/appkit/react'
import { useTheme } from "@mui/material";
import { useSafeAppAutoConnect } from "./useSafeAppAutoConnect";
import appConfig from "../../utils/config";
import { SUPERFLUID_WALLET_CONNECTOR_ID } from "./superfluidWallet/connector";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { setProviderChainId } from "./superfluidWallet/eip1193-provider";

interface ConnectButtonContextValue {
  openAccountModal: () => void;
  closeAccountModal: () => void;
  openConnectModal: () => void;
  connectSuperfluidWallet: () => void;
  isSuperfluidWalletConnecting: boolean;
  accountModalOpen: boolean;
  connectModalOpen: boolean;
}

const ConnectButtonContext = createContext<ConnectButtonContextValue>(null!);

const ConnectButtonProvider: FC<PropsWithChildren> = ({ children }) => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { address, connector } = useAccount();
  const { open } = useAppKit()
  const { open: isOpen } = useAppKitState();
  const { setThemeMode, setThemeVariables } = useAppKitTheme();
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { connect, connectors, isPending, error } = useConnect();
  useSafeAppAutoConnect();

  useEffect(() => {
    if (theme.palette.mode === "dark") {
      setThemeMode("dark");
    } else {
      setThemeMode("light");
    }
  }, [theme.palette.mode]); // Don't put `setThemeMode` here

  useEffect(() => {
    setThemeVariables({
      "--w3m-accent": theme.palette.primary.main
    });
  }, [theme.palette.primary.main]); // Don't put `setThemeVariables` here

  useEffect(() => {
    if (error) {
      console.error("Superfluid Wallet connect error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (
      address &&
      connector?.id === SUPERFLUID_WALLET_CONNECTOR_ID
    ) {
      setProviderChainId(network.id);
    }
  }, [address, connector?.id, network.id]);

  const openAccountModal = useCallback(
    () => setAccountModalOpen(!!address), // Do nothing when no address.
    [setAccountModalOpen, address]
  );

  const closeAccountModal = useCallback(
    () => setAccountModalOpen(false),
    [setAccountModalOpen]
  );

  const openConnectModal = useCallback(() => open({
    view: "Connect",
  }), [open]);

  const connectSuperfluidWallet = useCallback(() => {
    const connector = connectors.find((c) => c.id === SUPERFLUID_WALLET_CONNECTOR_ID);
    if (!connector) {
      console.error("Superfluid Wallet connector is not registered.");
      return;
    }

    setProviderChainId(network.id);
    connect({ connector, chainId: network.id });
  }, [connect, connectors, network.id]);

  return (
    <ConnectButtonContext.Provider
      value={{
        accountModalOpen,
        openAccountModal,
        closeAccountModal,
        openConnectModal,
        connectSuperfluidWallet,
        isSuperfluidWalletConnecting: isPending,
        connectModalOpen: isOpen,
      }}
    >
      {children}
      <AccountModal open={accountModalOpen} onClose={closeAccountModal} />
    </ConnectButtonContext.Provider>
  );
};

export const useConnectButton = () => useContext(ConnectButtonContext);

export default ConnectButtonProvider;

export const isSuperfluidWalletEnabled = appConfig.superfluidWallet.enabled;
