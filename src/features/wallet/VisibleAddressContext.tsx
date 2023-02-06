import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useProvider } from "wagmi";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

interface VisibleAddressContextValue {
  visibleAddress: string | undefined;
  isEOA?: boolean;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC<PropsWithChildren> = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { network } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();
  const visibleAddress = impersonatedAddress ?? accountAddress;

  const readOnlyProvider = useProvider({
    chainId: network.id,
  });

  const [isEOA, setIsEOA] = useState<boolean | undefined>();
  useEffect(() => {
    const handleIsEOA = async () => {
      if (accountAddress) {
        try {
          const code = await readOnlyProvider.getCode(accountAddress);
          const isSmartContract = code.length > 2; // The code is "0x" when not a smart contract.
          setIsEOA(!isSmartContract);
        } catch (e) {
          setIsEOA(undefined);
          throw e;
        }
      } else {
        setIsEOA(undefined);
      }
    };
    handleIsEOA();
  }, [visibleAddress, readOnlyProvider]);

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
