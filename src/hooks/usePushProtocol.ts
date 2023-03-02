import { useCallback } from "react";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import { SignerType } from "@pushprotocol/restapi";
import { pushApi } from "../features/notifications/pushApi.slice";
import { Signer } from "ethers";
Signer;
export const superfluidChannelAddress =
  process.env.NEXT_PUBLIC_PUSH_SUPERFLUID_CHANNEL ?? "";

export const superFluidChannel = `eip155:1:${superfluidChannelAddress}`;

export const usePushProtocol = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const [changeSubscription] = pushApi.useChangeSubscriptionMutation();

  const { data: notifications } = pushApi.useGetNotificationsQuery(address, {
    pollingInterval: 15000,
  });
  const { data: isSubscribed } = pushApi.useIsSubscribedQuery(address);

  const toggleSubscribe = useCallback(async () => {
    const originalChainId = chain?.id;
    if (address) {
      if (originalChainId !== 1 && switchNetworkAsync) {
        await switchNetworkAsync(1);
      }

      if (signer) {
        await changeSubscription({
          signer: signer as unknown as SignerType,
          address,
          subscribed: isSubscribed ? "unsubscribe" : "subscribe",
        });
      }
    }
  }, [chain, address, isSubscribed, signer]);

  return {
    toggleSubscribe,
    notifications: notifications ?? [],
    isSubscribed: Boolean(isSubscribed),
  };
};
