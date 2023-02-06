import { AnalyticsBrowser } from "@segment/analytics-next";
import { createContext, useMemo } from "react";
import config from "../../utils/config";
import { IsCypress } from "../../utils/SSRUtils";
import { AppInstanceDetails, useAppInstanceDetails } from "./useAppInstanceDetails";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

type AnalyticsContextValue = {
  analyticsBrowser: AnalyticsBrowser;
  instanceDetails: AppInstanceDetails;
};

export const AnalyticsContext = createContext<AnalyticsContextValue>(undefined!);

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