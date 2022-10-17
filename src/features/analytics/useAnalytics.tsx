import { AnalyticsBrowser } from "@segment/analytics-next";
import { createContext, useContext, useMemo } from "react";
import { UpsertFlowWithScheduling } from "../redux/endpoints/streamSchedulerEndpoints";

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
      return AnalyticsBrowser.load({ writeKey });
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
  return result;
};
