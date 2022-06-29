
/**
 * The pending update will be deleted once Subgraph syncs.
 */
export interface PendingUpdate {
  /**
   * Keep it the same as the tracked transaction ID.
   */
  id: string;
  pendingType: "FlowCreate" | "FlowDelete";
  transactionHash: string;
  chainId: number;
  timestampMs: number;
  /**
   * RPC is updated before Subgraph. We can show already show that the update succeeded in the UI.
   */
  hasTransactionSucceeded?: true;
}
