import { getAddress, isAddress } from "ethers/lib/utils";
import { isString } from "lodash";
import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";

interface ImpersonationContextValue {
  isImpersonated: boolean;
  impersonatedAddress: string | undefined;
  stopImpersonation: () => void;
  impersonate: (address: string) => void;
}

const ImpersonationContext = createContext<ImpersonationContextValue>(null!);

export const ImpersonationProvider: FC = ({ children }) => {
  const [impersonatedAddress, setImpersonatedAddress] = useState<
    string | undefined
  >();

  const contextValue = useMemo(
    () => ({
      impersonatedAddress,
      isImpersonated: !!impersonatedAddress,
      stopImpersonation: () => setImpersonatedAddress(undefined),
      impersonate: (address: string) => setImpersonatedAddress(getAddress(address))
    }),
    [impersonatedAddress]
  );

  const router = useRouter();
  const { view: viewAddressQueryParam } = router.query;
  useEffect(() => {
    if (isString(viewAddressQueryParam)) {
      if (isAddress(viewAddressQueryParam)) {
        setImpersonatedAddress(getAddress(viewAddressQueryParam))
      }
      const { view, ...viewAddressQueryParamRemoved } = router.query;
      router.replace({ query: viewAddressQueryParamRemoved });
    }
  }, [viewAddressQueryParam]);

  return (
    <ImpersonationContext.Provider value={contextValue}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => useContext(ImpersonationContext);