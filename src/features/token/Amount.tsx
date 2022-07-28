import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { memo, ReactNode } from "react";

interface AmountProps {
  wei: BigNumberish;
  /**
   * Defaults to 18 which is what super tokens always have. 
   * IMPORTANT: Make sure to pass in this value when you need to display balance of an underlying token and the wei amount was denominated in underlying token's decimals.
   * a.k.a "token decimals", "unit"
   */
  decimals?: number;
  /**
   * a.k.a "fixed" _visible_ decimal places
   */
  decimalPlaces?: number;
  disableRounding?: boolean;
  roundingIndicator?: "..." | "~";
  children?: ReactNode;
}

const getDecimalPlacesToRoundTo = (value: Decimal): number => {
  if (value.isZero()) {
    return 0;
  }

  const absoluteValue = value.abs();

  if (absoluteValue.gte(1000)) {
    return 0;
  }

  if (absoluteValue.gte(100)) {
    return 1;
  }

  if (absoluteValue.gte(10)) {
    return 2;
  }

  if (absoluteValue.gte(0.099)) {
    return 4;
  }

  if (absoluteValue.gte(0.00099)) {
    return 6;
  }

  if (absoluteValue.gte(0.0000099)) {
    return 8;
  }

  if (absoluteValue.gte(0.000000099)) {
    return 12;
  }

  if (absoluteValue.gte(0.0000000000099)) {
    return 16;
  }

  return 18;
};

// NOTE: Previously known as "EtherFormatted" & "Ether"
export default memo<AmountProps>(function Amount({
  wei,
  decimals = 18,
  disableRounding,
  roundingIndicator,
  children,
  ...props
}) {
  const decimal = new Decimal(utils.formatUnits(wei, decimals));
  const decimalPlacesToRoundTo = props.decimalPlaces ?? getDecimalPlacesToRoundTo(decimal);
  const decimalPlacesToDisplay = props.decimalPlaces ?? undefined; // "undefined" means that trailing zeroes will be removed by `toFixed`
  const decimalRounded = disableRounding ? decimal : decimal.toDP(decimalPlacesToRoundTo);
  const isRounded = !decimal.equals(decimalRounded);

  return (
    <>
      {isRounded && roundingIndicator === "~" && "~"}
      {decimalRounded.toFixed(decimalPlacesToDisplay)}
      {isRounded && roundingIndicator === "..." && "..."}
      {children}
    </>
  );
});
