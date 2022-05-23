import { createContext, FC, useMemo } from "react";
import { useAccount } from "wagmi";

interface AccountContextValue {
  walletAddress: string | undefined;
}

const AccountContext = createContext<AccountContextValue>(null!);

const AccountContextProvider: FC = ({ children }) => {
  const { data: account } = useAccount();
  const walletAddress = useMemo(() => account?.address, [account]);

  const contextValue = useMemo(
    () => ({
      walletAddress,
    }),
    [walletAddress]
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};
