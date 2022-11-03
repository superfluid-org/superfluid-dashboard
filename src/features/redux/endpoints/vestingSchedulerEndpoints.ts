import { Operation } from "@superfluid-finance/sdk-core";
import { SuperToken__factory } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  registerNewTransactionAndReturnQueryFnResult,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { getEthSdk } from "../../../eth-sdk/getEthSdk";
import { UnitOfTime } from "../../send/FlowRateInput";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "./streamSchedulerEndpoints";

export const MIN_VESTING_DURATION_SECONDS = 7 * UnitOfTime.Day;
export const START_DATE_VALID_AFTER_SECONDS = 3 * UnitOfTime.Day;
export const END_DATE_VALID_BEFORE_SECONDS = 1 * UnitOfTime.Day;

interface CreateVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffDateTimestamp: number;
  flowRateWei: string;
  endDateTimestamp: number;
  cliffTransferAmountWei: string;
}

interface DeleteVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  receiverAddress: string;
}

interface GetVestingSchedule extends BaseQuery<RpcVestingSchedule | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface RpcVestingSchedule {
  endDateTimestamp: number;
}

export const vestingSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getVestingSchedule: builder.query<
      RpcVestingSchedule | null,
      GetVestingSchedule
    >({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const { vestingScheduler } = getEthSdk(
          chainId,
          framework.settings.provider
        );

        const rawVestingSchedule = await vestingScheduler.getVestingSchedule(
          senderAddress,
          receiverAddress,
          superTokenAddress
        );

        const mappedVestingSchedule = rawVestingSchedule.endDate
          ? {
              endDateTimestamp: rawVestingSchedule.endDate,
            }
          : null;

        return {
          data: mappedVestingSchedule,
        };
      },
    }),
    deleteVestingSchedule: builder.mutation<
      TransactionInfo,
      DeleteVestingSchedule
    >({
      queryFn: async (
        {
          chainId,
          signer,
          superTokenAddress,
          receiverAddress,
          overrides,
          waitForConfirmation,
          transactionExtraData,
        },
        { dispatch }
      ) => {
        const { vestingScheduler } = getEthSdk(chainId, signer);
        const signerAddress = await signer.getAddress();

        const transactionResponse =
          await vestingScheduler.deleteVestingSchedule(
            receiverAddress,
            superTokenAddress,
            [],
            overrides
          );

        return registerNewTransactionAndReturnQueryFnResult({
          transactionResponse,
          chainId,
          dispatch,
          signer: signerAddress,
          title: "Delete Vesting Schedule",
          extraData: transactionExtraData,
          waitForConfirmation: !!waitForConfirmation,
        });
      },
    }),
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
          .add(flowRateBigNumber.mul(START_DATE_VALID_AFTER_SECONDS))
          .add(flowRateBigNumber.mul(END_DATE_VALID_BEFORE_SECONDS));

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
            arg.cliffDateTimestamp,
            arg.flowRateWei,
            arg.cliffTransferAmountWei,
            arg.endDateTimestamp,
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
