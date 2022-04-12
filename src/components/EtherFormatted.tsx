import Decimal from "decimal.js";
import { BigNumberish, ethers } from "ethers";
import { FC } from "react";

const EtherFormatted: FC<{ wei: BigNumberish, etherDecimalPlaces?: number }> = ({ wei, etherDecimalPlaces = 18 }) => {
  const ether = ethers.utils.formatEther(wei);
  const isRounded = ether.split(".")[1].length > etherDecimalPlaces;

  return <>{isRounded && "~"}{new Decimal(ether).toDP(etherDecimalPlaces, Decimal.ROUND_DOWN).toFixed()}</>;
};

export default EtherFormatted;