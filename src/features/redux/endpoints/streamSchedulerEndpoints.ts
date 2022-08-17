import { BaseSuperTokenMutation, getFramework, registerNewTransactionAndReturnQueryFnResult, RpcEndpointBuilder, TransactionInfo } from "@superfluid-finance/sdk-redux";
import { getGoerliSdk } from "../../../eth-sdk/client";

interface UpdateFlowOperatorPermissions extends BaseSuperTokenMutation {
  flowOperator: string;
  permissions: number;
  flowRateAllowance: string;
  userData?: string;
}

interface CreateStreamOrder extends BaseSuperTokenMutation {
  sender: string;
  receiver: string;
  startDate: number;
  startDuration: number;
  flowRateWei: string;
  endDate: number;
  userData: string;
}

export const streamSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    updateFlowOperatorPermissions: builder.mutation<TransactionInfo, UpdateFlowOperatorPermissions>({
      queryFn: async ({ chainId, ...arg}, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(arg.superTokenAddress);

        const transactionResponse = await superToken.updateFlowOperatorPermissions({
          flowOperator: arg.flowOperator,
          flowRateAllowance: arg.flowRateAllowance,
          permissions: arg.permissions,
          overrides: arg.overrides,
          userData: arg.userData
        }).exec(arg.signer);

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Update Flow Operator Permissions"
        });
      },
    }),
    createStreamOrder: builder.mutation<TransactionInfo, CreateStreamOrder>({
      queryFn: async ({ chainId, ...arg}, { dispatch }) => {
        const sdk = getGoerliSdk(arg.signer); // TODO(KK): Get this off of a Network.
        const contractTransaction = await sdk.StreamScheduler.createStreamOrder(arg.receiver, arg.superTokenAddress, arg.startDate, arg.startDuration, arg.flowRateWei, arg.endDate, arg.userData, arg.overrides)

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse: contractTransaction,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Create Stream Order"
        });
      },
    }),
  }),
};
