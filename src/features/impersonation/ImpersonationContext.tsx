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
  // True while a `?view=` param is still being resolved into an impersonated
  // address (sync for an address, async whois lookup for a name). Consumers
  // that redirect on a missing visible address should wait on this.
  isInitializingFromUrl: boolean;
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

  // Resolve ENS/handle names from view param via whois API. Gate on
  // router.isReady so `?view=` is only considered once the query string is
  // actually populated (it's empty on the first client render).
  const viewParam =
    router.isReady && isString(router.query.view)
      ? router.query.view
      : undefined;
  const isViewParamName = !!viewParam && !isAddress(viewParam);
  const { data: resolvedName, isLoading: isResolvingName } =
    useReverseResolveQuery(isViewParamName ? viewParam : "", {
      skip: !isViewParamName,
    });
  const resolvedAddress = resolvedName?.address;

  // The page can't yet know the visible address while the URL param is still
  // resolving — distinguish "resolving" from "resolved to nothing". For a name,
  // stay "initializing" until the resolved address has actually been applied
  // (whois resolving, OR resolved-but-not-yet-impersonated), so the page never
  // redirects in the gap between resolution and impersonation.
  const isInitializingFromUrl =
    !!viewParam &&
    !impersonatedAddress &&
    (isAddress(viewParam) ||
      (isViewParamName && (isResolvingName || !!resolvedAddress)));

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
      isInitializingFromUrl,
      stopImpersonation,
      impersonate,
    }),
    [impersonatedAddress, isInitializingFromUrl, stopImpersonation, impersonate]
  );

  // Get impersonated address from the (address) view param. Depends only on
  // viewParam so it resolves on client-side navigation and when the param
  // changes to a different address — and crucially does NOT re-run when
  // impersonatedAddress is cleared (which would re-impersonate during
  // stopImpersonation before the URL param is removed). Setting the same value
  // is a no-op render in React.
  useEffect(() => {
    if (viewParam && isAddress(viewParam)) {
      setImpersonatedAddress(getAddress(viewParam));
    }
  }, [viewParam]);

  // Resolve ENS/handle name from view param and impersonate. Depends on the
  // (name) param and the resolved address rather than on impersonatedAddress,
  // so navigating to a new `?view=<name>` switches even when already
  // impersonating — and so it doesn't re-fire on stopImpersonation.
  useEffect(() => {
    if (viewParam && !isAddress(viewParam) && resolvedAddress) {
      impersonate(resolvedAddress);
    }
  }, [viewParam, resolvedAddress, impersonate]);

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
