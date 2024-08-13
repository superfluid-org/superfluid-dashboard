import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";
import AccountModal from "./AccountModal";
import { useWeb3Modal, useWeb3ModalState, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useTheme } from "@mui/material";
import { useSafeAppAutoConnect } from "./useSafeAppAutoConnect";

interface ConnectButtonContextValue {
  openAccountModal: () => void;
  closeAccountModal: () => void;
  openConnectModal: () => void;
  accountModalOpen: boolean;
  connectModalOpen: boolean;
}

const ConnectButtonContext = createContext<ConnectButtonContextValue>(null!);

const ConnectButtonProvider: FC<PropsWithChildren> = ({ children }) => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { address } = useAccount();
  const { open } = useWeb3Modal()
  const { open: isOpen } = useWeb3ModalState();
  const { setThemeMode, setThemeVariables } = useWeb3ModalTheme();
  const theme = useTheme();
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

  return (
    <ConnectButtonContext.Provider
      value={{
        accountModalOpen,
        openAccountModal,
        closeAccountModal,
        openConnectModal,
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
