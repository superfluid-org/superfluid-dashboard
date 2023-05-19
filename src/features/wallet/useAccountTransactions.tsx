import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { useMemo } from "react";
import { useAccount } from "wagmi";
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
): T => {
  const accountTransactions = useAccountTransactions();

  const finalTransactions = useMemo(
    () => postProcess(accountTransactions),
    [accountTransactions, postProcess]
  );

  return finalTransactions;
};

const useAccountTransactions = (): Array<TrackedTransaction> => {
  const { address: accountAddress } = useAccount();

  const allTransactions = useAppSelector(transactionTrackerSelectors.selectAll);

  const accountTransactions = useMemo(
    () =>
      accountAddress
        ? allTransactions.filter((x) => x.signerAddress === accountAddress)
        : [],
    [allTransactions, accountAddress]
  );

  return accountTransactions;
};

export default useAccountTransactions;
