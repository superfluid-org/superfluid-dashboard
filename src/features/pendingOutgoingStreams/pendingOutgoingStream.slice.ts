import { createEntityAdapter, createSlice, isAllOf } from "@reduxjs/toolkit";
import { Stream } from "@superfluid-finance/sdk-core";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { transactionTracker } from "../redux/store";
import { calculateTotalAmountWei } from "../send/FlowRateInput";
import { SendStreamRestoration } from "../transactionRestoration/transactionRestorations";

export interface PendingOutgoingStream
  extends Omit<Stream, "createdAtBlockNumber" | "updatedAtBlockNumber"> {
  chainId: number;
  transactionHash: string;
  pending: true;
}

export const createPendingOutgoingStream = (
  transactionInfo: TransactionInfo,
  restoration: SendStreamRestoration,
  senderAddress: string
): PendingOutgoingStream => {
  const timestampMs = Math.round(Date.now() / 1000);
  return {
    /**
     * Keep it the same as the tracked transaction ID.
     */
    id: transactionInfo.hash,
    chainId: transactionInfo.chainId,
    transactionHash: transactionInfo.hash,
    createdAtTimestamp: timestampMs,
    updatedAtTimestamp: timestampMs,
    currentFlowRate: calculateTotalAmountWei(restoration.flowRate).toString(),
    receiver: restoration.receiver,
    sender: senderAddress,
    token: restoration.token.address,
    tokenSymbol: restoration.token.symbol,
    streamedUntilUpdatedAt: "0",
    pending: true,
  };
};

const adapter = createEntityAdapter<PendingOutgoingStream>({
  selectId: (x) => x.id,
  sortComparer: (a, b) => {
    if (a.updatedAtTimestamp > b.updatedAtTimestamp) {
      return -1;
    }
    if (a.updatedAtTimestamp < b.updatedAtTimestamp) {
      return 1;
    }
    return 0;
  },
});

export const pendingOutgoingStreamSlice = createSlice({
  name: "pendingStreams",
  initialState: adapter.getInitialState(),
  reducers: {
    addPendingStream: adapter.addOne,
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        const isSubgraphInSync = action.payload.changes.isSubgraphInSync;

        // Remove the pending stream when Subgraph is synced or the transaction fails.
        if (
          isSubgraphInSync ||
          transactionStatus === "Failed" ||
          transactionStatus === "Unknown"
        ) {
          const transactionId = action.payload.id;
          adapter.removeOne(state, transactionId);
        }
      }
    );
  },
});

export const { addPendingStream } = pendingOutgoingStreamSlice.actions;

export const pendingStreamSelectors = adapter.getSelectors();
