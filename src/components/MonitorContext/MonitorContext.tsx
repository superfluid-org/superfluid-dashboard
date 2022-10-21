import { useTheme } from "@mui/material";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import * as Sentry from "@sentry/browser";
import { SeverityLevel } from "@sentry/react";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";
import promiseRetry from "promise-retry";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { hotjar } from "react-hotjar";
import { useIntercom } from "react-use-intercom";
import { useAccount, useNetwork } from "wagmi";
import { supportId, useAnalytics } from "../../features/analytics/useAnalytics";
import { useLayoutContext } from "../../features/layout/LayoutContext";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import config from "../../utils/config";
import { IsCypress, SSR } from "../../utils/SSRUtils";

const SENTRY_WALLET_CONTEXT = "Connected Wallet";
const SENTRY_WALLET_TAG = "wallet";

const SENTRY_EXPECTED_NETWORK_CONTEXT = "Expected Network";
const SENTRY_EXPECTED_NETWORK_TAG = "network";
const SENTRY_EXPECTED_NETWORK_TESTNET_TAG = "network.testnet";

const SENTRY_SUPPORT_ID_TAG = "support-id";

Sentry.setTag(SENTRY_SUPPORT_ID_TAG, supportId);

// const [analyticsDetails, setAnalyticsDetails] = useState<AnalyticsDetails>(mapAnalyticsDetails());

// useEffect(() => {
//   const nextDetails: AnalyticsDetails = mapAnalyticsDetails();

//   if (
//     nextDetails.dashboard.wallet.isConnected !==
//     dashboardState.dashboard.wallet.isConnected
//   ) {
//     if (nextDetails.dashboard.wallet.isConnected) {
//       track("Wallet Connected");
//     } else {
//       track("Wallet Disconnected");
//     }
//   } else {
//     if (
//       nextDetails.dashboard.wallet.networkId !=
//       dashboardState.dashboard.wallet.networkId
//     ) {
//       track("Wallet Network Changed");
//     }
//     if (
//       nextDetails.dashboard.wallet.account !=
//       dashboardState.dashboard.wallet.account
//     ) {
//       track("Wallet Account Changed");
//     }
//   }

//   setAnalyticsDetails(nextDetails);
// }, deps);

const MonitorContext: FC = () => {
  const { network } = useExpectedNetwork();

  useEffect(() => {
    const testnet = (!!network.testnet).toString();
    Sentry.setTag(SENTRY_EXPECTED_NETWORK_TAG, network.slugName);
    Sentry.setTag(SENTRY_EXPECTED_NETWORK_TESTNET_TAG, testnet);
    Sentry.setContext(SENTRY_EXPECTED_NETWORK_CONTEXT, {
      id: network.id,
      name: network.name,
      slug: network.slugName,
      testnet: testnet,
    });
  }, [network]);

  const { page, track, instanceDetails } = useAnalytics();
  const [previousInstanceDetails, setPreviousInstanceDetails] =
    useState(instanceDetails);

  useEffect(() => {
    if (instanceDetails === previousInstanceDetails) {
      return;
    }

    const {
      appInstance: { wallet },
    } = instanceDetails;
    const {
      appInstance: { wallet: prevWallet },
    } = previousInstanceDetails;

    if (wallet.isConnected !== prevWallet.isConnected) {
      if (wallet.isConnected) {
        track("Wallet Connected", {}, {
          context: instanceDetails,
        });
      } else {
        track("Wallet Disconnected", {}, {
          context: instanceDetails,
        });
      }
    } else {
      if (wallet.networkId != prevWallet.networkId) {
        track("Wallet Network Changed", {}, {
          context: instanceDetails,
        });
      }
      if (wallet.account != prevWallet.account) {
        track("Wallet Account Changed", {}, {
          context: instanceDetails,
        });
      }
    }

    setPreviousInstanceDetails(instanceDetails);
  }, [instanceDetails]);

  useEffect(() => {
    Sentry.setContext("App Instance", instanceDetails.appInstance);
  }, [instanceDetails]);

  // const { connector: activeConnector, isConnected } = useAccount();
  // const { chain: activeChain } = useNetwork();

  // useEffect(() => {
  //   if (isConnected && activeConnector) {
  //     Sentry.setTag(SENTRY_WALLET_TAG, activeConnector.id);
  //     Sentry.setContext(SENTRY_WALLET_CONTEXT, {
  //       id: activeConnector.id,
  //       ...(activeChain
  //         ? {
  //             "network-id": activeChain.id,
  //             "network-name": activeChain.name,
  //           }
  //         : {}),
  //     });
  //   } else {
  //     Sentry.setTag(SENTRY_WALLET_TAG, null);
  //     Sentry.setContext(SENTRY_WALLET_CONTEXT, null);
  //   }
  // }, [isConnected, activeConnector, activeChain]);

  const { getVisitorId } = useIntercom();

  useEffect(() => {
    if (!SSR && !IsCypress && getVisitorId && config.intercom.appId) {
      // This weird retrying is because we can't be exactly sure when Intercom is initialized (booted) because it's not exposed by useIntercom()-
      promiseRetry(
        (retry) =>
          new Promise<void>((resolve, reject) => {
            const visitorId = getVisitorId();
            if (visitorId) {
              Sentry.setUser({ id: visitorId });
              hotjar.identify(visitorId, {
                support_id: supportId,
              });
              resolve();
            } else {
              reject("Couldn't set visitor ID.");
            }
          }).catch(retry),
        {
          minTimeout: 500,
          maxTimeout: 3000,
          retries: 20,
        }
      );
    }
  }, [getVisitorId]);

  const onRouteChangeComplete = useCallback(
    (_fullUrl: string, { shallow }: { shallow: boolean }) =>
      shallow ? void 0 : page(),
    []
  );

  const router = useRouter();
  useEffect(() => {
    router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () =>
      router.events.off("routeChangeComplete", onRouteChangeComplete);
  }, []);

  const onSentryEvent = useCallback((event: Sentry.Event) => {
    if (event.exception) {
      track("Error Logged", {
        eventId: event.event_id,
      });
    }
    return event;
  }, []);
  useEffect(() => void Sentry.addGlobalEventProcessor(onSentryEvent), []);

  return null;
};

export default MonitorContext;
