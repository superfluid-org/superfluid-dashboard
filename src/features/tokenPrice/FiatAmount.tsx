import Decimal from "decimal.js";
import { FC, memo, useMemo } from "react";

const FIAT_PRECISION_REGEX = `\\.([0]*)`;

const getFiatPrecision = (price: string, offset = 2) => {
  const result = new RegExp(FIAT_PRECISION_REGEX, "gm").exec(price);
  return Math.max(result ? result[1].length + offset : 2, offset);
};

interface FiatAmountProps {
  price?: string;
  decimalPlaces?: number;
}

const FiatAmount: FC<FiatAmountProps> = ({ price, decimalPlaces }) => {
  const decimals = useMemo(
    () => decimalPlaces || getFiatPrecision(price || "0"),
    [decimalPlaces, price]
  );

  if (!price) return null;

  const priceDecimal = new Decimal(price);

  return <>{`$${priceDecimal.toFixed(decimals)}`}</>;
};

export default memo(FiatAmount);
