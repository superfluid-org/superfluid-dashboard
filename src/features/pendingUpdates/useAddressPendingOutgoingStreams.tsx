import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import {
  isPendingOutgoingStreamUpdate,
  PendingOutgoingStream,
} from "./PendingOutgoingStream";

const useAddressPendingOutgoingStreams = (
  address: string | undefined
): PendingOutgoingStream[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingOutgoingStreamUpdate)
            .filter((x) => x.sender.toLowerCase() === address.toLowerCase())
        : [],
    [address, allPendingUpdates]
  );
};

export default useAddressPendingOutgoingStreams;
