import { createContext, FC, useCallback, useContext, useState } from "react";
import { TransactionRestoration } from "./transactionRestorations";

const TransactionRestorationContext = createContext<{
  restoration: TransactionRestoration | undefined;
  restore: (restoration: TransactionRestoration) => void;
  onRestored: () => void;
}>(undefined!);

export const TransactionRestorationContextProvider: FC = ({ children }) => {
  const [restoration, setRestoration] = useState<
    TransactionRestoration | undefined
  >();

  const onRestored = useCallback(
    () => setTimeout(() => setRestoration(undefined), 0),
    [setRestoration]
  );

  return (
    <TransactionRestorationContext.Provider
      value={{
        restore: setRestoration,
        restoration,
        onRestored,
      }}
    >
      {children}
    </TransactionRestorationContext.Provider>
  );
};

export const useTransactionRestorationContext = () =>
  useContext(TransactionRestorationContext);
