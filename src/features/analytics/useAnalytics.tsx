import { AnalyticsBrowser } from "@segment/analytics-next";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { createContext, useContext, useMemo } from "react";

// Inspired by: https://github.com/segmentio/analytics-next#using-react-advanced-w-react-context

const AnalyticsContext = createContext<AnalyticsBrowser>(undefined!);

type AnalyticsProviderProps = {
  writeKey: string | undefined;
  children: React.ReactNode;
};

export const AnalyticsProvider = ({
  children,
  writeKey,
}: AnalyticsProviderProps) => {
  const analytics = useMemo(() => {
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
  }, [writeKey]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const result = useContext(AnalyticsContext);
  if (!result) {
    throw new Error("Context used outside of its Provider!");
  }
  const txAnalytics = useMemo(
    () => [
      (value: TransactionInfo) =>
        void result.track("Transaction Sent", {
          transaction: {
            hash: value.hash,
            chainId: value.chainId,
          },
        }),
      (_error: any) => void result.track("Transaction Failed"),
    ],
    [result]
  );
  return { ...result, txAnalytics };
};
