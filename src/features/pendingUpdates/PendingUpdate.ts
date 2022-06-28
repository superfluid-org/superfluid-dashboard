
export interface PendingUpdate {
  /**
   * Keep it the same as the tracked transaction ID.
   */
  id: string;
  pendingType: "FlowCreate" | "FlowDelete";
  transactionHash: string;
  chainId: number;
  timestampMs: number;
}
