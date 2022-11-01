import Decimal from "decimal.js";
import { FC, memo, useMemo } from "react";
import { useAppCurrency } from "../settings/appSettingsHooks";

const FIAT_PRECISION_REGEX = `\\.([0]*)`;

const getFiatPrecision = (price: string, offset = 2) => {
  const result = new RegExp(FIAT_PRECISION_REGEX, "gm").exec(price);
  return Math.max(result ? result[1].length + offset : 2, offset);
};

interface FiatAmountProps {
  amount: string;
  price: number;
  decimalPlaces?: number;
}

const FiatAmount: FC<FiatAmountProps> = ({ amount, price, decimalPlaces }) => {
  const currency = useAppCurrency();

  const priceDecimal = useMemo(() => {
    return new Decimal(amount).mul(new Decimal(price));
  }, [amount, price]);

  const decimals = useMemo(
    () => decimalPlaces || getFiatPrecision(priceDecimal.toString() || "1"),
    [decimalPlaces, priceDecimal]
  );

  return <>{currency.format(priceDecimal.toFixed(decimals))}</>;
};

export default memo(FiatAmount);
