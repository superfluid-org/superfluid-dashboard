import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import {
  superFluidChannel,
  superfluidChannelAddress,
} from "../../hooks/usePushProtocol";
import { ParsedResponseType, SignerType } from "@pushprotocol/restapi";
import * as PushApi from "@pushprotocol/restapi";

export const pushApi = createApi({
  reducerPath: "push",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600,
  endpoints: (builder) => {
    return {
      isSubscribed: builder.query<boolean, string | undefined>({
        queryFn: async (user) => {
          if (!user) {
            return {
              data: false,
            };
          }

          const result: { channel: string }[] =
            await PushApi.user.getSubscriptions({
              user,
              env: "prod",
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
            env: "prod",
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
      getNotifications: builder.query<ParsedResponseType[], string | undefined>(
        {
          queryFn: async (user) => {
            if (!user) {
              return {
                data: [],
              };
            }

            const notifications: ParsedResponseType[] =
              await PushApi.user.getFeeds({
                user: `eip155:1:${user}`,
                env: "prod",
              });
            return {
              data: notifications.filter((n) => n.app === "Superfluid"),
            };
          },
        }
      ),
    };
  },
});
