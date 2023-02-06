import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { useCallback, useContext } from "react";
import { serialize } from "wagmi";
import * as Sentry from "@sentry/react";
import { AnalyticsContext } from "./AnalyticsProvider";
import { AnalyticsTransactionNames } from "./AnalyticsTxNames";

export const useAnalytics = () => {
    const { analyticsBrowser, instanceDetails } = useContext(AnalyticsContext);
    if (!analyticsBrowser) {
      throw new Error("Context used outside of its Provider!");
    }
  
    const txAnalytics = useCallback(
      // "Primary Args" are meant as the main serializable arguments passed to the mutation.
      (txName: AnalyticsTransactionNames, primaryArgs: unknown) => {
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
  