import { createContext, FC, useContext, useState } from "react";
import { TransactionRecoveries } from "../../redux/transactionRecoverySlice";

const TransactionContext = createContext<{
    transactionDrawerOpen: boolean;
    setTransactionDrawerOpen: (open: boolean) => void;
    transactionRecovery?: TransactionRecoveries;
    setTransactionRecovery: (transactionRecovery?: TransactionRecoveries) => void;
}>(
    null!
);

export const TransactionContextProvider: FC = ({ children }) => {
    const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
    const [transactionRecovery, setTransactionRecovery] = useState<TransactionRecoveries | undefined>();

    return (
        <TransactionContext.Provider
            value={{
                transactionDrawerOpen,
                setTransactionDrawerOpen,
                transactionRecovery,
                setTransactionRecovery
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactionContext = () =>
    useContext(TransactionContext);
