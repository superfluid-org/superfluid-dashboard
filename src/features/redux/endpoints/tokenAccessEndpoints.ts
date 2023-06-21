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

type TokenAccess = {
  flowRateAllowanceWei: string;
  flowOperatorPermissions: number;
  tokenAllowanceWei: string; // Note: no need to account for decimals because 18 always for Super Tokens.
};

interface UpdateAccessMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  initialAccess: TokenAccess;
  editedAccess: TokenAccess;
}

interface RevokeAccessMutation extends BaseSuperTokenMutation {
  operatorAddress: string;
  initialAccess: TokenAccess;
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

        const initalFlowRateAllowance = BigNumber.from(
          initialAccess.flowRateAllowanceWei
        );
        const editedFlowRateAllowance = BigNumber.from(
          editedAccess.flowRateAllowanceWei
        );

        if (
          !initalFlowRateAllowance.eq(editedFlowRateAllowance) ||
          editedAccess.flowOperatorPermissions !==
            initialAccess.flowOperatorPermissions
        ) {
          batchedOperations.push({
            title: "Update Flow Operator Permissions",
            operation: await superToken.updateFlowOperatorPermissions({
              flowOperator: operatorAddress,
              flowRateAllowance: editedFlowRateAllowance.toString(),
              permissions: editedAccess.flowOperatorPermissions,
              overrides: arg.overrides,
            }),
          });
        }

        const initalTokenAllowance = BigNumber.from(
          initialAccess.tokenAllowanceWei
        );
        const editedTokenAllowance = BigNumber.from(
          editedAccess.tokenAllowanceWei
        );
        
        if (!editedTokenAllowance.eq(initalTokenAllowance)) {
          // # ERC-20 allowance ("token allowance")
          const superTokenContract = SuperToken__factory.connect(
            superToken.address,
            signer
          );

          const approveAllowancePromise =
            superTokenContract.populateTransaction.approve(
              operatorAddress,
              editedTokenAllowance
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
          title: "Modify Permissions & Allowances",
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

        const initalFlowRateAllowance = BigNumber.from(
          initialAccess.flowRateAllowanceWei
        );
        if (
          !initalFlowRateAllowance.isZero() ||
          initialAccess.flowOperatorPermissions > 0
        ) {
          batchedOperations.push({
            title: "Revoke Flow Operator",
            operation: await superToken.revokeFlowOperatorWithFullControl({
              flowOperator: operatorAddress,
            }),
          });
        }

        const initalTokenAllowance = BigNumber.from(
          initialAccess.tokenAllowanceWei
        );
        if (!initalTokenAllowance.isZero()) {
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
