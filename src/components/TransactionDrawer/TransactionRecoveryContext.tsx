import {
    TrackedTransaction,
    TransactionInfo,
  } from "@superfluid-finance/sdk-redux";
  import { createContext, FC, useContext, useState } from "react";
  import { useNetworkContext } from "../../contexts/NetworkContext";
  import { TransactionRecoveries } from "../../redux/transactionRecoveries";
  import { TransactionDialog } from "../TokenWrapping/TransactionDialog";
  
  const TransactionRecoveryContext = createContext<{
    transactionToRecover: TrackedTransaction | undefined;
    transactionRecovery: TransactionRecoveries | undefined;
    setTransactionToRecover: (transaction?: TrackedTransaction) => void;
  }>(undefined!);
  
  export const TransactionRecoveryContextProvider: FC = ({ children }) => {
    const { network, setNetwork } = useNetworkContext();
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
      <TransactionRecoveryContext.Provider
        value={{
          transactionRecovery,
          transactionToRecover,
          setTransactionToRecover: (transaction?: TrackedTransaction) => {
            if (transaction && transaction.chainId !== network.chainId) {
              setNetwork(transaction.chainId);
            }
            setTransactionToRecover(transaction);
            setTransactionRecovery(
              transaction?.extraData?.recovery as
                | TransactionRecoveries
                | undefined
            ); // TODO(KK): Ugly undefined
          }
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
      </TransactionRecoveryContext.Provider>
    );
  };
  
  export const useTransactionRecoveryContext = () => useContext(TransactionRecoveryContext);
  