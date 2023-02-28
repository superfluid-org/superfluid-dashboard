import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import * as PushApi from "@pushprotocol/restapi";
import { superfluidChannelAddress } from "../../hooks/usePushProtocol";
import { ParsedResponseType } from "@pushprotocol/restapi";

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

          onQueryStarted: async (user, { dispatch, queryFulfilled }) => {
            const patchResult = dispatch(
              pushApi.util.updateQueryData("isSubscribed", user, (draft) =>
                draft.valueOf()
              )
            );

            try {
              await queryFulfilled;
            } catch {
              patchResult.undo();
            }
          },
        }
      ),
    };
  },
});
