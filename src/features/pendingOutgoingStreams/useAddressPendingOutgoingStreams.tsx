import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { PendingOutgoingStream, pendingStreamSelectors } from "./pendingOutgoingStream.slice";

const useAddressPendingOutgoingStreams = (
  address: string | undefined
): PendingOutgoingStream[] => {
  const allPendingStreams = useAppSelector((state) =>
    pendingStreamSelectors.selectAll(state.pendingStreams)
  );

  const addressPendingStreams = useMemo(
    () =>
      address
        ? allPendingStreams.filter(
            (x) => x.sender.toLowerCase() === address.toLowerCase()
          )
        : [],
    [address, allPendingStreams]
  );

  return addressPendingStreams;
};

export default useAddressPendingOutgoingStreams;
