import {
  createContext,
  FC,
  useContext,
  useMemo,
} from "react";
import {
  useAccount,
  useNetwork,
} from "wagmi";

interface AppWalletContextValue {
  walletChainId: number | undefined;
  walletAddress: string | undefined;
}

const AppWalletContext = createContext<AppWalletContextValue>(null!);

export default AppWalletContext;

export const AppWalletProvider: FC = ({ children }) => {
  const { data: wallet } = useAccount();
  const walletAddress = wallet?.address;

  const { activeChain } = useNetwork();
  const walletChainId = activeChain?.id;

  const contextValue = useMemo(
    () => ({
      walletChainId,
      walletAddress,
    }),
    [walletAddress, walletChainId]
  );

  return (
    <AppWalletContext.Provider value={contextValue}>
      {children}
    </AppWalletContext.Provider>
  );
};

export const useAppWallet = () => useContext(AppWalletContext);
