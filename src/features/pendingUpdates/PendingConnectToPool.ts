import { PendingUpdate } from "./PendingUpdate";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

export interface PendingConnectToPool extends PendingUpdate {
  pendingType: "ConnectToPool";
  poolAddress: string;
  superTokenAddress: string;
}

export const isPendingConnectToPool = (
  x: PendingUpdate
): x is PendingConnectToPool => x.pendingType === "ConnectToPool";

export const usePendingConnectToPool = ({
  chainId,
  poolAddress,
  superTokenAddress,
}: {
  chainId: number;
  poolAddress: string;
  superTokenAddress: string;
}): PendingConnectToPool | undefined => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  // TODO(KK): Not having subscriber checked here is not perfectly correct.
  return useMemo(
    () =>
      allPendingUpdates
        .filter(isPendingConnectToPool)
        .filter(
          (x) =>
            x.chainId === chainId &&
            x.poolAddress.toLowerCase() === poolAddress.toLowerCase() &&
            x.superTokenAddress.toLowerCase() ===
              superTokenAddress.toLowerCase()
        )[0],
    [allPendingUpdates, chainId, poolAddress, superTokenAddress]
  );
};
