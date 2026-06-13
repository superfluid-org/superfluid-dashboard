import { BaseQuery, RpcEndpointBuilder } from "@superfluid-finance/sdk-redux";
import {
  getFlowSchedule,
  StreamScheduleResponse,
} from "../../transactions/contractReads";

interface GetFlowSchedule extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export const flowSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getFlowSchedule: builder.query<
      StreamScheduleResponse | null,
      GetFlowSchedule
    >({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        return {
          data: await getFlowSchedule({
            chainId,
            superTokenAddress,
            senderAddress,
            receiverAddress,
          }),
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
    }),
  }),
};
