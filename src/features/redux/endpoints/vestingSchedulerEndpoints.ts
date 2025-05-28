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
import { getVestingScheduler, VestingSchedulerType } from "../../../eth-sdk/getEthSdk";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../../utils/isCloseToUnlimitedAllowance";
import { UnitOfTime } from "../../send/FlowRateInput";
import { getUnixTime } from "date-fns";
import { getMaximumNeededTokenAllowance } from "../../vesting/VestingSchedulesAllowancesTable/calculateRequiredAccessForActiveVestingSchedule";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { resolvedWagmiClients } from "../../wallet/wagmiConfig";
import { vestingSchedulerAbi, vestingSchedulerAddress, vestingSchedulerV2Abi, vestingSchedulerV2Address, vestingSchedulerV3Abi, vestingSchedulerV3Address } from "../../../generated";
import { getClaimPeriodInSeconds, getClaimValidityDate } from "../../vesting/claimPeriod";
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION, ACL_UPDATE_PERMISSION } from "../../../utils/constants";
import { VestingVersion } from "../../network/networkConstants";

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
  claimEnabled: boolean;
  version: "v3";
}

export interface CreateVestingScheduleFromAmountAndDuration
  extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffPeriodInSeconds: number;
  cliffTransferAmountWei: string;
  totalDurationInSeconds: number;
  totalAmountWei: string;
  claimEnabled: boolean;
  version: "v3";
}

export interface ClaimVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  version: "v2" | "v3";
}

export interface DeleteVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  deleteFlow: boolean;
  version: VestingVersion;
}

interface GetVestingSchedule extends BaseQuery<RpcVestingSchedule | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  version: VestingVersion;
}

interface RpcVestingSchedule {
  endDateTimestamp: number;
  claimValidityDate: number;
  isClaimable: boolean;
}

interface FixAccessForVestingMutation extends BaseSuperTokenMutation {
  senderAddress: string;
  requiredTokenAllowanceWei: string;
  requiredFlowOperatorPermissions: number;
  requiredFlowRateAllowanceWei: string;
  version: VestingVersion;
}

export const createVestingScheduleEndpoint = (builder: RpcEndpointBuilder) => ({
  createVestingSchedule: builder.mutation<
    TransactionInfo & { subTransactionTitles: TransactionTitle[] },
    CreateVestingSchedule
  >({
    queryFn: async (
      { chainId, signer, superTokenAddress, senderAddress, version, ...arg },
      { dispatch }
    ) => {
      const vestingScheduler = getVestingScheduler(chainId, signer, version);

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

      const claimValidityDate = getClaimValidityDate({
        claimEnabled: arg.claimEnabled,
        endDateTimestamp: arg.endDateTimestamp,
        chainId,
      });

      const network = findNetworkOrThrow(allNetworks, chainId);
      const contractInfo = network.vestingContractAddress[version];
      if (!contractInfo) {
        throw new Error("Vesting contract not supported on this network");
      }
      const END_DATE_VALID_BEFORE_IN_SECONDS = contractInfo.END_DATE_VALID_BEFORE_IN_SECONDS;
      const START_DATE_VALID_AFTER_IN_SECONDS = contractInfo.START_DATE_VALID_AFTER_IN_SECONDS;

      const [
        flowOperatorData,
        existingTokenAllowance,
      ] = await Promise.all([
        superToken.getFlowOperatorData({
          flowOperator: vestingScheduler.address,
          sender: senderAddress,
          providerOrSigner: signer,
        }),
        superTokenContract.allowance(senderAddress, vestingScheduler.address)
      ]);

      const cliffAndFlowDate = arg.cliffDateTimestamp
        ? arg.cliffDateTimestamp
        : arg.startDateTimestamp;

      const maximumNeededTokenAllowance = getMaximumNeededTokenAllowance({
        END_DATE_VALID_BEFORE_IN_SECONDS,
        START_DATE_VALID_AFTER_IN_SECONDS,
        schedule: {
          cliffAndFlowDate: cliffAndFlowDate,
          endDate: arg.endDateTimestamp,
          cliffAndFlowExecutedAt: arg.cliffDateTimestamp,
          flowRate: arg.flowRateWei,
          cliffAmount: arg.cliffTransferAmountWei,
          claimValidityDate: claimValidityDate ?? 0,
          remainderAmount: "0", // No remainder amount with this function (i.e. the one without amounts and durations)
        }
      });

      const existingPermissions = Number(flowOperatorData.permissions);
      // Update is not required but recommended
      const permissionsDelta = ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION | ACL_UPDATE_PERMISSION;
      const newPermissions = existingPermissions | permissionsDelta;

      const flowRateBigNumber = BigNumber.from(arg.flowRateWei);
      const existingFlowRateAllowance = BigNumber.from(
        flowOperatorData.flowRateAllowance
      );
      const flowRateAllowanceDelta = isCloseToUnlimitedFlowRateAllowance(
        existingFlowRateAllowance
      )
        ? BigNumber.from("0")
        : existingFlowRateAllowance.add(flowRateBigNumber);
      const newFlowRateAllowance = existingFlowRateAllowance.add(
        flowRateAllowanceDelta
      );

      const hasEnoughSuperTokenAccess =
        existingPermissions === newPermissions &&
        existingFlowRateAllowance.eq(newFlowRateAllowance);

      if (!hasEnoughSuperTokenAccess) {
        subOperations.push({
          operation: await superToken.increaseFlowRateAllowanceWithPermissions({
            flowOperator: vestingScheduler.address,
            flowRateAllowanceDelta: flowRateAllowanceDelta.toString(),
            permissionsDelta: permissionsDelta,
            overrides: arg.overrides,
          }),
          title: "Approve Vesting Scheduler",
        });
      }

      const tokenAllowanceDelta = isCloseToUnlimitedTokenAllowance(
        existingTokenAllowance
      )
        ? BigNumber.from("0")
        : maximumNeededTokenAllowance;
      const newTokenAllowance = existingTokenAllowance.add(tokenAllowanceDelta);

      const hasEnoughTokenAllowance =
        existingTokenAllowance.eq(newTokenAllowance);

      if (!hasEnoughTokenAllowance) {
        const approveAllowancePromise =
          superTokenContract.populateTransaction.increaseAllowance(
            vestingScheduler.address,
            tokenAllowanceDelta
          );
        subOperations.push({
          operation: new Operation(
            approveAllowancePromise,
            "ERC20_INCREASE_ALLOWANCE"
          ),
          title: "Approve Allowance",
        });
      }

      const createVestingSchedule = getVestingScheduler(
        chainId,
        signer,
        version
      ).populateTransaction[
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"
      ](
        superTokenAddress,
        arg.receiverAddress,
        arg.startDateTimestamp,
        arg.cliffDateTimestamp,
        arg.flowRateWei,
        arg.cliffTransferAmountWei,
        arg.endDateTimestamp,
        claimValidityDate ?? 0
      )

      subOperations.push({
        operation: new Operation(
          createVestingSchedule,
          'ERC2771_FORWARD_CALL'
        ),
        title: "Create Vesting Schedule"
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
  createVestingScheduleFromAmountAndDuration: builder.mutation<
    TransactionInfo & {
      subTransactionTitles: TransactionTitle[];
    },
    CreateVestingScheduleFromAmountAndDuration
  >({
    queryFn: async (
      { chainId, signer, superTokenAddress, senderAddress, version, ...arg },
      { dispatch }
    ) => {
      const vestingScheduler = getVestingScheduler(chainId, signer, version);

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

      const claimPeriodInSeconds = getClaimPeriodInSeconds({
        claimEnabled: arg.claimEnabled,
        totalDurationInSeconds: arg.totalDurationInSeconds,
        chainId,
      });

      const [flowOperatorData, existingTokenAllowance, params] =
        await Promise.all([
          superToken.getFlowOperatorData({
            flowOperator: vestingScheduler.address,
            sender: senderAddress,
            providerOrSigner: signer,
          }),
          superTokenContract.allowance(senderAddress, vestingScheduler.address),
          vestingScheduler["mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"](
            superTokenAddress,
            senderAddress,
            arg.receiverAddress,
            arg.totalAmountWei,
            arg.totalDurationInSeconds,
            arg.startDateTimestamp,
            arg.cliffPeriodInSeconds,
            claimPeriodInSeconds,
            arg.cliffTransferAmountWei
          ),
        ]);

      const maximumNeededTokenAllowance =
        await vestingScheduler["getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"]({
          cliffAndFlowDate: params.cliffDate
            ? params.cliffDate
            : params.startDate,
          endDate: params.endDate,
          cliffAmount: params.cliffAmount,
          flowRate: params.flowRate,
          remainderAmount: params.remainderAmount,
          claimValidityDate: params.claimValidityDate
        });

      const existingPermissions = Number(flowOperatorData.permissions);
      // Update is not required but recommended
      const permissionsDelta = ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION | ACL_UPDATE_PERMISSION;
      const newPermissions = existingPermissions | permissionsDelta;

      const flowRateBigNumber = BigNumber.from(params.flowRate);
      const existingFlowRateAllowance = BigNumber.from(
        flowOperatorData.flowRateAllowance
      );
      const flowRateAllowanceDelta = isCloseToUnlimitedFlowRateAllowance(
        existingFlowRateAllowance
      )
        ? BigNumber.from("0")
        : existingFlowRateAllowance.add(flowRateBigNumber);
      const newFlowRateAllowance = existingFlowRateAllowance.add(
        flowRateAllowanceDelta
      );

      const hasEnoughSuperTokenAccess =
        existingPermissions === newPermissions &&
        existingFlowRateAllowance.eq(newFlowRateAllowance);

      if (!hasEnoughSuperTokenAccess) {
        subOperations.push({
          operation: await superToken.increaseFlowRateAllowanceWithPermissions({
            flowOperator: vestingScheduler.address,
            flowRateAllowanceDelta: flowRateAllowanceDelta.toString(),
            permissionsDelta: permissionsDelta,
            overrides: arg.overrides,
          }),
          title: "Approve Vesting Scheduler",
        });
      }

      const tokenAllowanceDelta = isCloseToUnlimitedTokenAllowance(
        existingTokenAllowance
      )
        ? BigNumber.from("0")
        : maximumNeededTokenAllowance;
      const newTokenAllowance = existingTokenAllowance.add(tokenAllowanceDelta);

      const hasEnoughTokenAllowance =
        existingTokenAllowance.eq(newTokenAllowance);

      if (!hasEnoughTokenAllowance) {
        const approveAllowancePromise =
          superTokenContract.populateTransaction.increaseAllowance(
            vestingScheduler.address,
            tokenAllowanceDelta
          );
        subOperations.push({
          operation: new Operation(
            approveAllowancePromise,
            "ERC20_INCREASE_ALLOWANCE"
          ),
          title: "Approve Allowance",
        });
      }

      const createVestingSchedule = vestingScheduler.populateTransaction[
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"
      ](
        superTokenAddress,
        arg.receiverAddress,
        arg.totalAmountWei,
        arg.totalDurationInSeconds,
        arg.startDateTimestamp,
        arg.cliffPeriodInSeconds,
        claimPeriodInSeconds,
        arg.cliffTransferAmountWei
      );

      subOperations.push({
        operation: new Operation(
          createVestingSchedule,
          'ERC2771_FORWARD_CALL'
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
        }
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
          transactionExtraData,
          version,
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);
        const vestingScheduler = getVestingScheduler(chainId, signer, version);

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
          title: `Fix Access for Vesting (${version})`,
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
          version
        },
        { dispatch }
      ) => {
        const vestingScheduler = getVestingScheduler(chainId, signer, version);
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

        if (version === "v3") {
          const deleteVestingSchedule =
            (vestingScheduler as VestingSchedulerType<"v3">).populateTransaction.deleteVestingSchedule(
              superTokenAddress,
              receiverAddress,
              overrides
            );
          batchedOperations.push({
            operation: new Operation(
              deleteVestingSchedule,
              'ERC2771_FORWARD_CALL'
            ),
            title: "Delete Vesting Schedule",
          });
        } else {
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
        }

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
    claimVestingSchedule: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      ClaimVestingSchedule
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
          version
        },
        { dispatch }
      ) => {
        const vestingScheduler = getVestingScheduler(chainId, signer, version);
        const signerAddress = await signer.getAddress();

        const batchedOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const transactionResponse = await vestingScheduler.executeCliffAndFlow(
          superTokenAddress,
          senderAddress,
          receiverAddress
        );

        const subTransactionTitles = batchedOperations.map((x) => x.title);

        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signerAddress,
          title: "Claim Vesting Schedule",
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
      { chainId: number; version: VestingVersion }
    >({
      keepUnusedDataFor: 3600,
      extraOptions: {
        maxRetries: 10,
      },
      queryFn: async ({ chainId, version }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        const contractInfo = network.vestingContractAddress[version];
        if (!contractInfo) {
          throw new Error("Vesting contract not supported on this network");
        }
        const MIN_VESTING_DURATION_IN_SECONDS = contractInfo.MIN_VESTING_DURATION_IN_SECONDS;
        const END_DATE_VALID_BEFORE_IN_SECONDS = contractInfo.END_DATE_VALID_BEFORE_IN_SECONDS;
        const START_DATE_VALID_AFTER_IN_SECONDS = contractInfo.START_DATE_VALID_AFTER_IN_SECONDS;
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
      {
        chainId: number;
        tokenAddress: string;
        senderAddress: string;
        version: VestingVersion;
      }
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
      queryFn: async ({ chainId, tokenAddress, senderAddress, version }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(tokenAddress);
        const vestingScheduler = getVestingScheduler(
          chainId,
          framework.settings.provider,
          version
        );

        const tokenAllowance = await superToken.allowance({
          owner: senderAddress,
          spender: vestingScheduler.address,
          providerOrSigner: framework.settings.provider,
        });

        const { flowRateAllowance, permissions: flowOperatorPermissions } =
          await superToken.getFlowOperatorData({
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
        version,
      }) => {
        const publicClient = resolvedWagmiClients[chainId]();

        const abi = version === "v3" ? vestingSchedulerV3Abi : version === "v2" ? vestingSchedulerV2Abi : vestingSchedulerAbi;
        const address = version === "v3" 
          ? vestingSchedulerV3Address[chainId as keyof typeof vestingSchedulerV3Address] 
          : version === "v2" 
          ? vestingSchedulerV2Address[chainId as keyof typeof vestingSchedulerV2Address] 
          : vestingSchedulerAddress[chainId as keyof typeof vestingSchedulerAddress];

        const rpcVestingSchedule = await publicClient.readContract({
          abi,
          address,
          functionName: "getVestingSchedule",
          args: [superTokenAddress as `0x${string}`, senderAddress as `0x${string}`, receiverAddress as `0x${string}`],
        });

        // TODO: Use viem here
        const rpcVestingScheduleNormalized = {
          claimValidityDate: 0n,
          ...(rpcVestingSchedule),
        };

        const unixNow = BigInt(getUnixTime(new Date()));

        const mappedVestingSchedule =
          rpcVestingScheduleNormalized.endDate > 0
            ? {
                endDateTimestamp: rpcVestingScheduleNormalized.endDate,
                claimValidityDate: Number(rpcVestingScheduleNormalized.claimValidityDate) ?? null,
                isClaimable:
                  !!rpcVestingScheduleNormalized.cliffAndFlowDate &&
                  !!rpcVestingScheduleNormalized.claimValidityDate &&
                  rpcVestingScheduleNormalized.cliffAndFlowDate < unixNow &&
                  unixNow < rpcVestingScheduleNormalized.claimValidityDate,
              }
            : null;

        return {
          data: mappedVestingSchedule,
        };
      },
    }),
  })
};
