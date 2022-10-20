import Decimal from "decimal.js";
import { FC, memo, useMemo } from "react";

interface FiatAmountProps {
  price?: string;
  decimalPlaces?: number;
}

const FiatAmount: FC<FiatAmountProps> = ({ price, decimalPlaces = 2 }) => {
  if (!price) return null;

  const priceDecimal = new Decimal(price);

  return <>{`$${priceDecimal.toFixed(decimalPlaces)}`}</>;
};

export default memo(FiatAmount);
