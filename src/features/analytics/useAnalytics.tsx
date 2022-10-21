import { AnalyticsBrowser } from "@segment/analytics-next";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import config from "../../utils/config";
import { useAccount, useNetwork } from "wagmi";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { customAlphabet } from "nanoid";
import { useAutoConnect } from "../autoConnect/AutoConnect";

type AnalyticsProviderProps = {
  writeKey: string | undefined;
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
    expectedNetwork: string;
    expectedNetworkId: number;
    isExpectedNetworkTestnet: boolean;
    layout: {
      isTransactionDrawerOpen: boolean;
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
        expectedNetwork: expectedNetwork.name,
        expectedNetworkId: expectedNetwork.id,
        isExpectedNetworkTestnet: !!expectedNetwork.testnet,
        layout: {
          isTransactionDrawerOpen: transactionDrawerOpen,
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
    if (writeKey) {
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

  const initialResetRef = useRef(false);
  if (!initialResetRef.current) {
    initialResetRef.current = true;
    analyticsBrowser.reset();
  }

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
    (txName: string) => [
      (value: TransactionInfo) =>
        void analyticsBrowser.track(
          `${txName} Broadcasted`,
          {
            transaction: {
              hash: value.hash,
              chainId: value.chainId,
            },
          },
          {
            context: instanceDetails,
          }
        ),
      (_error: any) =>
        void analyticsBrowser.track(
          `${txName} Failed`,
          {},
          {
            context: instanceDetails,
          }
        ),
    ],
    [analyticsBrowser, instanceDetails]
  );
  return { ...analyticsBrowser, txAnalytics, instanceDetails };
};
