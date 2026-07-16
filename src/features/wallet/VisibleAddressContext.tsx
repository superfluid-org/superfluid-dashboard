import { skipToken } from "@reduxjs/toolkit/query";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { Address } from "viem";
import { useAccount } from "@/hooks/useAccount";

interface VisibleAddressContextValue {
  visibleAddress: Address | undefined;
  isEOA: boolean | null;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC<PropsWithChildren> = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { network } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();
  const visibleAddress = (impersonatedAddress ?? accountAddress) as Address | undefined;

  const { isEOA, isError, isFetching, refetch } = rpcApi.useIsEOAQuery(
    visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
        }
      : skipToken,
    {
      selectFromResult: ({ data, isError, isFetching }) => ({
        isEOA: data ?? null,
        isError,
        isFetching,
      }),
    }
  );

  // This provider lives for the whole session, so a rejected classification would
  // otherwise never re-run (nothing re-subscribes) and `isEOA` would stay null —
  // hiding Clear Macro eligibility until a full reload. Keep retrying on a slow
  // timer while errored; `isFetching` in the deps re-arms the timer after each
  // failed attempt.
  useEffect(() => {
    if (!isError || isFetching) return;
    const timer = setTimeout(() => void refetch(), 15_000);
    return () => clearTimeout(timer);
  }, [isError, isFetching, refetch]);

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
