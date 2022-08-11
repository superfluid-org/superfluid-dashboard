import * as Sentry from "@sentry/browser";
import promiseRetry from "promise-retry";
import { FC, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import { useAccount, useNetwork } from "wagmi";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { IsCypress, SSR } from "../../utils/SSRUtils";

const SENTRY_WALLET_CONTEXT = "Connected Wallet";
const SENTRY_WALLET_TAG = "wallet";

const SENTRY_EXPECTED_NETWORK_CONTEXT = "Expected Network";
const SENTRY_EXPECTED_NETWORK_TAG = "network";

const SentryContext: FC = () => {
  const { network } = useExpectedNetwork();

  useEffect(() => {
    Sentry.setTag(SENTRY_EXPECTED_NETWORK_TAG, network.slugName);
    Sentry.setContext(SENTRY_EXPECTED_NETWORK_CONTEXT, {
      id: network.id,
      name: network.name,
      slug: network.slugName,
    });
  }, [network]);

  const { connector: activeConnector, isConnected } = useAccount();
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
    if (!SSR && !IsCypress && getVisitorId) {
      // This weird retrying is because we can't be exactly sure when Intercom is initialized (booted) because it's not exposed by useIntercom()-
      promiseRetry(
        (retry) =>
          new Promise<void>((resolve, reject) => {
            const visitorId = getVisitorId();
            if (visitorId) {
              Sentry.setUser({ id: visitorId });
              resolve();
            } else {
              reject("Couldn't set visitor ID.");
            }
          }).catch(retry),
        {
          minTimeout: 500,
          maxTimeout: 2000,
          retries: 10,
        }
      );
    }
  }, [getVisitorId]);

  return null;
};

export default SentryContext;
