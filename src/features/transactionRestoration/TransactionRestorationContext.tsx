import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";
import { TransactionRestorations } from "./transactionRestorations";

const TransactionRestorationContext = createContext<{
  restoration: TransactionRestorations | undefined;
  restore: (restoration: TransactionRestorations) => void;
  onRestored: () => void;
}>(undefined!);

export const TransactionRestorationContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [restoration, setRestoration] = useState<
    TransactionRestorations | undefined
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
