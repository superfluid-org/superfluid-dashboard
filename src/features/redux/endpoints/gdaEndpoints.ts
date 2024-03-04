import { Address } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
  getFramework,
  registerNewTransaction,
} from "@superfluid-finance/sdk-redux";

// export interface UpsertFlowWithScheduling
//   extends FlowCreateMutation,
//     FlowUpdateMutation {
//   senderAddress: string;
//   startTimestamp: number | null;
//   endTimestamp: number | null;
// }

interface ConnectGdaPool extends BaseSuperTokenMutation {
  poolAddress: Address;
  //   accountAddress: Address;
}

export const gdaEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    connectToPool: builder.mutation<TransactionInfo, ConnectGdaPool>({
      queryFn: async (
        {
          chainId,
          superTokenAddress,
          poolAddress,
          overrides,
          signer,
          transactionExtraData,
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const transactionResponse = await superToken
          .connectPool({
            pool: poolAddress,
            overrides,
          })
          .exec(signer);

        const signerAddress = await signer.getAddress();
        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signerAddress,
          title: "Connect to Pool",
          extraData: transactionExtraData,
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
          },
        };
      },
    }),
  }),
};

// getFlowSchedule: builder.query<
// StreamScheduleResponse | null,
// GetFlowSchedule
// >({
// queryFn: async ({
//   chainId,
//   superTokenAddress,
//   senderAddress,
//   receiverAddress,
// }) => {
//   const framework = await getFramework(chainId);
//   const flowScheduler = getFlowScheduler(
//     chainId,
//     framework.settings.provider
//   );

//   const { startDate, endDate, startMaxDelay, flowRate } =
//     await flowScheduler.getFlowSchedule(
//       superTokenAddress,
//       senderAddress,
//       receiverAddress
//     );

//   const unixNow = getUnixTime(new Date());

//   const isStartExpired = startDate + startMaxDelay <= unixNow;
//   const effectiveStartDate = isStartExpired ? undefined : startDate;

//   return {
//     data: {
//       startDate: effectiveStartDate,
//       endDate: endDate ? endDate : undefined,
//       flowRate: isStartExpired ? undefined : flowRate.toString(),
//     } as StreamScheduleResponse,
//   };
// },
// providesTags: (_result, _error, arg) => [
//   {
//     type: "GENERAL",
//     id: arg.chainId,
//   },
// ],
// }),
