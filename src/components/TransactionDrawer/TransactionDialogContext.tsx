import {
    TransactionInfo,
  } from "@superfluid-finance/sdk-redux";
  import { createContext, FC, useContext, useState } from "react";
  import { TransactionDialog } from "../TokenWrapping/TransactionDialog";
  
  const TransactionDialogContext = createContext<{
    triggerTransaction: (params: {
      trigger: () => Promise<TransactionInfo>;
      description: string;
    }) => void;
  }>(undefined!);
  
  export const TransactionDialogContextProvider: FC = ({ children }) => {
    const [focusedTransaction, setFocusedTransaction] = useState<
      | {
          transactionInfo: TransactionInfo | undefined;
          description: string;
        }
      | undefined
    >();
  
    return (
      <TransactionDialogContext.Provider
        value={{
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
      </TransactionDialogContext.Provider>
    );
  };
  
  export const useTransactionDialogContext = () => useContext(TransactionDialogContext);
  