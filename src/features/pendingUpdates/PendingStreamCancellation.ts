import { PendingUpdate } from "./PendingUpdate";

export interface PendingStreamCancellation extends PendingUpdate {
  pendingType: "FlowDelete";
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export const isPendingStreamCancellation = (x: PendingUpdate): x is PendingStreamCancellation => x.pendingType === "FlowDelete";