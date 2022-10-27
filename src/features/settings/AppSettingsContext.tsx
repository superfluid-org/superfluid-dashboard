import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { Currency } from "../../utils/currencyUtils";

const AppSettingsContext = createContext<{
  currency: Currency;
  setCurrency: (newCurrency: Currency) => void;
}>(undefined!);

export const AppSettingsContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [currency, setCurrency] = useState(Currency.USD);

  return (
    <AppSettingsContext.Provider value={{ currency, setCurrency }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettingsContext = () => useContext(AppSettingsContext);
