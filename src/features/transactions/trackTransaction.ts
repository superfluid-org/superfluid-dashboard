import {
  NewTransactionResponse,
  registerNewTransaction,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { AppDispatch } from "../redux/store";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { pendingUpdateSlice } from "../pendingUpdates/pendingUpdate.slice";

export interface TrackTransactionArg {
  hash: string;
  chainId: number;
  signerAddress: string;
  title: TransactionTitle;
  extraData?: Record<string, unknown>;
  /**
   * Optional optimistic updates shown until the relevant Subgraph syncs. Each entry's
   * `transactionHash` must equal `hash` (ids are `hash` or `hash`-derived) so the
   * transactionTracker removal logic picks them up.
   */
  pendingUpdates?: PendingUpdate[];
}

/**
 * The single bridge from "wagmi gave me a tx hash" to the Redux transaction-tracking +
 * optimistic-update + drawer machinery. Reused by every wagmi-hook based write so the write
 * path can move off the RTK Query mutation pattern while keeping the tracker untouched.
 */
export const trackTransaction =
  ({
    hash,
    chainId,
    signerAddress,
    title,
    extraData,
    pendingUpdates,
  }: TrackTransactionArg) =>
  async (dispatch: AppDispatch) => {
    await registerNewTransaction({
      // The tracker only needs the hash; it waits for confirmations & watches for reorgs
      // via the read-only Framework's provider.
      transactionResponse: { hash } as NewTransactionResponse,
      chainId,
      dispatch,
      signerAddress,
      title,
      extraData,
    });

    for (const pendingUpdate of pendingUpdates ?? []) {
      dispatch(pendingUpdateSlice.actions.addOne(pendingUpdate));
    }
  };
