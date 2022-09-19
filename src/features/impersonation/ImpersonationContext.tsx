import { Address } from "@superfluid-finance/sdk-core";
import { isString } from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAddress, isAddress } from "../../utils/memoizedEthersUtils";
import { useAppDispatch } from "../redux/store";
import { impersonated } from "./impersonation.slice";

interface ImpersonationContextValue {
  isImpersonated: boolean;
  impersonatedAddress: string | undefined;
  stopImpersonation: () => void;
  impersonate: (address: string) => void;
}

const ImpersonationContext = createContext<ImpersonationContextValue>(null!);

export const ImpersonationProvider: FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [impersonatedAddress, setImpersonatedAddress] = useState<
    string | undefined
  >();

  const contextValue = useMemo(
    () => ({
      impersonatedAddress,
      isImpersonated: !!impersonatedAddress,
      stopImpersonation: () => {
        removeImpersonatedAddressQueryParam();
        return setImpersonatedAddress(undefined);
      },
      impersonate: (address: string) => {
        const checksumAddress = getAddress(address);
        dispatch(
          impersonated({
            address: checksumAddress,
            timestampMs: Date.now(),
          })
        );
        setImpersonatedAddressQueryParam(checksumAddress);
        return setImpersonatedAddress(checksumAddress);
      },
    }),
    [impersonatedAddress]
  );

  const setImpersonatedAddressQueryParam = useCallback(
    (address: Address) => {
      router.replace({
        query: {
          ...router.query,
          view: address,
        },
      });
    },
    [router]
  );

  const removeImpersonatedAddressQueryParam = () => {
    const { view: viewAddressQueryParam, ...queryWithoutParam } = router.query;
    router.replace({
      query: queryWithoutParam,
    });
  };

  // Get impersonated address from query string
  useEffect(() => {
    const { view: viewAddressQueryParam } = router.query;
    if (!impersonatedAddress && isString(viewAddressQueryParam)) {
      if (isAddress(viewAddressQueryParam)) {
        setImpersonatedAddress(getAddress(viewAddressQueryParam));
      }
    }
  }, [router.isReady]);

  // Actively keep impersonated address in query string
  useEffect(() => {
    const { view: viewAddressQueryParam } = router.query;
    if (impersonatedAddress && !viewAddressQueryParam) {
      setImpersonatedAddressQueryParam(impersonatedAddress);
    }
  }, [router.route]);

  return (
    <ImpersonationContext.Provider value={contextValue}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => useContext(ImpersonationContext);
