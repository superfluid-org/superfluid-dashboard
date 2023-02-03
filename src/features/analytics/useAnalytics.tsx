import { AnalyticsBrowser } from "@segment/analytics-next";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { createContext, useCallback, useContext, useMemo } from "react";
import config from "../../utils/config";
import { serialize, useAccount, useNetwork } from "wagmi";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { customAlphabet } from "nanoid";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { IsCypress } from "../../utils/SSRUtils";
import * as Sentry from "@sentry/react";

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
    // "Primary Args" are meant as the main serializable arguments passed to the mutation.
    (txName: string, primaryArgs: unknown) => {
      const ensureSafeSerializationOfArgs = (): Record<string, unknown> => {
        try {
          return JSON.parse(serialize(primaryArgs));
        } catch (error) {
          Sentry.captureException(error);
          return {}; // When something wrong with serialization then simplify to an empty object and don't crash the app.
        }
      };

      return [
        (value: TransactionInfo) =>
          void analyticsBrowser.track(
            `${txName} Broadcasted`,
            {
              args: ensureSafeSerializationOfArgs(),
              transaction: {
                hash: value.hash,
                chainId: value.chainId,
              },
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
