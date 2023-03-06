import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { PendingCreateTask } from "./PendingOutgoingTask";

export interface PendingStreamCancellation extends PendingUpdate {
  pendingType: "FlowDelete";
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export interface PendingCreateTaskDeletion extends PendingUpdate {
  pendingType: "CreateTaskDelete";
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export const isPendingCancellationOrDeletion = (
  x: PendingUpdate
): x is PendingStreamCancellation =>
  ["FlowDelete", "CreateTaskDelete"].includes(x.pendingType);

export const usePendingStreamCancellation = ({
  senderAddress,
  receiverAddress,
  tokenAddress,
}: {
  senderAddress: string;
  receiverAddress: string;
  tokenAddress: string;
}): PendingStreamCancellation | PendingCreateTaskDeletion | undefined => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  // TODO(KK): Chain ID should be checked here too.

  return useMemo(
    () =>
      allPendingUpdates
        .filter(isPendingCancellationOrDeletion)
        .filter(
          (x) =>
            x.senderAddress.toLowerCase() === senderAddress.toLowerCase() &&
            x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase() &&
            x.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates]
  );
};
