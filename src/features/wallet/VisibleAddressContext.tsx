import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useAccount } from "wagmi";
import { useImpersonation } from "../impersonation/ImpersonationContext";

interface VisibleAddressContextValue {
  visibleAddress: string | undefined;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC<PropsWithChildren> = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { address: accountAddress } = useAccount();

  const contextValue = useMemo(
    () => ({
      visibleAddress: impersonatedAddress ?? accountAddress,
    }),
    [impersonatedAddress, accountAddress]
  );

  return (
    <VisibleAddressContext.Provider value={contextValue}>
      {children}
    </VisibleAddressContext.Provider>
  );
};

export const useVisibleAddress = () => useContext(VisibleAddressContext);
