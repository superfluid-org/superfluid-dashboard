import { BaseQuery, RpcEndpointBuilder } from "@superfluid-finance/sdk-redux";
import { flowSchedulerAbi } from "@sfpro/sdk/abi/automation";
import { getUnixTime } from "date-fns";
import { Address } from "viem";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { resolvedWagmiClients } from "../../wallet/WagmiManager";

interface GetFlowSchedule extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface StreamScheduleResponse {
  startDate?: number;
  endDate?: number;
  flowRate?: string;
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
        const publicClient = resolvedWagmiClients[chainId]();

        const network = findNetworkOrThrow(allNetworks, chainId);
        const flowSchedulerContractAddress =
          network.flowSchedulerContractAddress;
        if (!flowSchedulerContractAddress) {
          throw new Error("Flow scheduler not supported on this network");
        }

        const { startDate, endDate, startMaxDelay, flowRate } =
          await publicClient.readContract({
            abi: flowSchedulerAbi,
            address: flowSchedulerContractAddress as Address,
            functionName: "getFlowSchedule",
            args: [
              superTokenAddress as Address,
              senderAddress as Address,
              receiverAddress as Address,
            ],
          });

        const unixNow = getUnixTime(new Date());

        const isStartExpired = startDate + startMaxDelay <= unixNow;
        const effectiveStartDate = isStartExpired ? undefined : startDate;

        return {
          data: {
            startDate: effectiveStartDate,
            endDate: endDate ? endDate : undefined,
            flowRate: isStartExpired ? undefined : flowRate.toString(),
          } as StreamScheduleResponse,
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
