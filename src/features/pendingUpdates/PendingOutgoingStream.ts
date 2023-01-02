import { useMemo } from "react";
import { Stream } from "@superfluid-finance/sdk-core";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";

export interface PendingOutgoingStream
  extends PendingUpdate,
    Omit<
      Stream,
      | "createdAtBlockNumber"
      | "updatedAtBlockNumber"
      | "tokenSymbol"
      | "deposit"
    > {
  pendingType: "FlowCreate";
}

export const isPendingOutgoingStreamUpdate = (
  x: PendingUpdate
): x is PendingOutgoingStream => x.pendingType === "FlowCreate";

export const useAddressPendingOutgoingStreams = (
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
