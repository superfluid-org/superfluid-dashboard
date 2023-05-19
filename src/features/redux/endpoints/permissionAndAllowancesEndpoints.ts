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
import { PermissionAndAllowancesProps } from "../../permissionAndAllowances/PermissionAndAllowancesRow";
export const MAX_VESTING_DURATION_IN_YEARS = 10;
export const MAX_VESTING_DURATION_IN_SECONDS =
  MAX_VESTING_DURATION_IN_YEARS * UnitOfTime.Year;

interface UpdatePermissionAndAllowancesMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  initialPermissionAndAllowances: PermissionAndAllowancesProps
  editedPermissionAndAllowances: PermissionAndAllowancesProps
}

interface RevokePermissionAndAllowancesMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  permissionAndAllowances: PermissionAndAllowancesProps
}

export const permissionAndAllowancesMutationEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    updatePermissionAndAllowances: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      UpdatePermissionAndAllowancesMutation
    >({
      queryFn: async (
        {
          signer,
          chainId,
          superTokenAddress,
          operatorAddress,
          initialPermissionAndAllowances,
          editedPermissionAndAllowances,
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

        if (!editedPermissionAndAllowances.flowRateAllowance.amountEther.eq(initialPermissionAndAllowances.flowRateAllowance.amountEther) ||
          editedPermissionAndAllowances.flowOperatorPermissions !== initialPermissionAndAllowances.flowOperatorPermissions ||
          editedPermissionAndAllowances.flowRateAllowance.unitOfTime !== initialPermissionAndAllowances.flowRateAllowance.unitOfTime) {

          const flowRateAllowance = editedPermissionAndAllowances.flowRateAllowance.unitOfTime === UnitOfTime.Second 
                          ? editedPermissionAndAllowances.flowRateAllowance.amountEther 
                          : editedPermissionAndAllowances.flowRateAllowance.amountEther
                                        .div(editedPermissionAndAllowances.flowRateAllowance.unitOfTime);

          batchedOperations.push({
            title: "Update FlowOperator Permissions",
            operation: await superToken.updateFlowOperatorPermissions({
              flowOperator: operatorAddress,
              flowRateAllowance: flowRateAllowance.toString(),
              permissions: editedPermissionAndAllowances.flowOperatorPermissions,
              overrides: arg.overrides,
            }),
          });
        }


        if (!editedPermissionAndAllowances.tokenAllowance.eq(initialPermissionAndAllowances.tokenAllowance)) {
          // # ERC-20 allowance ("token allowance")
          const superTokenContract = SuperToken__factory.connect(
            superToken.address,
            signer
          );

          const approveAllowancePromise = superTokenContract.populateTransaction.approve(
            operatorAddress,
            editedPermissionAndAllowances.tokenAllowance
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
    revokePermissionAndAllowances: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      RevokePermissionAndAllowancesMutation
    >({
      queryFn: async (
        {
          signer,
          chainId,
          superTokenAddress,
          operatorAddress,
          permissionAndAllowances,
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



        if (!permissionAndAllowances.flowRateAllowance.amountEther.isZero() || permissionAndAllowances.flowOperatorPermissions > 0) {
          batchedOperations.push({
            title: "Revoke FlowOperator Permissions",
            operation: await superToken.revokeFlowOperatorWithFullControl({
              flowOperator: operatorAddress,
            }),
          });
        }

        if (!permissionAndAllowances.tokenAllowance.isZero()) {
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


