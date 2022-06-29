import { Stream } from "@superfluid-finance/sdk-core";
import { PendingUpdate } from "./PendingUpdate";

export interface PendingOutgoingStream
  extends PendingUpdate,
    Omit<
      Stream,
      "createdAtBlockNumber" | "updatedAtBlockNumber" | "tokenSymbol"
    > {
  pendingType: "FlowCreate";
}

export const isPendingOutgoingStreamUpdate = (x: PendingUpdate): x is PendingOutgoingStream => x.pendingType === "FlowCreate";