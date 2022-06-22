import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { memo, ReactNode } from "react";

interface EtherProps {
  wei: BigNumberish;
  disableRounding?: boolean;
  /**
   * a.k.a "fixed" decimal places
   */
  etherDecimalPlaces?: number;
  roundingIndicator?: "..." | "~";
  children?: ReactNode;
}

const getDecimalPlaces = (value: Decimal): number => {
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

  if (absoluteValue.gt(0.009)) {
    return 4;
  }

  if (absoluteValue.gt(0.0009)) {
    return 6;
  }

  if (absoluteValue.gt(0.00009)) {
    return 8;
  }

  if (absoluteValue.gt(0.00000009)) {
    return 12;
  }

  return 18;
};

// NOTE: Previously known as "EtherFormatted"
export default memo<EtherProps>(function Ether({
  wei,
  disableRounding,
  etherDecimalPlaces,
  roundingIndicator,
  children,
}) {
  const ether = utils.formatEther(wei);
  const decimal = new Decimal(ether);
  const dp = etherDecimalPlaces ?? getDecimalPlaces(decimal);
  const decimalRounded = disableRounding ? decimal : decimal.toDP(dp);
  const isRounded = !decimal.equals(decimalRounded);

  return (
    <>
      {isRounded && roundingIndicator === "~" && "~"}
      {decimalRounded.toFixed(etherDecimalPlaces)}
      {isRounded && roundingIndicator === "..." && "..."}
      {children}
    </>
  );
});
