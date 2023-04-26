import {useMemo} from "react";
import {currenciesByCode, Currency, CurrencyCode} from "../../utils/currencyUtils";
import {useAppSelector} from "../redux/store";
import {AppSettingsState, settingSelector} from "./appSettings.slice";

export const useSetting = (setting: keyof AppSettingsState) =>
  useAppSelector((state) => settingSelector(state, setting));

export const useAppCurrency = (): Currency => {
  const currencyCode = useSetting("currencyCode");
  return useMemo(() => currenciesByCode[currencyCode as CurrencyCode], [currencyCode]);
};

export const useAppLastSuperfluidRunnerCosmetics = (): Number => {
  return useMemo(() => useSetting("lastSuperfluidRunnerCosmetics") as Number, [useSetting("lastSuperfluidRunnerCosmetics")]);
};
