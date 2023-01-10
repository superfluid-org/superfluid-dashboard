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
import add from "date-fns/add";
import { BigNumber } from "ethers";
import { getEthSdk } from "../../../eth-sdk/getEthSdk";
import { UnitOfTime } from "../../send/FlowRateInput";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "./flowSchedulerEndpoints";

export const MAX_VESTING_DURATION_IN_YEARS = 10;
export const MAX_VESTING_DURATION_IN_SECONDS =
  MAX_VESTING_DURATION_IN_YEARS * UnitOfTime.Year;

export const MIN_VESTING_START_DATE = add(new Date(), {
  minutes: 15,
});

export const MAX_VESTING_START_DATE = add(new Date(), {
  years: 1,
});

export interface CreateVestingSchedule extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffDateTimestamp: number;
  flowRateWei: string;
  endDateTimestamp: number;
  cliffTransferAmountWei: string;
}

export interface DeleteVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string; // This will be discarded. It's used for getting the "signer" from other parts of Redux. TODO(KK): Handle with a better transaction response.
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
    getActiveVestingSchedule: builder.query<
      RpcVestingSchedule | null,
      GetVestingSchedule
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
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
          superTokenAddress,
          senderAddress,
          receiverAddress
        );

        const mappedVestingSchedule =
          rawVestingSchedule.endDate > 0
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
            superTokenAddress,
            receiverAddress,
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

        const [
          flowOperatorData,
          START_DATE_VALID_AFTER_IN_DAYS,
          END_DATE_VALID_BEFORE_IN_DAYS,
        ] = await Promise.all([
          superToken.getFlowOperatorData({
            flowOperator: vestingScheduler.address,
            sender: senderAddress,
            providerOrSigner: signer,
          }),
          vestingScheduler.START_DATE_VALID_AFTER(),
          vestingScheduler.END_DATE_VALID_BEFORE(),
        ]);
        const START_DATE_VALID_AFTER_IN_SECONDS =
          START_DATE_VALID_AFTER_IN_DAYS * UnitOfTime.Second;
        const END_DATE_VALID_BEFORE_IN_SECONDS =
          END_DATE_VALID_BEFORE_IN_DAYS * UnitOfTime.Second;

        const existingPermissions = Number(flowOperatorData.permissions);
        const hasDeletePermission = existingPermissions & ACL_DELETE_PERMISSION;
        const hasCreatePermission = existingPermissions & ACL_CREATE_PERMISSION;
        const updatedPermissions =
          existingPermissions +
          (hasDeletePermission ? 0 : ACL_DELETE_PERMISSION) +
          (hasCreatePermission ? 0 : ACL_CREATE_PERMISSION);

        const newFlowRateAllowance = BigNumber.from(
          flowOperatorData.flowRateAllowance
        ).add(BigNumber.from(arg.flowRateWei)); // TODO(KK): Need to handle max flow rate allowance overflow.

        subOperations.push({
          operation: await superToken.updateFlowOperatorPermissions({
            flowOperator: vestingScheduler.address,
            flowRateAllowance: newFlowRateAllowance.toString(),
            permissions: updatedPermissions,
            overrides: arg.overrides,
          }),
          title: "Approve Vesting Scheduler",
        });

        const flowRateBigNumber = BigNumber.from(arg.flowRateWei);
        const maximumNeededAllowance = BigNumber.from(
          arg.cliffTransferAmountWei
        )
          .add(flowRateBigNumber.mul(START_DATE_VALID_AFTER_IN_SECONDS))
          .add(flowRateBigNumber.mul(END_DATE_VALID_BEFORE_IN_SECONDS));

        const increaseAllowancePromise = SuperToken__factory.connect(
          superToken.address,
          signer
        ).populateTransaction.increaseAllowance(
          vestingScheduler.address,
          maximumNeededAllowance
        );

        subOperations.push({
          operation: new Operation(increaseAllowancePromise, "ERC20_APPROVE"),
          title: "Approve Allowance",
        });

        const createVestingSchedule =
          await vestingScheduler.populateTransaction.createVestingSchedule(
            superTokenAddress,
            arg.receiverAddress,
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
    getVestingSchedulerConstants: builder.query<
      {
        MIN_VESTING_DURATION_IN_DAYS: number;
        MIN_VESTING_DURATION_IN_MINUTES: number;
        MIN_VESTING_DURATION_IN_SECONDS: number;
        START_DATE_VALID_AFTER_IN_DAYS: number;
        START_DATE_VALID_AFTER_IN_SECONDS: number;
        END_DATE_VALID_BEFORE_IN_DAYS: number;
        END_DATE_VALID_BEFORE_IN_SECONDS: number;
      },
      { chainId: number }
    >({
      keepUnusedDataFor: 3600,
      extraOptions: {
        maxRetries: 10,
      },
      queryFn: async ({ chainId }) => {
        const framework = await getFramework(chainId);
        const { vestingScheduler } = getEthSdk(
          chainId,
          framework.settings.provider
        );
        const [
          MIN_VESTING_DURATION_IN_SECONDS,
          START_DATE_VALID_AFTER_IN_SECONDS,
          END_DATE_VALID_BEFORE_IN_SECONDS,
        ] = await Promise.all([
          vestingScheduler.MIN_VESTING_DURATION(),
          vestingScheduler.START_DATE_VALID_AFTER(),
          vestingScheduler.END_DATE_VALID_BEFORE(),
        ]);
        return {
          data: {
            MIN_VESTING_DURATION_IN_SECONDS,
            MIN_VESTING_DURATION_IN_DAYS: Math.round(MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Day),
            MIN_VESTING_DURATION_IN_MINUTES: Math.round(MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Minute),
            START_DATE_VALID_AFTER_IN_SECONDS,
            START_DATE_VALID_AFTER_IN_DAYS: Math.round(START_DATE_VALID_AFTER_IN_SECONDS / UnitOfTime.Day),
            END_DATE_VALID_BEFORE_IN_SECONDS,
            END_DATE_VALID_BEFORE_IN_DAYS: Math.round(END_DATE_VALID_BEFORE_IN_SECONDS / UnitOfTime.Day)
          },
        };
      },
    }),
  }),
};
