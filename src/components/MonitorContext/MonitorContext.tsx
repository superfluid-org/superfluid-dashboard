import * as Sentry from "@sentry/browser";
import { useRouter } from "next/router";
import promiseRetry from "promise-retry";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { hotjar } from "react-hotjar";
import { useIntercom } from "react-use-intercom";
import {
  addBeforeSend,
  BeforeSendFunc,
  removeBeforeSend,
} from "../../../sentry.client.config";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import {
  listenerMiddleware,
  transactionTracker,
} from "../../features/redux/store";
import config from "../../utils/config";
import { IsCypress, SSR } from "../../utils/SSRUtils";
import { useAccount, useNetwork } from "wagmi";
import { supportId } from "../../features/analytics/useAppInstanceDetails";
import { useAnalytics } from "../../features/analytics/useAnalytics";

const SENTRY_WALLET_CONTEXT = "Connected Wallet";
const SENTRY_WALLET_TAG = "wallet";

const SENTRY_EXPECTED_NETWORK_CONTEXT = "Expected Network";
const SENTRY_EXPECTED_NETWORK_TAG = "network";
const SENTRY_EXPECTED_NETWORK_TESTNET_TAG = "network.testnet";

const SENTRY_SUPPORT_ID_TAG = "support-id";
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

  const { reset, identify, page, track, instanceDetails } = useAnalytics();
  const [previousInstanceDetails, setPreviousInstanceDetails] =
    useState(instanceDetails);

  const initialResetRef = useRef(false);
  if (!initialResetRef.current) {
    // When application starts up, reset the identity. Identify only on concrete wallet connections.
    initialResetRef.current = true;
    reset();
  }

  useEffect(
    () =>
      listenerMiddleware.startListening({
        actionCreator: transactionTracker.actions.updateTransaction,
        effect: ({ payload }) => {
          if (payload.changes.status) {
            track(`Transaction Marked ${payload.changes.status}`); // Succeeded, Failure, Unknown etc
          }
        },
      }),
    []
  );

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
        track("Wallet Connected", wallet).then(() => identify(wallet.account));
      } else {
        track("Wallet Disconnected", wallet).then(() => reset());
      }
    } else {
      if (wallet.isConnected && prevWallet.isConnected) {
        if (wallet.networkId != prevWallet.networkId) {
          track("Wallet Network Changed", wallet);
        }
        if (wallet.account != prevWallet.account) {
          track("Wallet Account Changed", wallet)
            .then(() => reset()) // Reset before not to associate next identification with previous wallet address.
            .then(() => identify(wallet.account));
        }
      }
    }

    setPreviousInstanceDetails(instanceDetails);
  }, [instanceDetails]);

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
  }, [instanceDetails]);

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

  useEffect(() => {
    const onSentryEvent: BeforeSendFunc = (event) => {
      if (event.exception) {
        track("Error Logged", {
          eventId: event.event_id,
        });
      }
      return event;
    };

    addBeforeSend(onSentryEvent);

    return () => removeBeforeSend(onSentryEvent);
  }, [track]);

  return null;
};

export default MonitorContext;
