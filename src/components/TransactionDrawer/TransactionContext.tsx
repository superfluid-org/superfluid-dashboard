import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { createContext, FC, useContext, useState } from "react";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { TransactionRecoveries } from "../../redux/transactionRecoveries";

const TransactionContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  transactionToRecover: TrackedTransaction | undefined;
  transactionRecovery: TransactionRecoveries | undefined;
  setTransactionToRecover: (transaction?: TrackedTransaction) => void;
}>(null!);

export const TransactionContextProvider: FC = ({ children }) => {
  const { network, setNetwork } = useNetworkContext();
  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
  const [transactionRecovery, setTransactionRecovery] = useState<
    TransactionRecoveries | undefined
  >();
  const [transactionToRecover, setTransactionToRecover] = useState<
    TrackedTransaction | undefined
  >();

  return (
    <TransactionContext.Provider
      value={{
        transactionDrawerOpen,
        setTransactionDrawerOpen,
        transactionRecovery,
        transactionToRecover,
        setTransactionToRecover: (transaction?: TrackedTransaction) => {
          if (transaction && transaction.chainId !== network.chainId) {
            setNetwork(transaction.chainId);
          }
          setTransactionToRecover(transaction);
          setTransactionRecovery(
            (transaction?.extraData as any)?.recovery as
              | TransactionRecoveries
              | undefined
          ); // TODO(KK): Ugly undefined
        },
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
