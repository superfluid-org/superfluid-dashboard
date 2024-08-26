import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

export interface PendingIndexSubscriptionRevoke extends PendingUpdate {
  pendingType: "IndexSubscriptionRevoke";
  indexId: string;
  publisherAddress: string;
  superTokenAddress: string;
}

export const isPendingIndexSubscriptionRevoke = (
  x: PendingUpdate
): x is PendingIndexSubscriptionRevoke =>
  x.pendingType === "IndexSubscriptionRevoke";

export const usePendingIndexSubscriptionRevoke = ({
  chainId,
  indexId,
  publisherAddress,
  tokenAddress,
}: {
  chainId: number;
  indexId: string;
  publisherAddress: string;
  tokenAddress: string;
}): PendingIndexSubscriptionRevoke | undefined => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  // TODO(KK): Not having subscriber checked here is not perfectly correct.
  return useMemo(
    () =>
      allPendingUpdates
        .filter(isPendingIndexSubscriptionRevoke)
        .filter(
          (x) =>
            x.chainId === chainId &&
            x.indexId.toLowerCase() === indexId.toLowerCase() &&
            x.publisherAddress.toLowerCase() ===
              publisherAddress.toLowerCase() &&
            x.superTokenAddress.toLowerCase() === tokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates, chainId, indexId, publisherAddress, tokenAddress]
  );
};