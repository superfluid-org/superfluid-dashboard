import { Operation, SuperToken__factory } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { UnitOfTime } from "../../send/FlowRateInput";
export const MAX_VESTING_DURATION_IN_YEARS = 10;
export const MAX_VESTING_DURATION_IN_SECONDS =
  MAX_VESTING_DURATION_IN_YEARS * UnitOfTime.Year;

interface RevokeAccessMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
}

export const accessSettingMutationEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    revokeAccess: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      RevokeAccessMutation
    >({
      queryFn: async (
        {
          signer,
          chainId,
          superTokenAddress,
          operatorAddress,
          transactionExtraData,
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const batchedOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        // # Flow Operator Permissions & Flow Rate Allowance

        batchedOperations.push({
          title: "Revoked ACL Permissions",
          operation: await superToken.revokeFlowOperatorWithFullControl({
            flowOperator: operatorAddress,
          }),
        });

        // # ERC-20 allowance ("token allowance")
        const superTokenContract = SuperToken__factory.connect(
          superToken.address,
          signer
        );

        const approveAllowancePromise =
          superTokenContract.populateTransaction.approve(
            operatorAddress,
            BigNumber.from(0)
          );

        batchedOperations.push({
          operation: new Operation(approveAllowancePromise, "ERC20_APPROVE"),
          title: "Revoked Super Token Allowance",
        });

        // # Execute transaction
        const executable =
          batchedOperations.length === 1
            ? batchedOperations[0].operation
            : framework.batchCall(batchedOperations.map((x) => x.operation));

        const transactionResponse = await executable.exec(signer);
        const subTransactionTitles = batchedOperations.map((x) => x.title);

        const signerAddress = await signer.getAddress();
        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signer: signerAddress,
          title: "Revoked Access",
          extraData: {
            subTransactionTitles,
            ...(transactionExtraData ?? {}),
          },
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
            subTransactionTitles,
          },
        };
      },
    }),
  }),
};


