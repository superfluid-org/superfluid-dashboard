import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import {
  DeleteVestingSchedule,
  ManualVestingExecution,
} from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingExecutionBase
  extends PendingUpdate,
    Pick<
      ManualVestingExecution,
      "chainId" | "superTokenAddress" | "senderAddress" | "receiverAddress"
    > {}

export interface PendingVestingCliffExecution
  extends PendingVestingExecutionBase {
  pendingType: "VestingExecuteCliff";
}

export interface PendingVestingEndExecution
  extends PendingVestingExecutionBase {
  pendingType: "VestingExecuteEnd";
}

export const isPendingVestingCliffExecution = (
  x: PendingUpdate
): x is PendingVestingCliffExecution => x.pendingType === "VestingExecuteCliff";

export const isPendingVestingEndExecution = (
  x: PendingUpdate
): x is PendingVestingCliffExecution => x.pendingType === "VestingExecuteEnd";

const usePendingVestingExecution = ({
  chainId,
  superTokenAddress,
  senderAddress,
  receiverAddress,
}: {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}) => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      allPendingUpdates.filter(
        (x) =>
          (isPendingVestingCliffExecution(x) ||
            isPendingVestingEndExecution(x)) &&
          x.chainId === chainId &&
          x.superTokenAddress.toLowerCase() ===
            superTokenAddress.toLowerCase() &&
          x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase() &&
          x.senderAddress.toLowerCase() === senderAddress.toLowerCase()
      ), // We assume no duplicates here.
    [
      chainId,
      superTokenAddress,
      receiverAddress,
      senderAddress,
      allPendingUpdates,
    ]
  );
};

export const usePendingVestingCliffExecution = (
  args: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
  },
  options?: { skip: boolean }
) => {
  const pendingVestingExecutions = usePendingVestingExecution(args);
  const skip = options?.skip ?? false;

  return useMemo(
    () =>
      skip
        ? undefined
        : pendingVestingExecutions.filter((x) =>
            isPendingVestingCliffExecution(x)
          )[0], // We assume no duplicates here.
    [skip, pendingVestingExecutions]
  );
};

export const usePendingVestingEndExecution = (
  args: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
  },
  options?: { skip: boolean }
) => {
  const pendingVestingExecutions = usePendingVestingExecution(args);

  const skip = options?.skip ?? false;

  return useMemo(
    () =>
      skip
        ? undefined
        : pendingVestingExecutions.filter((x) =>
            isPendingVestingEndExecution(x)
          )[0], // We assume no duplicates here.
    [skip, pendingVestingExecutions]
  );
};
