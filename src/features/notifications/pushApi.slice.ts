import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import {
  superFluidChannel,
  superfluidChannelAddress,
} from "../../hooks/usePushProtocol";
import {
  ApiNotificationType,
  SignerType,
} from "@pushprotocol/restapi";
import * as PushApi from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";

export interface ResolveNameResult {
  address: string;
  name: string;
}

export const pushApi = createApi({
  reducerPath: "push",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600,
  endpoints: (builder) => {
    return {
      isSubscribed: builder.query<boolean, string>({
        queryFn: async (user) => {
          const result: { channel: string }[] =
            await PushApi.user.getSubscriptions({
              user,
              env: ENV.PROD,
            });

          return {
            data: result
              .map(({ channel }) => channel.toLowerCase())
              .includes(superfluidChannelAddress.toLowerCase()),
          };
        },
      }),
      changeSubscription: builder.mutation<
        { status: string; message: string },
        {
          signer: SignerType;
          address: string;
          subscribed: "subscribe" | "unsubscribe";
        }
      >({
        queryFn: async ({ address, signer, subscribed }) => {
          const result = await PushApi.channels[subscribed]({
            signer,
            channelAddress: superFluidChannel,
            userAddress: `eip155:1:${address}`,
            env: ENV.PROD,
          });

          return { data: result };
        },
        onQueryStarted: async (
          { address, subscribed },
          { dispatch, queryFulfilled }
        ) => {
          const patchResult = dispatch(
            pushApi.util.updateQueryData(
              "isSubscribed",
              address,
              () => subscribed === "subscribe"
            )
          );

          try {
            const result = await queryFulfilled;

            if (result.data.status === "error") {
              patchResult.undo();
            }
          } catch {
            patchResult.undo();
          }
        },
      }),
      getNotifications: builder.query<ApiNotificationType[], string>({
        queryFn: async (user) => {
          const notifications: ApiNotificationType[] =
            await PushApi.user.getFeeds({
              user: `eip155:1:${user}`,
              env: ENV.PROD,
              limit: 500,
              raw: true,
            });

          return {
            data: notifications.filter(
              (n) => n.payload.data.app === "Superfluid"
            ),
          };
        },
      }),
    };
  },
});
