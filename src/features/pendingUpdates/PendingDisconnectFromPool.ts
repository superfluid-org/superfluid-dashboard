import { PendingUpdate } from "./PendingUpdate";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

export interface PendingDisconnectFromPool extends PendingUpdate {
  pendingType: "ConnectToPool";
  poolAddress: string;
  superTokenAddress: string;
}

export const isPendingIndexSubscriptionApprove = (
  x: PendingUpdate
): x is PendingDisconnectFromPool => x.pendingType === "DisconnectFromPool";

export const usePendingDisconnectFromPool = ({
  chainId,
  poolAddress,
  superTokenAddress,
}: {
  chainId: number;
  poolAddress: string;
  superTokenAddress: string;
}): PendingDisconnectFromPool | undefined => {
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
            x.poolAddress.toLowerCase() === poolAddress.toLowerCase() &&
            x.superTokenAddress.toLowerCase() ===
              superTokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates]
  );
};
