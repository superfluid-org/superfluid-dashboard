import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { memo, ReactNode } from "react";

interface EtherProps {
  wei: BigNumberish;
  etherDecimalPlaces?: number;
  children?: ReactNode;
}

const getDecimalPlaces = (value: Decimal): number => {
  if (value.isZero() || value.gte(1000)) {
    return 0;
  }

  if (value.gte(100)) {
    return 1;
  }

  if (value.gte(10)) {
    return 2;
  }

  if (value.gte(0.009)) {
    return 4;
  }

  if (value.gte(0.0009)) {
    return 6;
  }

  if (value.gte(0.00009)) {
    return 8;
  }

  if (value.gte(0.00000009)) {
    return 12;
  }

  return 18;
} 

// NOTE: Previously known as "EtherFormatted"
export default memo<EtherProps>(function Ether({
  wei,
  etherDecimalPlaces,
  children,
}) {
  const ether = utils.formatEther(wei);
  const decimal = new Decimal(ether);
  const dp = etherDecimalPlaces ?? getDecimalPlaces(decimal);

  return (
    <>
      {decimal
        .toDP(dp, Decimal.ROUND_UP)
        .toFixed(etherDecimalPlaces)}
      {children}
    </>
  );
});
