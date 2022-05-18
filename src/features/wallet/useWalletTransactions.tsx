import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { useWalletContext } from "./WalletContext";

export const transactionsByTimestampSelector = (
  transactions: Array<TrackedTransaction>
): Array<TrackedTransaction> =>
  transactions.sort((t1, t2) => (t1.timestampMs > t2.timestampMs ? -1 : 1));

export const pendingTransactionsSelector = (
  transactions: Array<TrackedTransaction>
): Array<TrackedTransaction> =>
  transactions.filter((transaction) => transaction.status === "Pending");

export const transactionByHashSelector =
  (hash?: string) =>
  (transactions: Array<TrackedTransaction>): TrackedTransaction | undefined =>
    transactions.find((transaction) => transaction.hash === hash);

export const useWalletTransactionsSelector = <T,>(
  postProcess: (transactions: Array<TrackedTransaction>) => T
): T => {
  const walletTransactions = useWalletTransactions();

  const finalTransactions = useMemo(
    () => postProcess(walletTransactions),
    [walletTransactions, postProcess]
  );

  return finalTransactions;
};

const useWalletTransactions = (): Array<TrackedTransaction> => {
  const { walletAddress } = useWalletContext();

  const allTransactions = useAppSelector(transactionTrackerSelectors.selectAll);

  const walletTransactions = useMemo(
    () => allTransactions.filter((x) => x.signer === walletAddress),
    [allTransactions, walletAddress]
  );

  return walletTransactions;
};

export default useWalletTransactions;
