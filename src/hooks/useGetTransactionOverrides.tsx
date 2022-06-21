import { Overrides } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Network } from "../features/network/networks";
import gasApi, { GasRecommendation } from "../features/gas/gasApi.slice";

const useGetTransactionOverrides = () => {
  const [queryRecommendedGas] = gasApi.useLazyRecommendedGasQuery();

  return async (network: Network): Promise<Overrides> => {
    const gasQueryTimeout = new Promise<null>((response) =>
      setTimeout(() => response(null), 3000)
    );

    const gasRecommendation = await Promise.race<GasRecommendation | null>([
      queryRecommendedGas({ chainId: network.id }).unwrap(),
      gasQueryTimeout,
    ]);

    if (gasRecommendation) {
      return {
        maxPriorityFeePerGas: parseUnits(
          gasRecommendation.maxPriorityFeeGwei.toFixed(8).toString(),
          "gwei"
        ),
        maxFeePerGas: parseUnits(
          gasRecommendation.maxFeeGwei.toFixed(8).toString(),
          "gwei"
        ),
      };
    } else {
      return {};
    }
  };
};

export default useGetTransactionOverrides;
