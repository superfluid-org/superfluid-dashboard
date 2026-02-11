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
import { useAccount } from "../../hooks/useAccount";
import { useAppDispatch } from "../redux/store";
import { impersonated } from "./impersonation.slice";
import { useReverseResolveQuery } from "../whois/whoisApi.slice";

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
  const { address: accountAddress } = useAccount();

  const [impersonatedAddress, setImpersonatedAddress] = useState<
    string | undefined
  >();

  // Resolve ENS/handle names from view param via whois API
  const viewParam = isString(router.query.view) ? router.query.view : undefined;
  const isViewParamName = !!viewParam && !isAddress(viewParam);
  const { data: resolvedName } = useReverseResolveQuery(
    isViewParamName ? viewParam : "",
    { skip: !isViewParamName || !router.isReady }
  );

  const removeImpersonatedAddressQueryParam = useCallback(() => {
    const { view: viewAddressQueryParam, ...queryWithoutParam } = router.query;

    router.replace(
      {
        query: queryWithoutParam,
      },
      undefined,
      {
        shallow: true,
      }
    );
  }, [router]);

  const stopImpersonation = useCallback(() => {
    removeImpersonatedAddressQueryParam();
    return setImpersonatedAddress(undefined);
  }, [removeImpersonatedAddressQueryParam]);

  const setImpersonatedAddressQueryParam = useCallback(
    (address: Address) => {
      router.replace(
        {
          query: {
            ...router.query,
            view: address,
          },
        },
        undefined,
        {
          shallow: true,
        }
      );
    },
    [router]
  );

  const impersonate = useCallback(
    (address: string) => {
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
    [dispatch, setImpersonatedAddressQueryParam]
  );

  const contextValue = useMemo(
    () => ({
      impersonatedAddress,
      isImpersonated: !!impersonatedAddress,
      stopImpersonation,
      impersonate,
    }),
    [impersonatedAddress, stopImpersonation, impersonate]
  );

  // Get impersonated address from query string
  useEffect(() => {
    const { view: viewAddressQueryParam } = router.query;
    if (!impersonatedAddress && isString(viewAddressQueryParam)) {
      if (isAddress(viewAddressQueryParam)) {
        setImpersonatedAddress(getAddress(viewAddressQueryParam));
      }
    }
  }, [router.isReady]);

  // Resolve ENS/handle name from view param and impersonate
  useEffect(() => {
    if (!impersonatedAddress && resolvedName?.address) {
      impersonate(resolvedName.address);
    }
  }, [resolvedName, impersonatedAddress, impersonate]);

  // Actively keep impersonated address in query string
  useEffect(() => {
    const { view: viewAddressQueryParam } = router.query;
    if (impersonatedAddress && !viewAddressQueryParam) {
      setImpersonatedAddressQueryParam(impersonatedAddress);
    }
  }, [router.route]);

  // Automatically remove impersonation when connected account matches impersonated address
  useEffect(() => {
    if (impersonatedAddress && accountAddress) {
      // Compare addresses in lowercase to handle different formats (checksum vs lowercase)
      const normalizedImpersonated = impersonatedAddress.toLowerCase();
      const normalizedAccount = accountAddress.toLowerCase();

      if (normalizedImpersonated === normalizedAccount) {
        stopImpersonation();
      }
    }
  }, [impersonatedAddress, accountAddress, stopImpersonation]);

  return (
    <ImpersonationContext.Provider value={contextValue}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => useContext(ImpersonationContext);
