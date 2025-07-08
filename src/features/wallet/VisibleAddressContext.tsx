import { skipToken } from "@reduxjs/toolkit/query";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { Address } from "viem";
import { useAccount } from "@/hooks/useAccount";
import { useConnectorClient } from "wagmi";


interface VisibleAddressContextValue {
  visibleAddress: Address | undefined;
  isEOA: boolean | null;
}

const VisibleAddressContext = createContext<VisibleAddressContextValue>(null!);

export const VisibleAddressProvider: FC<PropsWithChildren> = ({ children }) => {
  const { impersonatedAddress } = useImpersonation();
  const { network } = useExpectedNetwork();
  const { address: accountAddress, connector } = useAccount();
  const { data: connectorClient } = useConnectorClient();
  const visibleAddress = (impersonatedAddress ?? accountAddress) as Address | undefined;

  // Log provider details when using Farcaster connector
  useEffect(() => {
    const logFarcasterProvider = async () => {
      if (connector?.id === 'farcaster') {
        console.log('🎯 Farcaster Connector Detected!');
        console.log('Connector Details:', {
          id: connector.id,
          name: connector.name,
          type: connector.type,
          uid: connector.uid
        });

        try {
          const provider = await connector.getProvider() as any;
          console.log('📱 Farcaster Provider:', provider);
          
          // Log all available methods/properties
          console.log('🔧 Provider Methods & Properties:');
          const allProps = Object.getOwnPropertyNames(provider);
          const methods = allProps.filter(prop => 
            typeof provider[prop] === 'function'
          );
          const properties = allProps.filter(prop => 
            typeof provider[prop] !== 'function'
          );
          
          console.log('Methods:', methods);
          console.log('Properties:', properties);
          
          // Log prototype methods too
          const proto = Object.getPrototypeOf(provider);
          const protoMethods = Object.getOwnPropertyNames(proto)
            .filter(prop => typeof proto[prop] === 'function');
          console.log('Prototype Methods:', protoMethods);
          
          // Try to access common provider methods
          if (provider.request) {
            console.log('✅ provider.request available');
          }
          if (provider.farcaster) {
            console.log('✅ provider.farcaster available:', provider.farcaster);
          }
          if (provider.send) {
            console.log('✅ provider.send available');
          }
          if (provider.sendAsync) {
            console.log('✅ provider.sendAsync available');
          }
          
        } catch (error) {
          console.error('❌ Error accessing Farcaster provider:', error);
        }
      }
    };

    logFarcasterProvider();
  }, [connector, connectorClient]);

  const { isEOA: rawIsEOA } = rpcApi.useIsEOAQuery(
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

  // Override isEOA for Farcaster connector - it should always be false (AA wallet)
  const isEOA = useMemo(() => {
    if (connector?.id === 'farcaster') {
      console.log('🔄 Overriding isEOA for Farcaster connector: false (Account Abstraction)');
      return false;
    }
    return rawIsEOA;
  }, [connector?.id, rawIsEOA]);

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
