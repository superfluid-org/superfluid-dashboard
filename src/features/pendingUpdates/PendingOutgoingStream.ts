import { Stream } from "@superfluid-finance/sdk-core";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { calculateTotalAmountWei } from "../send/FlowRateInput";
import { SendStreamRestoration } from "../transactionRestoration/transactionRestorations";
import { PendingUpdate } from "./pendingUpdate.slice";

export interface PendingOutgoingStream
  extends PendingUpdate, Omit<Stream, "createdAtBlockNumber" | "updatedAtBlockNumber"> {
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
    type: "OutgoingStream",
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