import { AnalyticsBrowser } from "@segment/analytics-next";
import {
  getSerializeQueryArgs,
  TransactionInfo,
} from "@superfluid-finance/sdk-redux";
import { createContext, useCallback, useContext, useMemo } from "react";
import config from "../../utils/config";
import { serialize, useAccount, useNetwork } from "wagmi";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { customAlphabet } from "nanoid";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { IsCypress } from "../../utils/SSRUtils";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

type AnalyticsContextValue = {
  analyticsBrowser: AnalyticsBrowser;
  instanceDetails: AppInstanceDetails;
};

const AnalyticsContext = createContext<AnalyticsContextValue>(undefined!);

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
      account?: string;
      connector?: string;
      connectorId?: string;
      network?: string;
      networkId?: number;
    };
    layout: {
      isTransactionDrawerOpen: boolean;
    };
  };
};

export const supportId = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")(
  8
); // Alphabet: "nolookalikesSafe"

const useAppInstanceDetails = () => {
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
                account: activeAccountAddress,
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
        layout: {
          isTransactionDrawerOpen: transactionDrawerOpen,
        },
      },
    }),
    deps
  );
};

const useAnalyticsBrowser = () =>
  useMemo(() => {
    const writeKey = config.segmentWriteKey;
    if (!IsCypress && writeKey) {
      return AnalyticsBrowser.load(
        { writeKey },
        {
          initialPageview: true,
        }
      );
    } else {
      console.warn("Segment not initialized. No-op instance provided instead.");
      return AnalyticsBrowser.load({ writeKey: "NOOP" });
    }
  }, []);

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const analyticsBrowser = useAnalyticsBrowser();
  const instanceDetails = useAppInstanceDetails();

  const contextValue = useMemo(
    () => ({
      analyticsBrowser,
      instanceDetails,
    }),
    [analyticsBrowser, instanceDetails]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const { analyticsBrowser, instanceDetails } = useContext(AnalyticsContext);
  if (!analyticsBrowser) {
    throw new Error("Context used outside of its Provider!");
  }

  const txAnalytics = useCallback(
    (txName: string, originalArgs: unknown) => {
      const serializedAndDeserializedArgs = JSON.parse(
        serialize(originalArgs, undefined, undefined, () => undefined)
      );
      return [
        (value: TransactionInfo) =>
          void analyticsBrowser.track(
            `${txName} Broadcasted`,
            {
              transaction: {
                hash: value.hash,
                chainId: value.chainId,
              },
              originalArgs: serializedAndDeserializedArgs,
            },
            {
              context: instanceDetails,
            }
          ),
        (reason: any) => {
          analyticsBrowser.track(
            `${txName} Failed`,
            {},
            {
              context: instanceDetails,
            }
          );
          throw reason;
        },
      ];
    },
    [analyticsBrowser, instanceDetails]
  );

  return { ...analyticsBrowser, txAnalytics, instanceDetails };
};
