import { Overrides } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Network } from "../features/network/networks";

export const getDefaultGasOverrides = (network: Network): Overrides => {
  const isPolygon = network.id === 137;
  const isPolygonMumbai = network.id === 80001; 
  if (isPolygon || isPolygonMumbai) {
    // Hardcode a minimum to resolve underpriced transactions.
    // NOTE: Why 31? Didi: "30 gwei is the minimum on at least some validators and +1 shouldn't hurt"
    // NOTE: Why both "maxFeePerGas" & "maxPriorityFeePerGas"? Didi: "note that this min value needs to be applied to maxPriorityFeePerGas too, not just maxFeePerGas. in case you're using the non-eip1559 api (just gasPrice), that's afaik the case"
    return {
      maxFeePerGas: parseUnits("31", "gwei"),
      maxPriorityFeePerGas: parseUnits("31", "gwei"),
    };
  }

  return {};
};
