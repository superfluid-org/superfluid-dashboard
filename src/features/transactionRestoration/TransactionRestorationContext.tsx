import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { createContext, FC, useCallback, useContext, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";

const TransactionRestorationContext = createContext<{
  transactionToRestore: TrackedTransaction | undefined;
  restoreTransaction: (transaction: TrackedTransaction) => void;
  onRestored: () => void;
}>(undefined!);

export const TransactionRestorationContextProvider: FC = ({ children }) => {
  const { network, setNetwork } = useNetworkContext();

  const [transactionToRestore, setTransactionToRestore] = useState<
    TrackedTransaction | undefined
  >();

  const restoreTransaction = useCallback(
    (transaction: TrackedTransaction) => {
      if (transaction && transaction.chainId !== network.chainId) {
        setNetwork(transaction.chainId);
      }
      setTransactionToRestore(transaction);
    },
    [setNetwork, setTransactionToRestore]
  );

  const onRestored = useCallback(
    () => setTimeout(() => setTransactionToRestore(undefined), 0),
    [setTransactionToRestore]
  );

  return (
    <TransactionRestorationContext.Provider
      value={{
        transactionToRestore,
        restoreTransaction,
        onRestored,
      }}
    >
      {children}
    </TransactionRestorationContext.Provider>
  );
};

export const useTransactionRestorationContext = () =>
  useContext(TransactionRestorationContext);
