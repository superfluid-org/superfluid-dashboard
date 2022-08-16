import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";

export interface PendingStreamCancellation extends PendingUpdate {
  pendingType: "FlowDelete";
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export const isPendingStreamCancellation = (
  x: PendingUpdate
): x is PendingStreamCancellation => x.pendingType === "FlowDelete";

export const usePendingStreamCancellation = ({
  senderAddress,
  receiverAddress,
  tokenAddress,
}: {
  senderAddress: string;
  receiverAddress: string;
  tokenAddress: string;
}): PendingStreamCancellation | undefined => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  // TODO(KK): Chain ID should be checked here too.
  return useMemo(
    () =>
      allPendingUpdates
        .filter(isPendingStreamCancellation)
        .filter(
          (x) =>
            x.senderAddress.toLowerCase() === senderAddress.toLowerCase() &&
            x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase() &&
            x.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates]
  );
};
