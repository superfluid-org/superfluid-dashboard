import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import {
  isPendingIndexSubscriptionApproval,
  PendingIndexSubscriptionApproval,
} from "./PendingIndexSubscriptionApproval";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

const usePendingIndexSubscriptionApproval = ({
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
        .filter(isPendingIndexSubscriptionApproval)
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

export default usePendingIndexSubscriptionApproval;
