import Decimal from "decimal.js";
import { BigNumberish, ethers } from "ethers";
import { memo } from "react";

interface EtherFormattedProps {
  wei: BigNumberish;
  etherDecimalPlaces?: number;
  disableRoundingIndicator?: boolean;
}

export default memo<EtherFormattedProps>(function EtherFormatted({
  wei,
  etherDecimalPlaces = 18,
  disableRoundingIndicator = false,
}) {
  const ether = ethers.utils.formatEther(wei);

  if (ether === "0.0") return <>0</>;

  const isRounded = ether.split(".")[1].length > etherDecimalPlaces;

  return (
    <>
      {isRounded && !disableRoundingIndicator && "~"}
      {new Decimal(ether)
        .toDP(etherDecimalPlaces, Decimal.ROUND_DOWN)
        .toFixed(etherDecimalPlaces)}
    </>
  );
});
