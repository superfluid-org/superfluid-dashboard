import { IWeb3FlowOperatorData } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransactionAndReturnQueryFnResult,
  RpcEndpointBuilder,
  TransactionInfo,
} from "@superfluid-finance/sdk-redux";
import { createGeneralTags } from "@superfluid-finance/sdk-redux/dist/module/reduxSlices/rtkQuery/cacheTags/CacheTagTypes";
import { providers, Signer } from "ethers";
import { getGoerliSdk, getPolygonMumbaiSdk } from "../../../eth-sdk/client";
import { STREAM_SCHEDULAR_CONTRACT_ADDRESS } from "../../../eth-sdk/config";
import { networkDefinition } from "../../network/networks";

const getSdk = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  if (chainId === networkDefinition.goerli.id) {
    return getGoerliSdk(providerOrSigner);
  }

  if (chainId === networkDefinition.polygonMumbai.id) {
    return getPolygonMumbaiSdk(providerOrSigner);
  }

  throw new Error();
};

interface GetStreamScheduledEndDate extends BaseQuery<number | null> {
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

interface RevokeAllStreamSchedulerPermissions extends BaseSuperTokenMutation {}

interface ScheduleStreamEndDate extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  endTimestamp: number;
  userData: string;
}

export const streamSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    streamScheduledEndDate: builder.query<
      number | null,
      GetStreamScheduledEndDate
    >({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const sdk = getSdk(chainId, framework.settings.provider); // TODO(KK): Get this off of a Network.

        const streamOrder = await sdk.StreamScheduler.getStreamOrders(
          senderAddress,
          receiverAddress,
          superTokenAddress
        );

        return { data: streamOrder.endDate };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
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
          title: "Schedule Stream End Date",
        });
      },
    }),
    streamSchedulerPermissions: builder.query<
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
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
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
          title: "Update Stream Scheduler Permissions",
        });
      },
    }),
    revokeAllStreamSchedulerPermissions: builder.mutation<
      TransactionInfo,
      RevokeAllStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );

        const transactionResponse = await superToken
          .revokeFlowOperatorWithFullControl({
            flowOperator: STREAM_SCHEDULAR_CONTRACT_ADDRESS,
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
          title: "Update Stream Scheduler Permissions",
        });
      },
    }),
  }),
};
