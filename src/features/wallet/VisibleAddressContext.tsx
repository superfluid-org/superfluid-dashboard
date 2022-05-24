import { createContext, FC, useContext, useMemo } from "react";
import { useAccount } from "wagmi";
import { useImpersonation } from "../impersonation/ImpersonationContext";

interface VisibleAddressContextValue {
  visibleAddress: string | undefined;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { data: account } = useAccount();

  const contextValue = useMemo(
    () => ({
      visibleAddress: impersonatedAddress ?? account?.address,
    }),
    [impersonatedAddress, account]
  );

  return (
    <VisibleAddressContext.Provider value={contextValue}>
      {children}
    </VisibleAddressContext.Provider>
  );
};

export const useVisibleAddress = () => useContext(VisibleAddressContext);
