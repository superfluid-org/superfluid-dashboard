import { useCallback } from "react";
import { OPERATION_TYPE } from "@sfpro/sdk/constant";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import {
  legacyVestingSchedulerV1Abi,
  legacyVestingSchedulerV1Address,
  legacyVestingSchedulerV2Abi,
  legacyVestingSchedulerV2Address,
  vestingSchedulerV3Abi,
  vestingSchedulerV3Address,
} from "@sfpro/sdk/abi/automation";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { Address, encodeFunctionData } from "viem";
import { useAccount } from "@/hooks/useAccount";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
  ACL_UPDATE_PERMISSION,
} from "../../utils/constants";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../utils/isCloseToUnlimitedAllowance";
import { ViemFeeOverrides } from "../transactions/viemFeeOverrides";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { VestingVersion } from "../network/networkConstants";
import {
  buildClaimVestingSchedulePendingUpdate,
  buildCreateVestingScheduleFromAmountAndDurationPendingUpdate,
  buildDeleteVestingSchedulePendingUpdate,
  buildExecuteBatchVestingPendingUpdates,
} from "../pendingUpdates/buildPendingUpdates";
import {
  getErc20Allowance,
  getFlowOperatorData,
} from "../transactions/contractReads";
import {
  SubOperation,
  agreementCallSubOperation,
  appActionSubOperation,
  cfaForwarderWriteFragment,
  contractCallSubOperation,
  getContractAddress,
  subOperationsWriteFragment,
} from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";
import { resolvedWagmiClients } from "../wallet/WagmiManager";
import { getClaimPeriodInSeconds } from "./claimPeriod";
import {
  VestingScheduleFromAmountAndDurationsParams,
  convertVestingScheduleFromAmountAndDurationsToAbsolutes,
} from "./batch/VestingScheduleParams";
import { calculateRequiredAccessForActiveVestingSchedule } from "./VestingSchedulesAllowancesTable/calculateRequiredAccessForActiveVestingSchedule";

export function getVestingSchedulerContractInfo(
  chainId: number,
  version: VestingVersion
): { abi: typeof vestingSchedulerV3Abi | typeof legacyVestingSchedulerV1Abi | typeof legacyVestingSchedulerV2Abi; address: Address; version: VestingVersion } {
  switch (version) {
    case "v3":
      return {
        abi: vestingSchedulerV3Abi,
        address: getContractAddress(
          vestingSchedulerV3Address,
          chainId,
          "VestingSchedulerV3"
        ),
        version,
      };
    case "v2":
      return {
        abi: legacyVestingSchedulerV2Abi,
        address: getContractAddress(
          legacyVestingSchedulerV2Address,
          chainId,
          "VestingSchedulerV2"
        ),
        version,
      };
    case "v1":
      return {
        abi: legacyVestingSchedulerV1Abi,
        address: getContractAddress(
          legacyVestingSchedulerV1Address,
          chainId,
          "VestingScheduler"
        ),
        version,
      };
  }
}

/** "Approve Vesting Scheduler" — CFA `increaseFlowRateAllowanceWithPermissions` agreement op. */
const approveVestingSchedulerSubOperation = (params: {
  chainId: number;
  superTokenAddress: string;
  vestingSchedulerAddress: Address;
  permissionsDelta: number;
  flowRateAllowanceDelta: bigint;
}): SubOperation =>
  agreementCallSubOperation({
    chainId: params.chainId,
    agreementAddress: getContractAddress(cfaAddress, params.chainId, "CFAv1"),
    callData: encodeFunctionData({
      abi: cfaAbi,
      functionName: "increaseFlowRateAllowanceWithPermissions",
      args: [
        params.superTokenAddress as Address,
        params.vestingSchedulerAddress,
        params.permissionsDelta,
        params.flowRateAllowanceDelta,
        "0x",
      ],
    }),
    title: "Approve Vesting Scheduler",
  });

interface CreateVestingScheduleFromAmountAndDurationArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffPeriodInSeconds: number;
  cliffTransferAmountWei: string;
  totalDurationInSeconds: number;
  totalAmountWei: string;
  claimEnabled: boolean;
  version: "v3";
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Create a vesting schedule from a total amount and duration, including the needed flow
 * operator permissions and token allowance increases, batched via Host `batchCall`.
 * Drop-in replacement for `rpcApi.useCreateVestingScheduleFromAmountAndDurationMutation()`.
 */
export function useCreateVestingScheduleFromAmountAndDuration() {
  const { write, result } = useSuperfluidWriteContract();

  const createVestingSchedule = useCallback(
    (arg: CreateVestingScheduleFromAmountAndDurationArgs) =>
      // Preflight reads & op-building run inside the builder so failures surface
      // through `result` (dialog) and `isLoading` covers them.
      write(async () => {
      const { chainId, version } = arg;
      const scheduler = getVestingSchedulerContractInfo(chainId, version);
      const publicClient = resolvedWagmiClients[chainId]();

      const claimPeriodInSeconds = getClaimPeriodInSeconds({
        claimEnabled: arg.claimEnabled,
        totalDurationInSeconds: arg.totalDurationInSeconds,
        chainId,
      });

      const [flowOperatorData, existingTokenAllowance, params] =
        await Promise.all([
          getFlowOperatorData({
            chainId,
            superTokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            flowOperatorAddress: scheduler.address,
          }),
          getErc20Allowance({
            chainId,
            tokenAddress: arg.superTokenAddress,
            ownerAddress: arg.senderAddress,
            spenderAddress: scheduler.address,
          }),
          publicClient.readContract({
            abi: vestingSchedulerV3Abi,
            address: scheduler.address,
            functionName: "mapCreateVestingScheduleParams",
            args: [
              arg.superTokenAddress as Address,
              arg.senderAddress as Address,
              arg.receiverAddress as Address,
              BigInt(arg.totalAmountWei),
              arg.totalDurationInSeconds,
              arg.startDateTimestamp,
              arg.cliffPeriodInSeconds,
              claimPeriodInSeconds,
              BigInt(arg.cliffTransferAmountWei),
            ],
          }),
        ]);

      const maximumNeededTokenAllowance = await publicClient.readContract({
        abi: vestingSchedulerV3Abi,
        address: scheduler.address,
        functionName: "getMaximumNeededTokenAllowance",
        args: [
          {
            cliffAndFlowDate: params.cliffDate ? params.cliffDate : params.startDate,
            endDate: params.endDate,
            flowRate: params.flowRate,
            cliffAmount: params.cliffAmount,
            remainderAmount: params.remainderAmount,
            claimValidityDate: params.claimValidityDate,
          },
        ],
      });

      const subOperations: SubOperation[] = [];

      const existingPermissions = flowOperatorData.permissions;
      // Update is not required but recommended
      const permissionsDelta =
        ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION | ACL_UPDATE_PERMISSION;
      const newPermissions = existingPermissions | permissionsDelta;

      const existingFlowRateAllowance = flowOperatorData.flowRateAllowanceWei;
      const flowRateAllowanceDelta = isCloseToUnlimitedFlowRateAllowance(
        existingFlowRateAllowance
      )
        ? 0n
        : existingFlowRateAllowance + params.flowRate;
      const newFlowRateAllowance =
        existingFlowRateAllowance + flowRateAllowanceDelta;

      const hasEnoughSuperTokenAccess =
        existingPermissions === newPermissions &&
        existingFlowRateAllowance === newFlowRateAllowance;

      if (!hasEnoughSuperTokenAccess) {
        subOperations.push(
          approveVestingSchedulerSubOperation({
            chainId,
            superTokenAddress: arg.superTokenAddress,
            vestingSchedulerAddress: scheduler.address,
            permissionsDelta,
            flowRateAllowanceDelta,
          })
        );
      }

      const tokenAllowanceDelta = isCloseToUnlimitedTokenAllowance(
        existingTokenAllowance
      )
        ? 0n
        : maximumNeededTokenAllowance;
      const hasEnoughTokenAllowance = tokenAllowanceDelta === 0n;

      if (!hasEnoughTokenAllowance) {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC20_INCREASE_ALLOWANCE,
            target: arg.superTokenAddress as Address,
            abi: superTokenAbi,
            functionName: "increaseAllowance",
            args: [scheduler.address, tokenAllowanceDelta],
            title: "Approve Allowance",
          })
        );
      }

      subOperations.push(
        contractCallSubOperation({
          operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
          target: scheduler.address,
          abi: vestingSchedulerV3Abi,
          functionName: "createVestingScheduleFromAmountAndDuration",
          args: [
            arg.superTokenAddress as Address,
            arg.receiverAddress as Address,
            BigInt(arg.totalAmountWei),
            arg.totalDurationInSeconds,
            arg.startDateTimestamp,
            arg.cliffPeriodInSeconds,
            claimPeriodInSeconds,
            BigInt(arg.cliffTransferAmountWei),
          ],
          title: "Create Vesting Schedule",
        })
      );

      const subTransactionTitles = subOperations.map((x) => x.title);

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations, {
          forceBatch: true,
        }),
        title: "Create Vesting Schedule" as const,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildCreateVestingScheduleFromAmountAndDurationPendingUpdate(hash, {
            chainId,
            superTokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            receiverAddress: arg.receiverAddress,
            startDateTimestamp: arg.startDateTimestamp,
            totalDurationInSeconds: arg.totalDurationInSeconds,
            cliffPeriodInSeconds: arg.cliffPeriodInSeconds,
            totalAmountWei: arg.totalAmountWei,
            version,
          }),
      };
      }),
    [write]
  );

  return [createVestingSchedule, result] as const;
}

interface DeleteVestingScheduleArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  deleteFlow: boolean;
  version: VestingVersion;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Delete a vesting schedule, optionally closing the active stream in the same transaction.
 * Drop-in replacement for `rpcApi.useDeleteVestingScheduleMutation()`.
 */
export function useDeleteVestingSchedule() {
  const { write, result } = useSuperfluidWriteContract();

  const deleteVestingSchedule = useCallback(
    (arg: DeleteVestingScheduleArgs) =>
      write(() => {
      const { chainId, version } = arg;
      const scheduler = getVestingSchedulerContractInfo(chainId, version);

      const subOperations: SubOperation[] = [];

      if (arg.deleteFlow) {
        subOperations.push(
          agreementCallSubOperation({
            chainId,
            agreementAddress: getContractAddress(cfaAddress, chainId, "CFAv1"),
            callData: encodeFunctionData({
              abi: cfaAbi,
              functionName: "deleteFlow",
              args: [
                arg.superTokenAddress as Address,
                arg.senderAddress as Address,
                arg.receiverAddress as Address,
                "0x",
              ],
            }),
            direct: cfaForwarderWriteFragment(chainId, "deleteFlow", [
              arg.superTokenAddress as Address,
              arg.senderAddress as Address,
              arg.receiverAddress as Address,
              "0x", // userData
            ]),
            title: "Close Stream",
          })
        );
      }

      if (version === "v3") {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "deleteVestingSchedule",
            args: [
              arg.superTokenAddress as Address,
              arg.receiverAddress as Address,
            ],
            title: "Delete Vesting Schedule",
          })
        );
      } else {
        // v1/v2 schedulers are Super Apps: deletion goes through `host.callAppAction`.
        subOperations.push(
          appActionSubOperation({
            chainId,
            appAddress: scheduler.address,
            callData: encodeFunctionData({
              abi:
                version === "v2"
                  ? legacyVestingSchedulerV2Abi
                  : legacyVestingSchedulerV1Abi,
              functionName: "deleteVestingSchedule",
              args: [
                arg.superTokenAddress as Address,
                arg.receiverAddress as Address,
                "0x",
              ],
            }),
            title: "Delete Vesting Schedule",
          })
        );
      }

      const subTransactionTitles = subOperations.map((x) => x.title);

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations),
        title: "Delete Vesting Schedule" as const,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildDeleteVestingSchedulePendingUpdate(hash, {
            chainId,
            superTokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            receiverAddress: arg.receiverAddress,
            version,
          }),
      };
      }),
    [write]
  );

  return [deleteVestingSchedule, result] as const;
}

interface ClaimVestingScheduleArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  version: "v2" | "v3";
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Claim a claimable vesting schedule (`executeCliffAndFlow`). Drop-in replacement for
 * `rpcApi.useClaimVestingScheduleMutation()`.
 */
export function useClaimVestingSchedule() {
  const { write, result } = useSuperfluidWriteContract();

  const claimVestingSchedule = useCallback(
    (arg: ClaimVestingScheduleArgs) =>
      write(() => {
        const { chainId, version } = arg;
        const scheduler = getVestingSchedulerContractInfo(chainId, version);

        return {
          chainId,
          abi: scheduler.abi,
          address: scheduler.address,
          functionName: "executeCliffAndFlow",
          args: [
            arg.superTokenAddress as Address,
            arg.senderAddress as Address,
            arg.receiverAddress as Address,
          ],
          title: "Claim Vesting Schedule" as const,
          subTransactionTitles: [],
          extraData: arg.transactionExtraData,
          overrides: arg.overrides,
          simulate: arg.simulate,
          getPendingUpdates: (hash: string) =>
            buildClaimVestingSchedulePendingUpdate(hash, {
              chainId,
              superTokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
              version,
            }),
        };
      }),
    [write]
  );

  return [claimVestingSchedule, result] as const;
}

interface FixAccessForVestingArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  requiredTokenAllowanceWei: string;
  requiredFlowOperatorPermissions: number;
  requiredFlowRateAllowanceWei: string;
  version: VestingVersion;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Top up the flow operator permissions / allowances a vesting schedule needs for execution.
 * Drop-in replacement for `rpcApi.useFixAccessForVestingMutation()`.
 */
export function useFixAccessForVesting() {
  const { write, result } = useSuperfluidWriteContract();

  const fixAccessForVesting = useCallback(
    (arg: FixAccessForVestingArgs) =>
      // Preflight reads & op-building run inside the builder so failures surface
      // through `result` (dialog) and `isLoading` covers them.
      write(async () => {
      const { chainId, version } = arg;
      const scheduler = getVestingSchedulerContractInfo(chainId, version);

      const subOperations: SubOperation[] = [];

      // # Flow Operator Permissions & Flow Rate Allowance
      const flowOperatorData = await getFlowOperatorData({
        chainId,
        superTokenAddress: arg.superTokenAddress,
        senderAddress: arg.senderAddress,
        flowOperatorAddress: scheduler.address,
      });
      const existingPermissions = flowOperatorData.permissions;
      const existingFlowRateAllowance = flowOperatorData.flowRateAllowanceWei;
      const requiredFlowRateAllowance = BigInt(arg.requiredFlowRateAllowanceWei);

      const hasRequiredPermissions =
        existingPermissions & arg.requiredFlowOperatorPermissions;
      const hasRequiredFlowRateAllowance =
        existingFlowRateAllowance >= requiredFlowRateAllowance;

      if (!hasRequiredPermissions || !hasRequiredFlowRateAllowance) {
        const newPermissions = hasRequiredPermissions
          ? existingPermissions
          : existingPermissions | arg.requiredFlowOperatorPermissions;
        const newFlowRateAllowance = hasRequiredFlowRateAllowance
          ? existingFlowRateAllowance
          : requiredFlowRateAllowance;
        subOperations.push(
          agreementCallSubOperation({
            chainId,
            agreementAddress: getContractAddress(cfaAddress, chainId, "CFAv1"),
            callData: encodeFunctionData({
              abi: cfaAbi,
              functionName: "updateFlowOperatorPermissions",
              args: [
                arg.superTokenAddress as Address,
                scheduler.address,
                newPermissions,
                newFlowRateAllowance,
                "0x",
              ],
            }),
            direct: cfaForwarderWriteFragment(
              chainId,
              "updateFlowOperatorPermissions",
              [
                arg.superTokenAddress as Address, // token
                scheduler.address, // flowOperator
                newPermissions, // permissions
                newFlowRateAllowance, // flowrateAllowance
              ]
            ),
            title: "Approve Vesting Scheduler",
          })
        );
      }

      // # ERC-20 allowance ("token allowance")
      const existingTokenAllowance = await getErc20Allowance({
        chainId,
        tokenAddress: arg.superTokenAddress,
        ownerAddress: arg.senderAddress,
        spenderAddress: scheduler.address,
      });
      const requiredTokenAllowance = BigInt(arg.requiredTokenAllowanceWei);
      const hasRequiredTokenAllowance =
        existingTokenAllowance >= requiredTokenAllowance;

      if (!hasRequiredTokenAllowance) {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC20_APPROVE,
            target: arg.superTokenAddress as Address,
            abi: superTokenAbi,
            functionName: "approve",
            args: [scheduler.address, requiredTokenAllowance],
            title: "Approve Allowance",
          })
        );
      }

      const subTransactionTitles = subOperations.map((x) => x.title);

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations),
        title: `Fix Access for Vesting (${version})` as TransactionTitle,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
      };
      }),
    [write]
  );

  return [fixAccessForVesting, result] as const;
}

interface ExecuteBatchVestingArgs {
  chainId: number;
  superTokenAddress: string;
  params: VestingScheduleFromAmountAndDurationsParams[];
  version: "v3";
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Create a batch of vesting schedules with the combined permissions/allowance approvals,
 * all in a single Host `batchCall`. Drop-in replacement for
 * `rpcApi.useExecuteBatchVestingMutation()`.
 */
export function useExecuteBatchVesting() {
  const { write, result } = useSuperfluidWriteContract();
  const { address: accountAddress } = useAccount();

  const executeBatchVesting = useCallback(
    (arg: ExecuteBatchVestingArgs) =>
      write(() => {
      const { chainId, version } = arg;
      const scheduler = getVestingSchedulerContractInfo(chainId, version);
      const network = findNetworkOrThrow(allNetworks, chainId);

      const subOperations: SubOperation[] = [];

      const paramsWithAbsolutes = arg.params.map(
        convertVestingScheduleFromAmountAndDurationsToAbsolutes
      );
      const requiredAllowances = paramsWithAbsolutes.map((x) =>
        calculateRequiredAccessForActiveVestingSchedule(
          {
            cliffAndFlowDate: x.cliffDate ? x.cliffDate : x.startDate,
            ...x,
          },
          {
            START_DATE_VALID_AFTER_IN_SECONDS:
              network.vestingContractAddress.v3!
                .START_DATE_VALID_AFTER_IN_SECONDS,
            END_DATE_VALID_BEFORE_IN_SECONDS:
              network.vestingContractAddress.v3!
                .END_DATE_VALID_BEFORE_IN_SECONDS,
          }
        )
      );

      const totalRequiredTokenAllowance = requiredAllowances.reduce(
        (acc, x) => acc + x.recommendedTokenAllowance,
        0n
      );
      const totalRequiredFlowRateAllowance = requiredAllowances.reduce(
        (acc, x) => acc + x.requiredFlowRateAllowance,
        0n
      );

      subOperations.push(
        approveVestingSchedulerSubOperation({
          chainId,
          superTokenAddress: arg.superTokenAddress,
          vestingSchedulerAddress: scheduler.address,
          permissionsDelta:
            requiredAllowances[0].requiredFlowOperatorPermissions |
            ACL_UPDATE_PERMISSION, // Update is not required but recommended.
          flowRateAllowanceDelta: totalRequiredFlowRateAllowance,
        })
      );

      subOperations.push(
        contractCallSubOperation({
          operationType: OPERATION_TYPE.ERC20_INCREASE_ALLOWANCE,
          target: arg.superTokenAddress as Address,
          abi: superTokenAbi,
          functionName: "increaseAllowance",
          args: [scheduler.address, totalRequiredTokenAllowance],
          title: "Approve Allowance",
        })
      );

      for (const scheduleParams of arg.params) {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "createVestingScheduleFromAmountAndDuration",
            args: [
              arg.superTokenAddress as Address,
              scheduleParams.receiver,
              BigInt(scheduleParams.totalAmount),
              scheduleParams.totalDuration,
              scheduleParams.startDate,
              scheduleParams.cliffPeriod,
              scheduleParams.claimPeriod,
            ],
            title: "Create Vesting Schedule",
          })
        );
      }

      const subTransactionTitles = subOperations.map((x) => x.title);

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations, {
          forceBatch: true,
        }),
        title: "Create Batch of Vesting Schedules" as const,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          accountAddress
            ? buildExecuteBatchVestingPendingUpdates(hash, {
                chainId,
                senderAddress: accountAddress,
                vestingSchedules: arg.params.map((x) => ({
                  superToken: x.superToken,
                  cliffPeriod: x.cliffPeriod,
                  startDate: x.startDate,
                  receiver: x.receiver,
                  totalAmount: x.totalAmount,
                  totalDuration: x.totalDuration,
                })),
                version,
              })
            : [],
      };
      }),
    [write, accountAddress]
  );

  return [executeBatchVesting, result] as const;
}
