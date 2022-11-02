import { Operation } from "@superfluid-finance/sdk-core";
import { SuperToken__factory } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { getEthSdk } from "../../../eth-sdk/getEthSdk";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "./streamSchedulerEndpoints";

interface CreateVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  startDateValidForSeconds: number;
  cliffDateTimestamp: number;
  flowRateWei: string;
  endDateTimestamp: number;
  endDateValidBeforeSeconds: number;
  cliffTransferAmountWei: string;
}

export const vestingSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    createVestingSchedule: builder.mutation<
      TransactionInfo,
      CreateVestingSchedule
    >({
      queryFn: async (
        { chainId, signer, superTokenAddress, senderAddress, ...arg },
        { dispatch }
      ) => {
        const { vestingScheduler } = getEthSdk(chainId, signer);
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const flowOperatorData = await superToken.getFlowOperatorData({
          flowOperator: vestingScheduler.address,
          sender: senderAddress,
          providerOrSigner: signer,
        });

        const existingPermissions = Number(flowOperatorData.permissions);
        const hasDeletePermission = existingPermissions & ACL_DELETE_PERMISSION;
        const hasCreatePermission = existingPermissions & ACL_CREATE_PERMISSION;
        const updatedPermissions =
          existingPermissions +
          (hasDeletePermission ? 0 : ACL_DELETE_PERMISSION) +
          (hasCreatePermission ? 0 : ACL_CREATE_PERMISSION);

        if (existingPermissions !== updatedPermissions) {
          subOperations.push({
            operation: await superToken.updateFlowOperatorPermissions({
              flowOperator: vestingScheduler.address,
              flowRateAllowance: flowOperatorData.flowRateAllowance,
              permissions: updatedPermissions,
              overrides: arg.overrides,
            }),
            title: "Approve Scheduler for End Date",
          });
        }

        const flowRateBigNumber = BigNumber.from(arg.flowRateWei);
        const maximumNeededAllowance = BigNumber.from(
          arg.cliffTransferAmountWei
        )
          .add(flowRateBigNumber.mul(arg.startDateValidForSeconds))
          .add(flowRateBigNumber.mul(arg.endDateValidBeforeSeconds));

        const increaseAllowancePromise = SuperToken__factory.connect(
          superToken.address,
          signer
        ).populateTransaction.increaseAllowance(
          vestingScheduler.address,
          maximumNeededAllowance
        );

        subOperations.push({
          operation: new Operation(increaseAllowancePromise, "ERC20_APPROVE"),
          title: "Increase Allowance",
        });

        const createVestingSchedule =
          await vestingScheduler.populateTransaction.createVestingSchedule(
            arg.receiverAddress,
            superTokenAddress,
            arg.startDateTimestamp,
            arg.startDateValidForSeconds,
            arg.cliffDateTimestamp,
            arg.flowRateWei,
            arg.cliffTransferAmountWei,
            arg.endDateTimestamp,
            arg.endDateValidBeforeSeconds,
            []
          );
        subOperations.push({
          operation: await framework.host.callAppAction(
            vestingScheduler.address,
            createVestingSchedule.data!
          ),
          title: "Create Vesting Schedule",
        });

        const signerAddress = await signer.getAddress();
        const executable = framework.batchCall(
          subOperations.map((x) => x.operation)
        );
        const subTransactionTitles = subOperations.map((x) => x.title);

        const transactionResponse = await executable.exec(signer);

        await registerNewTransaction({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: {
            subTransactionTitles,
            ...(arg.transactionExtraData ?? {}),
          },
          title: "Create Vesting Schedule", // Use a different title here?
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
