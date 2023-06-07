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
import { TokenAccessProps } from "../../tokenAccess/dialogs/UpsertTokenAccessForm";

interface UpdateAccessMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  initialAccess: TokenAccessProps;
  editedAccess: TokenAccessProps;
}

interface RevokeAccessMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  initialAccess: TokenAccessProps;
}

export const tokenAccessMutationEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    updateAccess: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      UpdateAccessMutation
    >({
      queryFn: async (
        {
          signer,
          chainId,
          superTokenAddress,
          operatorAddress,
          initialAccess,
          editedAccess,
          transactionExtraData,
          ...arg
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

        if (
          !editedAccess.flowRateAllowance.amountEther.eq(
            initialAccess.flowRateAllowance.amountEther
          ) ||
          editedAccess.flowOperatorPermissions !==
            initialAccess.flowOperatorPermissions ||
          editedAccess.flowRateAllowance.unitOfTime !==
            initialAccess.flowRateAllowance.unitOfTime
        ) {
          const flowRateAllowance =
            editedAccess.flowRateAllowance.unitOfTime === UnitOfTime.Second
              ? editedAccess.flowRateAllowance.amountEther
              : editedAccess.flowRateAllowance.amountEther.div(
                  editedAccess.flowRateAllowance.unitOfTime
                );

          batchedOperations.push({
            title: "Update FlowOperator Permissions",
            operation: await superToken.updateFlowOperatorPermissions({
              flowOperator: operatorAddress,
              flowRateAllowance: flowRateAllowance.toString(),
              permissions: editedAccess.flowOperatorPermissions,
              overrides: arg.overrides,
            }),
          });
        }

        if (!editedAccess.tokenAllowance.eq(initialAccess.tokenAllowance)) {
          // # ERC-20 allowance ("token allowance")
          const superTokenContract = SuperToken__factory.connect(
            superToken.address,
            signer
          );

          const approveAllowancePromise =
            superTokenContract.populateTransaction.approve(
              operatorAddress,
              editedAccess.tokenAllowance
            );

          batchedOperations.push({
            operation: new Operation(approveAllowancePromise, "ERC20_APPROVE"),
            title: "Update Token Allowance",
          });
        }

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
          signerAddress: signerAddress,
          title: "Update Permission and Allowances",
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
          initialAccess,
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

        if (
          !initialAccess.flowRateAllowance.amountEther.isZero() ||
          initialAccess.flowOperatorPermissions > 0
        ) {
          batchedOperations.push({
            title: "Revoke FlowOperator Permissions",
            operation: await superToken.revokeFlowOperatorWithFullControl({
              flowOperator: operatorAddress,
            }),
          });
        }

        if (!initialAccess.tokenAllowance.isZero()) {
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
            title: "Revoke Token Allowance",
          });
        }

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
          signerAddress: signerAddress,
          title: "Revoke Access",
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
