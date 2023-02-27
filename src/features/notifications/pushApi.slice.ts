import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import * as PushApi from "@pushprotocol/restapi";
import { superfluidChannelAddress } from "../../hooks/usePushProtocol";
import { ApiNotificationType } from "@pushprotocol/restapi";

export interface ResolveNameResult {
  address: string;
  name: string;
}

export const pushApi = createApi({
  reducerPath: "push",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 0,
  endpoints: (builder) => {
    return {
      isSubscribed: builder.query({
        queryFn: async (user) => {
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
      getNotifications: builder.query<ApiNotificationType, string>({
        queryFn: async (user) => {
          const notifications = await PushApi.user.getFeeds({
            user: `eip155:1:${user}`,
            env: "prod",
          });
          return {
            data: notifications,
          };
        },
      }),
    };
  },
});
