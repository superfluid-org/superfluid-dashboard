import Decimal from "decimal.js";
import { BigNumberish, ethers } from "ethers";
import { memo } from "react";

export default memo(function EtherFormatted({ wei, etherDecimalPlaces = 18 } : { wei: BigNumberish, etherDecimalPlaces?: number}) {
  const ether = ethers.utils.formatEther(wei);
  const isRounded = ether.split(".")[1].length > etherDecimalPlaces;

  if (ether === "0.0") {
    return <>0</>;
  }

  return (
    <>
      {isRounded && "~"}
      {new Decimal(ether)
        .toDP(etherDecimalPlaces, Decimal.ROUND_DOWN)
        .toFixed()}
    </>
  );
});
