import type { AnalyticsBrowser } from "@segment/analytics-next";
import { createContext, useMemo } from "react";
import { AppInstanceDetails, useAppInstanceDetails } from "./useAppInstanceDetails";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

/**
 * The subset of `AnalyticsBrowser` this app actually consumes. Argument types are
 * derived from the real library types so call sites stay just as strictly checked,
 * while the return type is widened to `Promise<unknown>` so that both the no-op stub
 * below and a genuine `AnalyticsBrowser` are assignable.
 */
export type AnalyticsInterface = {
  [K in "track" | "identify" | "page" | "reset"]: (
    ...args: Parameters<AnalyticsBrowser[K]>
  ) => Promise<unknown>;
};

type AnalyticsContextValue = {
  analyticsBrowser: AnalyticsInterface;
  instanceDetails: AppInstanceDetails;
};

export const AnalyticsContext = createContext<AnalyticsContextValue>(undefined!);

/**
 * Tracking is intentionally disabled (see #864). This is a genuine no-op: importing
 * `AnalyticsBrowser` as a type only keeps the Segment library out of the bundle, so
 * nothing loads Segment settings from the CDN. Constructing an `AnalyticsBrowser`
 * without calling `load()` would also avoid the network request, but it buffers every
 * call forever and returns promises that never settle.
 *
 * To re-enable tracking, replace this with
 * `AnalyticsBrowser.load({ writeKey: config.segmentWriteKey }, { initialPageview: true })`
 * (restoring the runtime import).
 */
const noopAnalyticsBrowser: AnalyticsInterface = Object.freeze({
  track: () => Promise.resolve(),
  identify: () => Promise.resolve(),
  page: () => Promise.resolve(),
  reset: () => Promise.resolve(),
});

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const instanceDetails = useAppInstanceDetails();

  const contextValue = useMemo(
    () => ({
      analyticsBrowser: noopAnalyticsBrowser,
      instanceDetails,
    }),
    [instanceDetails]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};
