import * as Sentry from "@sentry/browser";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";
import promiseRetry from "promise-retry";
import { FC, useCallback, useEffect } from "react";
import { hotjar } from "react-hotjar";
import { useIntercom } from "react-use-intercom";
import { useAccount, useNetwork } from "wagmi";
import { useAnalytics } from "../../features/analytics/useAnalytics";
import { useAutoConnect } from "../../features/autoConnect/AutoConnect";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import config from "../../utils/config";
import { IsCypress, SSR } from "../../utils/SSRUtils";

const SENTRY_WALLET_CONTEXT = "Connected Wallet";
const SENTRY_WALLET_TAG = "wallet";

const SENTRY_EXPECTED_NETWORK_CONTEXT = "Expected Network";
const SENTRY_EXPECTED_NETWORK_TAG = "network";
const SENTRY_EXPECTED_NETWORK_TESTNET_TAG = "network.testnet";

const SENTRY_SUPPORT_ID_TAG = "support-id";

export const supportId = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")(
  8
); // Alphabet: "nolookalikesSafe"
Sentry.setTag(SENTRY_SUPPORT_ID_TAG, supportId);

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

  const { page, track } = useAnalytics();
  const { connector: activeConnector, isConnected } = useAccount({
    onConnect: ({ address, connector }) => {
      if (address && connector) {
        track("Wallet Connected", {
          connector: connector.name,
        });
        connector.on("change", ({ account, chain }) => {
          if (account) {
            track("Wallet Account Changed");
          } else if (chain) {
            track("Wallet Network Changed");
          }
        });
      }
    },
    onDisconnect: () => void track("Wallet Disconnected"),
  });
  const { chain: activeChain } = useNetwork();

  useEffect(() => {
    if (isConnected && activeConnector) {
      Sentry.setTag(SENTRY_WALLET_TAG, activeConnector.id);
      Sentry.setContext(SENTRY_WALLET_CONTEXT, {
        id: activeConnector.id,
        ...(activeChain
          ? {
              "network-id": activeChain.id,
              "network-name": activeChain.name,
            }
          : {}),
      });
    } else {
      Sentry.setTag(SENTRY_WALLET_TAG, null);
      Sentry.setContext(SENTRY_WALLET_CONTEXT, null);
    }
  }, [isConnected, activeConnector, activeChain]);

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

  return null;
};

export default MonitorContext;
