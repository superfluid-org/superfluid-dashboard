import { skipToken } from "@reduxjs/toolkit/query";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { useAppKitAccount } from "@reown/appkit/react";
import { Address } from "viem";

interface VisibleAddressContextValue {
  visibleAddress: Address | undefined;
  isEOA: boolean | null;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC<PropsWithChildren> = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { network } = useExpectedNetwork();
  const { address: accountAddress } = useAppKitAccount();
  const visibleAddress = (impersonatedAddress ?? accountAddress) as Address | undefined;

  const { isEOA } = rpcApi.useIsEOAQuery(
    visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
        }
      : skipToken,
    {
      selectFromResult: ({ data }) => ({ isEOA: data ?? null }),
    }
  );

  const contextValue = useMemo(
    () => ({
      visibleAddress,
      isEOA,
    }),
    [visibleAddress, isEOA]
  );

  return (
    <VisibleAddressContext.Provider value={contextValue}>
      {children}
    </VisibleAddressContext.Provider>
  );
};

export const useVisibleAddress = () => useContext(VisibleAddressContext);
