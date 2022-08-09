import * as Sentry from "@sentry/browser";
import { FC, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";

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
  }, [isConnected, activeConnector]);

  return null;
};

export default SentryContext;
