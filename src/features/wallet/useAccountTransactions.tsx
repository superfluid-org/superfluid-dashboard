import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { useMemo } from "react";
import { useAccount } from "@/hooks/useAccount"
import { useAppSelector } from "../redux/store";

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

export const useAccountTransactionsSelector = <T,>(
  postProcess: (transactions: Array<TrackedTransaction>) => T
): { transactions: T; isResolving: boolean } => {
  const { transactions, isResolving } = useAccountTransactions();

  const finalTransactions = useMemo(
    () => postProcess(transactions),
    [transactions, postProcess]
  );

  return useMemo(
    () => ({ transactions: finalTransactions, isResolving }),
    [finalTransactions, isResolving]
  );
};

const useAccountTransactions = (): {
  transactions: Array<TrackedTransaction>;
  isResolving: boolean;
} => {
  const { address: accountAddress, isConnecting, isReconnecting } = useAccount();

  const allTransactions = useAppSelector(transactionTrackerSelectors.selectAll);

  const accountTransactions = useMemo(
    () =>
      accountAddress
        ? allTransactions.filter((x) => x?.signerAddress?.toLowerCase() === accountAddress.toLowerCase())
        : [],
    [allTransactions, accountAddress]
  );

  // On a hard refresh AppKit lags behind wagmi: it reports `connecting` with no
  // address yet. Without this flag consumers can't tell "we don't know the
  // account yet" from "the account has no transactions", and an unresolved
  // wallet renders as a settled empty list.
  // (`isReconnecting` is included defensively — AppKit types the status but
  // never actually assigns it, so `isConnecting` is what carries this today.)
  const isResolving = !accountAddress && (isConnecting || isReconnecting);

  return useMemo(
    () => ({ transactions: accountTransactions, isResolving }),
    [accountTransactions, isResolving]
  );
};

export default useAccountTransactions;
