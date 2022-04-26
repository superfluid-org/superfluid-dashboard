import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { useWalletContext } from "./WalletContext";

export const useWalletTransactions = (
  postProcess: (transactions: TrackedTransaction[]) => TrackedTransaction[] = (
    transactions
  ) => transactions
) => {
  const { walletAddress } = useWalletContext();

  const allTransactions = useAppSelector(transactionTrackerSelectors.selectAll);
  const walletTransactions = useMemo(
    () => allTransactions.filter((x) => x.signer === walletAddress),
    [allTransactions, walletAddress]
  );
  const finalTransactions = useMemo(
    () => postProcess(walletTransactions),
    [walletTransactions, postProcess]
  );

  return finalTransactions;
};
