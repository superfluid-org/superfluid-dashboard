import { createContext, FC, useContext, useState } from "react";

const TransactionDrawerContext = createContext<{
    transactionDrawerOpen: boolean;
    setTransactionDrawerOpen: (open: boolean) => void;
}>(
    null!
);

export const TransactionDrawerContextProvider: FC = ({ children }) => {
    const [open, setOpen] = useState(false);

    return (
        <TransactionDrawerContext.Provider
            value={{
                transactionDrawerOpen: open,
                setTransactionDrawerOpen: setOpen,
            }}
        >
            {children}
        </TransactionDrawerContext.Provider>
    );
};

export const useTransactionDrawerContext = () =>
    useContext(TransactionDrawerContext);
