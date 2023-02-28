import { useCallback } from "react";
import {
  useAccount,
  useNetwork,
  useQuery,
  useSigner,
  useSwitchNetwork,
} from "wagmi";
import * as PushApi from "@pushprotocol/restapi";
import { SignerType } from "@pushprotocol/restapi";
import { pushApi } from "../features/notifications/pushApi.slice";
import noop from "lodash/noop";

export const superfluidChannelAddress =
  process.env.NEXT_PUBLIC_PUSH_SUPERFLUID_CHANNEL ?? "";

export const superFluidChannel = `eip155:1:${superfluidChannelAddress}`;

export const usePushProtocol = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const { data: notifications } = pushApi.useGetNotificationsQuery(address);
  const { data: isSubscribed, refetch: refetchIsSubscribed } =
    pushApi.useIsSubscribedQuery(address);

  const toggleSubscribe = useCallback(async () => {
    const originalChainId = chain?.id;
    if (address) {
      if (originalChainId !== 1 && switchNetworkAsync) {
        await switchNetworkAsync(1);
      }

      await PushApi.channels[isSubscribed ? "unsubscribe" : "subscribe"]({
        signer: signer as unknown as SignerType,
        channelAddress: superFluidChannel,
        userAddress: `eip155:1:${address}`,
        env: "prod",
      });

      await refetchIsSubscribed();
    }
  }, [chain, address, isSubscribed, signer]);

  return {
    toggleSubscribe,
    notifications,
    isSubscribed: Boolean(isSubscribed),
  };
};
