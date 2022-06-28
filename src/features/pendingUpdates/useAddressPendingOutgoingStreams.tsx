import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { pendingStreamSelectors } from "./pendingUpdate.slice";
import { PendingOutgoingStream } from "./PendingOutgoingStream";

const useAddressPendingOutgoingStreams = (
  address: string | undefined
): PendingOutgoingStream[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingStreamSelectors.selectAll(state.pendingStreams)
  );

  const addressPendingStreams = useMemo(
    () =>
      address
        ? allPendingUpdates.filter(
            (x) =>
              x.type === "OutgoingStream" &&
              x.sender.toLowerCase() === address.toLowerCase()
          )
        : [],
    [address, allPendingUpdates]
  );

  return addressPendingStreams;
};

export default useAddressPendingOutgoingStreams;
