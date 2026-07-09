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
import { ClearMacroAction } from "../clearMacro/dashboardClearMacro";
import { UnitOfTime } from "./FlowRateInput";

/**
 * Single source for the grant sub-op's title: `reduceToScheduleFlowAction` matches on it,
 * so the assignment and the comparison must never drift.
 */
const APPROVE_STREAM_SCHEDULER_TITLE =
  "Approve Stream Scheduler" satisfies TransactionTitle;

/**
 * The macro's scheduleFlow performs the missing flow-operator grant itself and, in
 * immediate-start mode (startDate 0, flowRate > 0), also opens the flow — so
 * `[schedule]`, `[grant, schedule]`, `[schedule, createFlow]` and
 * `[grant, schedule, createFlow]` batches all reduce to that one relayable action.
 *
 * False-positive audit against every sub-op the upsert hook can push (grant, schedule
 * create/delete, updateFlow, createFlow): `[schedule(rate 0 on active flow), updateFlow]`
 * and `[deleteFlowSchedule, createFlow]` fail the kind checks; `[grant]` alone leaves no
 * head; any batch built with `userDataBytes !== "0x"` has no `clearMacro` on any sub-op
 * (every attach site is gated on empty userData), so it can never reduce.
 */
export function reduceToScheduleFlowAction(
  subOperations: SubOperation[]
): ClearMacroAction | undefined {
  const ops =
    subOperations[0]?.title === APPROVE_STREAM_SCHEDULER_TITLE
      ? subOperations.slice(1)
      : subOperations;
  const [scheduleOp, createFlowOp, ...rest] = ops;
  if (rest.length > 0) return undefined;
  const action =
    scheduleOp?.clearMacro?.kind === "scheduleFlow"
      ? scheduleOp.clearMacro
      : undefined;
  if (!action) return undefined;
  if (!createFlowOp) return action;
  // The trailing createFlow folds in only when the macro's immediate-start mode
  // reproduces it exactly (same token/receiver/rate, no scheduled start).
  const createAction = createFlowOp.clearMacro;
  return createAction?.kind === "createFlow" &&
    action.startDate === 0 &&
    action.flowRate > 0n &&
    createAction.superToken === action.superToken &&
    createAction.receiver === action.receiver &&
    createAction.flowRate === action.flowRate
    ? action
    : undefined;
}

/**
 * The macro's deleteFlow also removes the signer's flow schedule row when one exists, so
 * the `[deleteFlow, deleteFlowSchedule]` batch a scheduled-stream cancel builds reduces
 * to that one relayable action.
 *
 * False-positive audit against every sub-op the delete hook can push (a deleteFlow head,
 * a deleteFlowSchedule tail — nothing else): a lone `[deleteFlowSchedule]` leaves no
 * matching head (it relays as itself via the lone-op write fragment); any batch built
 * with `userDataBytes !== "0x"` or without `withClearMacro` has no `clearMacro` on any
 * sub-op, so it can never reduce; the upsert hook's batches never have a deleteFlow head.
 * Signer == flow sender is enforced by the executor's `visibleAddress === address` gate
 * and again by the macro contract (it only touches the row when the signer is `sender`).
 */
export function reduceToDeleteFlowAction(
  subOperations: SubOperation[]
): ClearMacroAction | undefined {
  const [deleteFlowOp, deleteScheduleOp, ...rest] = subOperations;
  if (rest.length > 0 || !deleteScheduleOp) return undefined;
  const action =
    deleteFlowOp?.clearMacro?.kind === "deleteFlow"
      ? deleteFlowOp.clearMacro
      : undefined;
  if (!action) return undefined;
  const scheduleAction = deleteScheduleOp.clearMacro;
  return scheduleAction?.kind === "deleteFlowSchedule" &&
    scheduleAction.superToken === action.superToken &&
    scheduleAction.receiver === action.receiver
    ? action
    : undefined;
}

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
   * Allow the cancel to relay via Clear Macro: a lone deleteFlow or deleteFlowSchedule,
   * or the `[deleteFlow, deleteFlowSchedule]` batch (which reduces to the macro's
   * combined deleteFlow — see `reduceToDeleteFlowAction`). Opt-in because relay
   * engagement must follow a visible relay chip: the send-stream form renders one, the
   * table-row cancel buttons don't.
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
                // startAmount to these same values; it carries no userData. A positive
                // rate with no start date is the macro's immediate-start mode (it opens
                // the flow itself) — only valid because the hook always pushes the
                // matching "Create Stream" sub-op in exactly that case (no active flow,
                // no scheduled start), which `reduceToScheduleFlowAction` cross-checks.
                clearMacro:
                  userData === "0x"
                    ? {
                        kind: "scheduleFlow",
                        superToken: arg.superTokenAddress as Address,
                        receiver: arg.receiverAddress as Address,
                        startDate: arg.startTimestamp || 0,
                        flowRate:
                          shouldScheduleStart || !activeExistingFlow
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
      const clearMacro =
        writeFragment.clearMacro ?? reduceToScheduleFlowAction(subOperations);

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

      const writeFragment = subOperationsWriteFragment(chainId, subOperations);
      const clearMacro =
        writeFragment.clearMacro ?? reduceToDeleteFlowAction(subOperations);

      return {
        chainId,
        ...writeFragment,
        clearMacro,
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
