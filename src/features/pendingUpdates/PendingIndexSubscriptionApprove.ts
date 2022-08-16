import { PendingUpdate } from "./PendingUpdate";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

export interface PendingIndexSubscriptionApproval extends PendingUpdate {
  pendingType: "IndexSubscriptionApprove";
  indexId: string;
  publisherAddress: string;
  superTokenAddress: string;
}

export const isPendingIndexSubscriptionApprove = (
  x: PendingUpdate
): x is PendingIndexSubscriptionApproval =>
  x.pendingType === "IndexSubscriptionApprove";

export const usePendingIndexSubscriptionApprove = ({
  chainId,
  indexId,
  publisherAddress,
  tokenAddress,
}: {
  chainId: number;
  indexId: string;
  publisherAddress: string;
  tokenAddress: string;
}): PendingIndexSubscriptionApproval | undefined => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  // TODO(KK): Not having subscriber checked here is not perfectly correct.
  return useMemo(
    () =>
      allPendingUpdates
        .filter(isPendingIndexSubscriptionApprove)
        .filter(
          (x) =>
            x.chainId === chainId &&
            x.indexId.toLowerCase() === indexId.toLowerCase() &&
            x.publisherAddress.toLowerCase() ===
              publisherAddress.toLowerCase() &&
            x.superTokenAddress.toLowerCase() === tokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates]
  );
};
