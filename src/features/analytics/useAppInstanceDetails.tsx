import { useMemo } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { customAlphabet } from "nanoid";

export const supportId = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")(
  8
); // Alphabet: "nolookalikesSafe"

export type AppInstanceDetails = {
  appInstance: {
    supportId: string;
    expectedNetwork: {
      id: number;
      name: string;
      slug: string;
      isTestnet: boolean;
    };
    wallet: {
      isConnected: boolean;
      address?: string;
      connector?: string;
      connectorId?: string;
      network?: string;
      networkId?: number;
    };
  };
};

export type WalletDetails = AppInstanceDetails["appInstance"]["wallet"];

export const useAppInstanceDetails = () => {
  const { chain: activeChain } = useNetwork();
  const { network: expectedNetwork } = useExpectedNetwork();
  const { transactionDrawerOpen } = useLayoutContext();
  const { isAutoConnectedRef } = useAutoConnect();
  const {
    connector: activeConnector,
    isConnected,
    address: activeAccountAddress,
  } = useAccount();

  const deps = [
    expectedNetwork,
    isConnected,
    activeConnector,
    activeChain,
    activeAccountAddress,
    isAutoConnectedRef,
    transactionDrawerOpen,
  ];

  return useMemo<AppInstanceDetails>(
    () => ({
      appInstance: {
        supportId: supportId,
        expectedNetwork: {
          id: expectedNetwork.id,
          name: expectedNetwork.name,
          slug: expectedNetwork.slugName,
          isTestnet: !!expectedNetwork.testnet,
        },
        wallet: {
          isConnected,
          ...(isConnected && activeConnector
            ? {
                isReconnected: isAutoConnectedRef.current,
                address: activeAccountAddress,
                connector: activeConnector.name,
                connectorId: activeConnector.id,
                ...(activeChain
                  ? {
                      network: activeChain.name,
                      networkId: activeChain.id,
                    }
                  : {}),
              }
            : {}),
        },
      },
    }),
    deps
  );
};
