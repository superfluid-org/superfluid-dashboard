import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import {
  isPendingStreamCancellation,
  PendingStreamCancellation,
} from "./PendingStreamCancellation";

const usePendingStreamCancellation = ({
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

export default usePendingStreamCancellation;
