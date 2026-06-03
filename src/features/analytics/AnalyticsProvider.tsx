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
    // Tracking disabled (#864). Do not use writeKey "NOOP" — that still fetches
    // cdn.segment.com and throws "Failed to fetch" when settings 404/time out.
    const writeKey: string | undefined = undefined;
    if (!IsCypress && writeKey) {
      return AnalyticsBrowser.load(
        { writeKey },
        {
          initialPageview: true,
        }
      );
    }

    console.warn("Segment not initialized. No-op instance provided instead.");
    return AnalyticsBrowser.load({ writeKey: "" }, { disable: true });
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