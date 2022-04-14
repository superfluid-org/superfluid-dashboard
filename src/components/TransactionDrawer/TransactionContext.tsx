import {
  TrackedTransaction,
  TransactionInfo,
} from "@superfluid-finance/sdk-redux";
import { createContext, FC, useContext, useState } from "react";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { TransactionRecoveries } from "../../redux/transactionRecoveries";
import { TransactionDialog } from "../TokenWrapping/TransactionDialog";

const TransactionContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  transactionToRecover: TrackedTransaction | undefined;
  transactionRecovery: TransactionRecoveries | undefined;
  setTransactionToRecover: (transaction?: TrackedTransaction) => void;
  triggerTransaction: (params: {
    trigger: () => Promise<TransactionInfo>;
    description: string;
  }) => void;
}>(undefined!);

export const TransactionContextProvider: FC = ({ children }) => {
  const { network, setNetwork } = useNetworkContext();
  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
  const [transactionRecovery, setTransactionRecovery] = useState<
    TransactionRecoveries | undefined
  >();
  const [transactionToRecover, setTransactionToRecover] = useState<
    TrackedTransaction | undefined
  >();
  const [focusedTransaction, setFocusedTransaction] = useState<
    | {
        transactionInfo: TransactionInfo | undefined;
        description: string;
      }
    | undefined
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
        triggerTransaction: async ({ trigger, description }) => {
          setFocusedTransaction({
            description,
            transactionInfo: undefined,
          });

          const transactionInfo = await trigger();

          setFocusedTransaction({
            description,
            transactionInfo: transactionInfo,
          });
        },
      }}
    >
      {children}
      {focusedTransaction && (
        <TransactionDialog
          transactionHash={focusedTransaction.transactionInfo?.hash}
          open={true}
          infoText={focusedTransaction.description}
          onClose={() => setFocusedTransaction(undefined)}
        ></TransactionDialog>
      )}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
