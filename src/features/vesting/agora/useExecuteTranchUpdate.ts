import { useCallback } from "react";
import { OPERATION_TYPE } from "@sfpro/sdk/constant";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { vestingSchedulerV3Abi } from "@sfpro/sdk/abi/automation";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { Address, encodeFunctionData } from "viem";
import { useAccount } from "@/hooks/useAccount";
import { ViemFeeOverrides } from "../../../utils/ethersOverridesToViem";
import {
  Actions,
  type ProjectsOverview,
} from "../../../pages/api/agora";
import { buildExecuteTranchUpdatePendingUpdates } from "../../pendingUpdates/buildPendingUpdates";
import {
  SubOperation,
  agreementCallSubOperation,
  contractCallSubOperation,
  getContractAddress,
  subOperationsWriteFragment,
} from "../../transactions/operations";
import { useSuperfluidWriteContract } from "../../transactions/useSuperfluidWriteContract";
import { getVestingSchedulerContractInfo } from "../useVestingWrites";

interface ExecuteTranchUpdateArgs {
  chainId: number;
  projectsOverview: ProjectsOverview;
  actionsToExecute: Actions[];
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

function mapProjectStateIntoSubOperations(
  chainId: number,
  actionsToExecute: Actions[]
): SubOperation[] {
  const scheduler = getVestingSchedulerContractInfo(chainId, "v3");
  const subOperations: SubOperation[] = [];

  for (const action of actionsToExecute) {
    switch (action.type) {
      case "increase-token-allowance": {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC20_INCREASE_ALLOWANCE,
            target: action.payload.superToken,
            abi: superTokenAbi,
            functionName: "increaseAllowance",
            args: [scheduler.address, BigInt(action.payload.allowanceDelta)],
            title: "Approve Allowance",
          })
        );
        break;
      }
      case "increase-flow-operator-permissions": {
        subOperations.push(
          agreementCallSubOperation({
            chainId,
            agreementAddress: getContractAddress(cfaAddress, chainId, "CFAv1"),
            callData: encodeFunctionData({
              abi: cfaAbi,
              functionName: "increaseFlowRateAllowanceWithPermissions",
              args: [
                action.payload.superToken,
                scheduler.address,
                action.payload.permissionsDelta,
                BigInt(action.payload.flowRateAllowanceDelta),
                "0x",
              ],
            }),
            title: "Approve Vesting Scheduler",
          })
        );
        break;
      }
      case "create-vesting-schedule": {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "createVestingScheduleFromAmountAndDuration",
            args: [
              action.payload.superToken,
              action.payload.receiver,
              BigInt(action.payload.totalAmount),
              action.payload.totalDuration,
              action.payload.startDate,
              action.payload.cliffPeriod,
              action.payload.claimPeriod,
              BigInt(action.payload.cliffAmount),
            ],
            title: "Create Vesting Schedule",
          })
        );
        break;
      }
      case "update-vesting-schedule": {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "updateVestingScheduleFlowRateFromAmountAndEndDate",
            args: [
              action.payload.superToken,
              action.payload.receiver,
              BigInt(action.payload.totalAmount),
              action.payload.endDate,
            ],
            title: "Update Vesting Schedule", // end date
          })
        );
        break;
      }
      case "end-vesting-schedule-now": {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "endVestingScheduleNow",
            args: [action.payload.superToken, action.payload.receiver],
            title: "Update Vesting Schedule",
          })
        );
        break;
      }
      case "delete-vesting-schedule": {
        subOperations.push(
          contractCallSubOperation({
            operationType: OPERATION_TYPE.ERC2771_FORWARD_CALL,
            target: scheduler.address,
            abi: vestingSchedulerV3Abi,
            functionName: "deleteVestingSchedule",
            args: [action.payload.superToken, action.payload.receiver],
            title: "Delete Vesting Schedule",
          })
        );
        break;
      }
      case "let-vesting-schedule-end": {
        break;
      }
    }
  }

  return subOperations;
}

/**
 * Execute an Agora tranch update: a dynamic batch of allowance/permission increases and
 * vesting schedule creations/updates/deletions in a single Host `batchCall`. Drop-in
 * replacement for `rpcApi.useExecuteTranchUpdateMutation()` — returns `[trigger, result]`.
 */
export function useExecuteTranchUpdate() {
  const { write, result } = useSuperfluidWriteContract();
  const { address: accountAddress } = useAccount();

  const executeTranchUpdate = useCallback(
    (arg: ExecuteTranchUpdateArgs) => {
      const { chainId, projectsOverview, actionsToExecute } = arg;
      const { senderAddress } = projectsOverview;

      if (chainId !== projectsOverview.chainId) {
        throw new Error("Chain ID does not match");
      }

      if (
        !accountAddress ||
        accountAddress.toLowerCase() !== senderAddress.toLowerCase()
      ) {
        throw new Error("Signer address does not match sender address");
      }

      const subOperations = mapProjectStateIntoSubOperations(
        chainId,
        actionsToExecute
      );
      const subTransactionTitles = subOperations.map((x) => x.title);

      return write({
        chainId,
        ...subOperationsWriteFragment(chainId, subOperations, {
          forceBatch: true,
        }),
        title: "Execute Tranch Update",
        subTransactionTitles,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash) =>
          buildExecuteTranchUpdatePendingUpdates(hash, {
            chainId,
            senderAddress: senderAddress as Address,
            actionsToExecute,
          }),
      });
    },
    [write, accountAddress]
  );

  return [executeTranchUpdate, result] as const;
}
