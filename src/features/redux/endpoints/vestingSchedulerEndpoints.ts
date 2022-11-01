import {
  BaseSuperTokenMutation,
  RpcEndpointBuilder,
  TransactionInfo,
} from "@superfluid-finance/sdk-redux";

interface CreateVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
}

export const vestingSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    createVestingSchedule: builder.mutation<
      TransactionInfo,
      CreateVestingSchedule
    >({
      queryFn: ({ chainId, ...arg }) => {


        return {
          data: {
            chainId,
            hash: "todo",
          },
        };
      },
    }),
  }),
};
