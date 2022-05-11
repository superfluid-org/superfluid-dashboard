import { BigNumber } from "ethers";
import { Network } from "../network/networks";
import { calculateTotalAmountWei, FlowRateWithTime } from "./FlowRateInput";

export const calculateBufferAmount = (params: {
  flowRateWithTime: FlowRateWithTime;
  network: Network;
}): BigNumber => {
  const { flowRateWithTime, network } = params;

  const bufferAmount = calculateTotalAmountWei(flowRateWithTime)
    .mul(network.bufferTimeInMinutes)
    .mul(60);

  return bufferAmount;
};
