import { PendingUpdate } from "./PendingUpdate";

export interface PendingIndexSubscriptionApproval extends PendingUpdate {
  pendingType: "IndexSubscriptionApprove";
  indexId: string;
  publisherAddress: string;
  superTokenAddress: string;
}

export const isPendingIndexSubscriptionApproval = (
  x: PendingUpdate
): x is PendingIndexSubscriptionApproval =>
  x.pendingType === "IndexSubscriptionApprove";
