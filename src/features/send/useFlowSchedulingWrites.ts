import { useCallback } from "react";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { flowSchedulerAbi } from "@sfpro/sdk/abi/automation";
import { Address, Hex, encodeFunctionData } from "viem";
import {
  isCloseToUnlimitedFlowRateAllowance,
} from "../../utils/isCloseToUnlimitedAllowance";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "../../utils/constants";
import { ViemFeeOverrides } from "../../utils/ethersOverridesToViem";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import {
  buildDeleteFlowWithSchedulingPendingUpdates,
  buildUpsertFlowWithSchedulingPendingUpdates,
} from "../pendingUpdates/buildPendingUpdates";
import {
  getActiveFlow,
  getFlowOperatorData,
  getFlowSchedule,
} from "../transactions/contractReads";
import {
  SubOperation,
  agreementCallSubOperation,
  appActionSubOperation,
  cfaForwarderWriteFragment,
  getContractAddress,
  subOperationsWriteFragment,
} from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";
import { UnitOfTime } from "./FlowRateInput";

export interface UpsertFlowWithSchedulingArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  flowRateWei: string;
  startTimestamp: number | null;
  endTimestamp: number | null;
  userDataBytes?: Hex;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

export interface DeleteFlowWithSchedulingArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  userDataBytes?: Hex;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Create/update a stream and its start/end schedule in one transaction (CFA agreement calls
 * + flow scheduler app actions, batched via Host `batchCall` when needed). Drop-in
 * replacement for `rpcApi.useUpsertFlowWithSchedulingMutation()` — returns `[trigger, result]`.
 */
export function useUpsertFlowWithScheduling() {
  const { write, result } = useSuperfluidWriteContract();

  const upsertFlowWithScheduling = useCallback(
    (arg: UpsertFlowWithSchedulingArgs) =>
      // Preflight reads & op-building run inside the builder so failures surface
      // through `result` (dialog) and `isLoading` covers them.
      write(async () => {
        const { chainId } = arg;
      const userData: Hex = arg.userDataBytes ?? "0x";
      const shouldScheduleStart = !!arg.startTimestamp;
      const shouldScheduledEnd = !!arg.endTimestamp;
      const shouldSchedule = shouldScheduleStart || shouldScheduledEnd;

      const activeExistingFlow = await getActiveFlow({
        chainId,
        tokenAddress: arg.superTokenAddress,
        senderAddress: arg.senderAddress,
        receiverAddress: arg.receiverAddress,
      });

      const subOperations: SubOperation[] = [];

      const network = findNetworkOrThrow(allNetworks, chainId);
      const cfa = getContractAddress(cfaAddress, chainId, "CFAv1");

      if (network?.flowSchedulerContractAddress) {
        const flowSchedulerAddress =
          network.flowSchedulerContractAddress as Address;

        const existingFlowSchedule = await getFlowSchedule({
          chainId,
          superTokenAddress: arg.superTokenAddress,
          senderAddress: arg.senderAddress,
          receiverAddress: arg.receiverAddress,
        });

        const {
          startDate: existingStartTimestamp,
          endDate: existingEndTimestamp,
          flowRate: existingFlowRate,
        } = existingFlowSchedule;

        if (shouldSchedule) {
          const flowOperatorData = await getFlowOperatorData({
            chainId,
            superTokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            flowOperatorAddress: flowSchedulerAddress,
          });

          const existingFlowRateAllowance =
            flowOperatorData.flowRateAllowanceWei;
          const existingPermissions = flowOperatorData.permissions;

          const permissionsDelta =
            (shouldScheduleStart ? ACL_CREATE_PERMISSION : 0) |
            (shouldScheduledEnd ? ACL_DELETE_PERMISSION : 0);
          const newPermissions = existingPermissions | permissionsDelta;

          const doesNeedAllowance = !activeExistingFlow && arg.startTimestamp;
          const flowRateAllowanceDelta = doesNeedAllowance
            ? BigInt(arg.flowRateWei)
            : 0n;
          const newFlowRateAllowance = isCloseToUnlimitedFlowRateAllowance(
            existingFlowRateAllowance
          )
            ? existingFlowRateAllowance
            : existingFlowRateAllowance + flowRateAllowanceDelta;

          const hasEnoughSuperTokenAccess =
            existingPermissions === newPermissions &&
            existingFlowRateAllowance === newFlowRateAllowance;

          if (!hasEnoughSuperTokenAccess) {
            subOperations.push(
              agreementCallSubOperation({
                chainId,
                agreementAddress: cfa,
                callData: encodeFunctionData({
                  abi: cfaAbi,
                  functionName: "increaseFlowRateAllowanceWithPermissions",
                  args: [
                    arg.superTokenAddress as Address,
                    flowSchedulerAddress,
                    permissionsDelta,
                    flowRateAllowanceDelta,
                    "0x",
                  ],
                }),
                userData,
                title: "Approve Stream Scheduler",
              })
            );
          }

          if (
            arg.startTimestamp !== existingStartTimestamp ||
            arg.endTimestamp !== existingEndTimestamp ||
            (shouldScheduleStart && arg.flowRateWei !== existingFlowRate)
          ) {
            const isModifyingSchedule = !!(
              existingStartTimestamp || existingEndTimestamp
            );

            subOperations.push(
              appActionSubOperation({
                chainId,
                appAddress: flowSchedulerAddress,
                callData: encodeFunctionData({
                  abi: flowSchedulerAbi,
                  functionName: "createFlowSchedule",
                  args: [
                    arg.superTokenAddress as Address,
                    arg.receiverAddress as Address,
                    arg.startTimestamp || 0,
                    shouldScheduleStart ? UnitOfTime.Day * 1 : 0, // startMaxDelay
                    shouldScheduleStart ? BigInt(arg.flowRateWei) : 0n, // flowRate
                    0n, // startAmount
                    arg.endTimestamp || 0,
                    userData,
                    "0x",
                  ],
                }),
                title: isModifyingSchedule ? "Modify Schedule" : "Create Schedule",
              })
            );
          }
        } else if (existingStartTimestamp || existingEndTimestamp) {
          subOperations.push(
            appActionSubOperation({
              chainId,
              appAddress: flowSchedulerAddress,
              callData: encodeFunctionData({
                abi: flowSchedulerAbi,
                functionName: "deleteFlowSchedule",
                args: [
                  arg.superTokenAddress as Address,
                  arg.receiverAddress as Address,
                  "0x",
                ],
              }),
              title: "Delete Schedule",
            })
          );
        }
      }

      if (activeExistingFlow) {
        if (arg.flowRateWei !== activeExistingFlow.flowRateWei) {
          subOperations.push(
            agreementCallSubOperation({
              chainId,
              agreementAddress: cfa,
              callData: encodeFunctionData({
                abi: cfaAbi,
                functionName: "updateFlow",
                args: [
                  arg.superTokenAddress as Address,
                  arg.receiverAddress as Address,
                  BigInt(arg.flowRateWei),
                  "0x",
                ],
              }),
              userData,
              direct: cfaForwarderWriteFragment(chainId, "updateFlow", [
                arg.superTokenAddress as Address,
                arg.senderAddress as Address,
                arg.receiverAddress as Address,
                BigInt(arg.flowRateWei),
                userData,
              ]),
              title: "Update Stream",
            })
          );
        }
      } else {
        if (!shouldScheduleStart) {
          // We are creating a flow only if it is not scheduled into future
          subOperations.push(
            agreementCallSubOperation({
              chainId,
              agreementAddress: cfa,
              callData: encodeFunctionData({
                abi: cfaAbi,
                functionName: "createFlow",
                args: [
                  arg.superTokenAddress as Address,
                  arg.receiverAddress as Address,
                  BigInt(arg.flowRateWei),
                  "0x",
                ],
              }),
              userData,
              direct: cfaForwarderWriteFragment(chainId, "createFlow", [
                arg.superTokenAddress as Address,
                arg.senderAddress as Address,
                arg.receiverAddress as Address,
                BigInt(arg.flowRateWei),
                userData,
              ]),
              title: "Create Stream",
            })
          );
        }
      }

      const subTransactionTitles = subOperations.map((x) => x.title);
      const mainTransactionTitle =
        subTransactionTitles.length === 1
          ? subTransactionTitles[0]
          : activeExistingFlow
            ? "Modify Stream"
            : shouldScheduleStart
              ? "Schedule Stream"
              : "Create Stream";

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations),
        title: mainTransactionTitle,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash) =>
          buildUpsertFlowWithSchedulingPendingUpdates(
            hash,
            {
              chainId,
              superTokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
              flowRateWei: arg.flowRateWei,
              startTimestamp: arg.startTimestamp,
              endTimestamp: arg.endTimestamp,
            },
            subTransactionTitles
          ),
      };
      }),
    [write]
  );

  return [upsertFlowWithScheduling, result] as const;
}

/**
 * Close a stream and delete its schedule in one transaction. Drop-in replacement for
 * `rpcApi.useDeleteFlowWithSchedulingMutation()` — returns `[trigger, result]`.
 */
export function useDeleteFlowWithScheduling() {
  const { write, result } = useSuperfluidWriteContract();

  const deleteFlowWithScheduling = useCallback(
    (arg: DeleteFlowWithSchedulingArgs) =>
      // Preflight reads & op-building run inside the builder so failures surface
      // through `result` (dialog) and `isLoading` covers them.
      write(async () => {
      const { chainId } = arg;
      const userData: Hex = arg.userDataBytes ?? "0x";

      const activeExistingFlow = await getActiveFlow({
        chainId,
        tokenAddress: arg.superTokenAddress,
        senderAddress: arg.senderAddress,
        receiverAddress: arg.receiverAddress,
      });

      const subOperations: SubOperation[] = [];

      const network = findNetworkOrThrow(allNetworks, chainId);

      if (activeExistingFlow) {
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
            userData,
            direct: cfaForwarderWriteFragment(chainId, "deleteFlow", [
              arg.superTokenAddress as Address,
              arg.senderAddress as Address,
              arg.receiverAddress as Address,
              userData,
            ]),
            title: "Close Stream",
          })
        );
      }

      if (network?.flowSchedulerContractAddress) {
        const existingFlowSchedule = await getFlowSchedule({
          chainId,
          superTokenAddress: arg.superTokenAddress,
          senderAddress: arg.senderAddress,
          receiverAddress: arg.receiverAddress,
        });

        const {
          startDate: existingStartTimestamp,
          endDate: existingEndTimestamp,
        } = existingFlowSchedule;

        if (existingStartTimestamp || existingEndTimestamp) {
          subOperations.push(
            appActionSubOperation({
              chainId,
              appAddress: network.flowSchedulerContractAddress as Address,
              callData: encodeFunctionData({
                abi: flowSchedulerAbi,
                functionName: "deleteFlowSchedule",
                args: [
                  arg.superTokenAddress as Address,
                  arg.receiverAddress as Address,
                  "0x",
                ],
              }),
              title: "Delete Schedule",
            })
          );
        }
      }

      const subTransactionTitles = subOperations.map((x) => x.title);

      return {
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations),
        title: "Close Stream" as const,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildDeleteFlowWithSchedulingPendingUpdates(
            hash,
            {
              chainId,
              superTokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
            },
            subTransactionTitles
          ),
      };
      }),
    [write]
  );

  return [deleteFlowWithScheduling, result] as const;
}
