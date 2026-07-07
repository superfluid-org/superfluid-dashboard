import { useCallback } from "react";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { flowSchedulerAbi } from "@sfpro/sdk/abi/automation";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { Address, Hex, encodeFunctionData } from "viem";
import {
  isCloseToUnlimitedFlowRateAllowance,
} from "../../utils/isCloseToUnlimitedAllowance";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "../../utils/constants";
import { ViemFeeOverrides } from "../transactions/viemFeeOverrides";
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

/**
 * Single source for the grant sub-op's title: the grant+schedule→one-relayable-action
 * reduction below matches on it, so the assignment and the comparison must never drift.
 */
const APPROVE_STREAM_SCHEDULER_TITLE =
  "Approve Stream Scheduler" satisfies TransactionTitle;

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
}

export interface DeleteFlowWithSchedulingArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  userDataBytes?: Hex;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  /**
   * Allow a lone deleteFlow or deleteFlowSchedule to relay via Clear Macro. Opt-in
   * because relay engagement must follow a visible relay chip: the send-stream form
   * renders one, the table-row cancel buttons don't.
   */
  withClearMacro?: boolean;
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

      const network = findNetworkOrThrow(allNetworks, chainId);
      const cfa = getContractAddress(cfaAddress, chainId, "CFAv1");
      const flowSchedulerAddress = network?.flowSchedulerContractAddress as
        | Address
        | undefined;

      // Fire the independent preflight reads together so wagmi's multicall coalesces
      // them into a single round-trip (sequential awaits would each be their own call).
      const [activeExistingFlow, existingFlowSchedule, flowOperatorData] =
        await Promise.all([
          getActiveFlow({
            chainId,
            tokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            receiverAddress: arg.receiverAddress,
          }),
          flowSchedulerAddress
            ? getFlowSchedule({
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              })
            : Promise.resolve(undefined),
          flowSchedulerAddress && shouldSchedule
            ? getFlowOperatorData({
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                flowOperatorAddress: flowSchedulerAddress,
              })
            : Promise.resolve(undefined),
        ]);

      const subOperations: SubOperation[] = [];

      if (flowSchedulerAddress) {
        const {
          startDate: existingStartTimestamp,
          endDate: existingEndTimestamp,
          flowRate: existingFlowRate,
        } = existingFlowSchedule!;

        if (shouldSchedule) {
          const existingFlowRateAllowance =
            flowOperatorData!.flowRateAllowanceWei;
          const existingPermissions = flowOperatorData!.permissions;

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
                title: APPROVE_STREAM_SCHEDULER_TITLE,
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
                // The macro bundles the flow-operator grant and fixes startMaxDelay/
                // startAmount to these same values; it carries no userData.
                clearMacro:
                  userData === "0x"
                    ? {
                        kind: "scheduleFlow",
                        superToken: arg.superTokenAddress as Address,
                        receiver: arg.receiverAddress as Address,
                        startDate: arg.startTimestamp || 0,
                        flowRate: shouldScheduleStart
                          ? BigInt(arg.flowRateWei)
                          : 0n,
                        endDate: arg.endTimestamp || 0,
                      }
                    : undefined,
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
              // The macro carries no userData — only attach when there is none.
              clearMacro:
                userData === "0x"
                  ? {
                      kind: "deleteFlowSchedule",
                      superToken: arg.superTokenAddress as Address,
                      receiver: arg.receiverAddress as Address,
                    }
                  : undefined,
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
              // The macro carries no userData — only attach when there is none.
              clearMacro:
                userData === "0x"
                  ? {
                      kind: "updateFlow",
                      superToken: arg.superTokenAddress as Address,
                      receiver: arg.receiverAddress as Address,
                      flowRate: BigInt(arg.flowRateWei),
                    }
                  : undefined,
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
              // The macro carries no userData — only attach when there is none.
              clearMacro:
                userData === "0x"
                  ? {
                      kind: "createFlow",
                      superToken: arg.superTokenAddress as Address,
                      receiver: arg.receiverAddress as Address,
                      flowRate: BigInt(arg.flowRateWei),
                    }
                  : undefined,
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

      const writeFragment = subOperationsWriteFragment(chainId, subOperations);
      // The macro's scheduleFlow performs the missing flow-operator grant itself, so a
      // grant+schedule batch still reduces to one relayable action.
      const clearMacro =
        writeFragment.clearMacro ??
        (subOperations.length === 2 &&
        subOperations[0].title === APPROVE_STREAM_SCHEDULER_TITLE &&
        subOperations[1].clearMacro?.kind === "scheduleFlow"
          ? subOperations[1].clearMacro
          : undefined);

      return {
        chainId,
        ...writeFragment,
        clearMacro,
        title: mainTransactionTitle,
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
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

      const network = findNetworkOrThrow(allNetworks, chainId);
      const flowSchedulerAddress = network?.flowSchedulerContractAddress as
        | Address
        | undefined;

      // Batch the two independent preflight reads into one multicall round-trip.
      const [activeExistingFlow, existingFlowSchedule] = await Promise.all([
        getActiveFlow({
          chainId,
          tokenAddress: arg.superTokenAddress,
          senderAddress: arg.senderAddress,
          receiverAddress: arg.receiverAddress,
        }),
        flowSchedulerAddress
          ? getFlowSchedule({
              chainId,
              superTokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
            })
          : Promise.resolve(undefined),
      ]);

      const subOperations: SubOperation[] = [];

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
            // Opt-in (see `withClearMacro`); the macro carries no userData.
            clearMacro:
              arg.withClearMacro && userData === "0x"
                ? {
                    kind: "deleteFlow",
                    superToken: arg.superTokenAddress as Address,
                    sender: arg.senderAddress as Address,
                    receiver: arg.receiverAddress as Address,
                  }
                : undefined,
            title: "Close Stream",
          })
        );
      }

      if (flowSchedulerAddress) {
        const {
          startDate: existingStartTimestamp,
          endDate: existingEndTimestamp,
        } = existingFlowSchedule!;

        if (existingStartTimestamp || existingEndTimestamp) {
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
              // Opt-in (see `withClearMacro`); the macro carries no userData.
              clearMacro:
                arg.withClearMacro && userData === "0x"
                  ? {
                      kind: "deleteFlowSchedule",
                      superToken: arg.superTokenAddress as Address,
                      receiver: arg.receiverAddress as Address,
                    }
                  : undefined,
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
