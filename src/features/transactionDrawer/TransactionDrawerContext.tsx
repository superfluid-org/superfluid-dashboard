import { createContext, FC, useContext, useState } from "react";

const TransactionDrawerContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
}>(undefined!);

export const TransactionDrawerContextProvider: FC = ({ children }) => {
  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
  return (
    <TransactionDrawerContext.Provider
      value={{
        transactionDrawerOpen,
        setTransactionDrawerOpen,
      }}
    >
      {children}
    </TransactionDrawerContext.Provider>
  );
};

export const useTransactionDrawerContext = () =>
  useContext(TransactionDrawerContext);
