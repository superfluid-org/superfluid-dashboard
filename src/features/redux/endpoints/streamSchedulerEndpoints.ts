import { IWeb3FlowOperatorData } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransactionAndReturnQueryFnResult,
  RpcEndpointBuilder,
  TransactionInfo,
} from "@superfluid-finance/sdk-redux";
import { utils } from "ethers";
import { getGoerliSdk } from "../../../eth-sdk/client";
import { STREAM_SCHEDULAR_CONTRACT_ADDRESS } from "../../../eth-sdk/config";

interface GetNextStreamScheduledEndDate extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface GetStreamSchedulerPermissions
  extends BaseQuery<IWeb3FlowOperatorData> {
  senderAddress: string;
  superTokenAddress: string;
}

interface UpdateStreamSchedulerPermissions extends BaseSuperTokenMutation {
  permissions: number;
  flowRateAllowance: string;
  userData?: string;
}

interface ScheduleStreamEndDate extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  endTimestamp: number;
  userData: string;
}

export const streamSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getStreamSchedulerPermissions: builder.query<
      IWeb3FlowOperatorData,
      GetStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, superTokenAddress, senderAddress }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const flowOperatorData = await superToken.getFlowOperatorData({
          flowOperator: STREAM_SCHEDULAR_CONTRACT_ADDRESS,
          sender: senderAddress,
          providerOrSigner: framework.settings.provider,
        });

        return { data: flowOperatorData };
      },
    }),
    updateStreamSchedulerPermissions: builder.mutation<
      TransactionInfo,
      UpdateStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );

        const transactionResponse = await superToken
          .updateFlowOperatorPermissions({
            flowOperator: STREAM_SCHEDULAR_CONTRACT_ADDRESS,
            flowRateAllowance: arg.flowRateAllowance,
            permissions: arg.permissions,
            overrides: arg.overrides,
            userData: arg.userData,
          })
          .exec(arg.signer);

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Update Flow Operator Permissions",
        });
      },
    }),
    getNextStreamScheduledEndDate: builder.query<
      number | null,
      GetNextStreamScheduledEndDate
    >({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const sdk = getGoerliSdk(framework.settings.provider); // TODO(KK): Get this off of a Network.

        const streamOrder = await sdk.StreamScheduler.getStreamOrders(senderAddress, receiverAddress, superTokenAddress);

        return { data: streamOrder.endDate };
      },
    }),
    scheduleStreamEndDate: builder.mutation<
      TransactionInfo,
      ScheduleStreamEndDate
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const sdk = getGoerliSdk(arg.signer); // TODO(KK): Get this off of a Network.

        const contractTransaction = await sdk.StreamScheduler.createStreamOrder(
          arg.receiverAddress,
          arg.superTokenAddress,
          0, // startDate
          0, // startDuration
          "0", // flowRate
          arg.endTimestamp,
          arg.userData,
          arg.overrides ?? {}
        );

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse: contractTransaction,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Create Stream Order",
        });
      },
    }),
  }),
};
