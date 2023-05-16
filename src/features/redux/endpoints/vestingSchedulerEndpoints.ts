import { Operation, SuperToken__factory } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../../utils/isCloseToUnlimitedAllowance";
import { UnitOfTime } from "../../send/FlowRateInput";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "./flowSchedulerEndpoints";

export const MAX_VESTING_DURATION_IN_YEARS = 10;
export const MAX_VESTING_DURATION_IN_SECONDS =
  MAX_VESTING_DURATION_IN_YEARS * UnitOfTime.Year;

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
  senderAddress: string;
  receiverAddress: string;
  deleteFlow: boolean;
}

interface GetVestingSchedule extends BaseQuery<RpcVestingSchedule | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface RpcVestingSchedule {
  endDateTimestamp: number;
}

interface FixAccessForVestingMutation extends BaseSuperTokenMutation {
  senderAddress: string;
  requiredTokenAllowanceWei: string;
  requiredFlowOperatorPermissions: number;
  requiredFlowRateAllowanceWei: string;
}

export const createVestingScheduleEndpoint = (builder: RpcEndpointBuilder) => ({
  createVestingSchedule: builder.mutation<
    TransactionInfo & { subTransactionTitles: TransactionTitle[] },
    CreateVestingSchedule
  >({
    queryFn: async (
      { chainId, signer, superTokenAddress, senderAddress, ...arg },
      { dispatch }
    ) => {
      const vestingScheduler = getVestingScheduler(chainId, signer);

      const framework = await getFramework(chainId);
      const superToken = await framework.loadSuperToken(superTokenAddress);

      const subOperations: {
        operation: Operation;
        title: TransactionTitle;
      }[] = [];

      const superTokenContract = SuperToken__factory.connect(
        superToken.address,
        signer
      );

      const [
        flowOperatorData,
        START_DATE_VALID_AFTER_IN_SECONDS,
        END_DATE_VALID_BEFORE_IN_SECONDS,
        existingTokenAllowance,
      ] = await Promise.all([
        superToken.getFlowOperatorData({
          flowOperator: vestingScheduler.address,
          sender: senderAddress,
          providerOrSigner: signer,
        }),
        vestingScheduler.START_DATE_VALID_AFTER(),
        vestingScheduler.END_DATE_VALID_BEFORE(),
        superTokenContract.allowance(senderAddress, vestingScheduler.address),
      ]);

      const existingPermissions = Number(flowOperatorData.permissions);
      const newPermissions =
        existingPermissions | ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION;

      const flowRateBigNumber = BigNumber.from(arg.flowRateWei);
      const existingFlowRateAllowance = BigNumber.from(
        flowOperatorData.flowRateAllowance
      );
      const newFlowRateAllowance = isCloseToUnlimitedFlowRateAllowance(
        existingFlowRateAllowance
      )
        ? existingFlowRateAllowance
        : existingFlowRateAllowance.add(flowRateBigNumber);

      const hasEnoughSuperTokenAccess =
        existingPermissions === newPermissions &&
        existingFlowRateAllowance.eq(newFlowRateAllowance);
      if (!hasEnoughSuperTokenAccess) {
        subOperations.push({
          operation: await superToken.updateFlowOperatorPermissions({
            flowOperator: vestingScheduler.address,
            flowRateAllowance: newFlowRateAllowance.toString(),
            permissions: newPermissions,
            overrides: arg.overrides,
          }),
          title: "Approve Vesting Scheduler",
        });
      }

      const maximumNeededTokenAllowance = BigNumber.from(
        arg.cliffTransferAmountWei
      )
        .add(flowRateBigNumber.mul(START_DATE_VALID_AFTER_IN_SECONDS))
        .add(flowRateBigNumber.mul(END_DATE_VALID_BEFORE_IN_SECONDS));

      const newTokenAllowance = isCloseToUnlimitedTokenAllowance(existingTokenAllowance)
        ? existingTokenAllowance
        : existingTokenAllowance.add(maximumNeededTokenAllowance);

      const hasEnoughTokenAllowance =
        existingTokenAllowance.eq(newTokenAllowance);
      if (!hasEnoughTokenAllowance) {
        const approveAllowancePromise =
          superTokenContract.populateTransaction.approve(
            vestingScheduler.address,
            newTokenAllowance
          );

        subOperations.push({
          operation: new Operation(approveAllowancePromise, "ERC20_APPROVE"),
          title: "Approve Allowance",
        });
      }

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
        signerAddress,
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
});

export const vestingSchedulerMutationEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    ...createVestingScheduleEndpoint(builder),
    fixAccessForVesting: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      FixAccessForVestingMutation
    >({
      queryFn: async (
        {
          signer,
          chainId,
          superTokenAddress,
          senderAddress,
          requiredTokenAllowanceWei,
          requiredFlowOperatorPermissions,
          requiredFlowRateAllowanceWei,
          transactionExtraData
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);
        const vestingScheduler = getVestingScheduler(chainId, signer);

        const batchedOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        // # Flow Operator Permissions & Flow Rate Allowance
        const flowOperatorData = await superToken.getFlowOperatorData({
          flowOperator: vestingScheduler.address,
          sender: senderAddress,
          providerOrSigner: signer,
        });
        const existingPermissions = Number(flowOperatorData.permissions);
        const existingFlowRateAllowance = BigNumber.from(
          flowOperatorData.flowRateAllowance
        );
        const requiredFlowRateAllowance = BigNumber.from(
          requiredFlowRateAllowanceWei
        );

        const hasRequiredPermissions =
          existingPermissions & requiredFlowOperatorPermissions;
        const hasRequiredFlowRateAllowance = existingFlowRateAllowance.gte(
          requiredFlowRateAllowance
        );

        if (!hasRequiredPermissions || !hasRequiredFlowRateAllowance) {
          batchedOperations.push({
            title: "Approve Vesting Scheduler",
            operation: await superToken.updateFlowOperatorPermissions({
              flowOperator: vestingScheduler.address,
              permissions: hasRequiredPermissions
                ? existingPermissions
                : existingPermissions | requiredFlowOperatorPermissions,
              flowRateAllowance: hasRequiredFlowRateAllowance
                ? existingFlowRateAllowance.toString()
                : requiredFlowRateAllowance.toString(),
            }),
          });
        }

        // # ERC-20 allowance ("token allowance")
        const superTokenContract = SuperToken__factory.connect(
          superToken.address,
          signer
        );
        const existingTokenAllowance = await superTokenContract.allowance(
          senderAddress,
          vestingScheduler.address
        );
        const requiredTokenAllowance = BigNumber.from(
          requiredTokenAllowanceWei
        );
        const hasRequiredTokenAllowance = existingTokenAllowance.gte(
          requiredTokenAllowance
        );

        if (!hasRequiredTokenAllowance) {
          const approveAllowancePromise =
            superTokenContract.populateTransaction.approve(
              vestingScheduler.address,
              requiredTokenAllowance
            );
          batchedOperations.push({
            operation: new Operation(approveAllowancePromise, "ERC20_APPROVE"),
            title: "Approve Allowance",
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
          signerAddress,
          title: "Fix Access for Vesting",
          extraData: {
            subTransactionTitles,
            ...(transactionExtraData ?? {}),
          }
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
    deleteVestingSchedule: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      DeleteVestingSchedule
    >({
      queryFn: async (
        {
          chainId,
          signer,
          superTokenAddress,
          senderAddress,
          receiverAddress,
          overrides,
          transactionExtraData,
          deleteFlow,
        },
        { dispatch }
      ) => {
        const vestingScheduler = getVestingScheduler(chainId, signer);
        const signerAddress = await signer.getAddress();
        const framework = await getFramework(chainId);

        const batchedOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        if (deleteFlow) {
          const superToken = await framework.loadSuperToken(superTokenAddress);
          const deleteFlow = superToken.deleteFlow({
            sender: senderAddress,
            receiver: receiverAddress,
          });
          batchedOperations.push({
            operation: deleteFlow,
            title: "Close Stream",
          });
        }

        const deleteVestingSchedule =
          await vestingScheduler.populateTransaction.deleteVestingSchedule(
            superTokenAddress,
            receiverAddress,
            [],
            overrides
          );
        batchedOperations.push({
          operation: await framework.host.callAppAction(
            vestingScheduler.address,
            deleteVestingSchedule.data!
          ),
          title: "Delete Vesting Schedule",
        });

        const executable =
          batchedOperations.length === 1
            ? batchedOperations[0].operation
            : framework.batchCall(batchedOperations.map((x) => x.operation));

        const transactionResponse = await executable.exec(signer);
        const subTransactionTitles = batchedOperations.map((x) => x.title);

        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signerAddress,
          title: "Delete Vesting Schedule",
          extraData: {
            subTransactionTitles,
            ...(transactionExtraData ?? {}),
          }
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

export const vestingSchedulerQueryEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
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
        const vestingScheduler = getVestingScheduler(
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
            MIN_VESTING_DURATION_IN_DAYS: Math.round(
              MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Day
            ),
            MIN_VESTING_DURATION_IN_MINUTES: Math.round(
              MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Minute
            ),
            START_DATE_VALID_AFTER_IN_SECONDS,
            START_DATE_VALID_AFTER_IN_DAYS: Math.round(
              START_DATE_VALID_AFTER_IN_SECONDS / UnitOfTime.Day
            ),
            END_DATE_VALID_BEFORE_IN_SECONDS,
            END_DATE_VALID_BEFORE_IN_DAYS: Math.round(
              END_DATE_VALID_BEFORE_IN_SECONDS / UnitOfTime.Day
            ),
          },
        };
      },
    }),
    getVestingSchedulerAllowances: builder.query<
      {
        tokenAllowance: string;
        flowOperatorPermissions: number;
        flowRateAllowance: string;
      },
      { chainId: number; tokenAddress: string; senderAddress: string }
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
      queryFn: async ({ chainId, tokenAddress, senderAddress }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(tokenAddress);
        const vestingScheduler = getVestingScheduler(
          chainId,
          framework.settings.provider
        );

        const tokenAllowance = await superToken.allowance({
          owner: senderAddress,
          spender: vestingScheduler.address,
          providerOrSigner: framework.settings.provider,
        });

        const {
          flowRateAllowance,
          permissions: flowOperatorPermissions,
        } = await superToken.getFlowOperatorData({
          sender: senderAddress,
          flowOperator: vestingScheduler.address,
          providerOrSigner: framework.settings.provider,
        });

        return {
          data: {
            tokenAllowance,
            flowOperatorPermissions: Number(flowOperatorPermissions),
            flowRateAllowance,
          },
        };
      },
    }),
    getActiveVestingSchedule: builder.query<
      RpcVestingSchedule | null,
      GetVestingSchedule
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const vestingScheduler = getVestingScheduler(
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
  }),
};
