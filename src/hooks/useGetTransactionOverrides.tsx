import { parseUnits } from "ethers/lib/utils";
import { Network } from "../features/network/networks";
import gasApi, { GasRecommendation } from "../features/gas/gasApi.slice";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { merge } from "lodash";
import { popGlobalGasOverrides } from "../global";
import { GlobalGasOverrides } from "../typings/global";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const useGetTransactionOverrides = () => {
  const [queryRecommendedGas] = gasApi.useLazyRecommendedGasQuery();
  const { connector: activeConnector } = useAccount();
  const { isEOA } = useVisibleAddress();
  
  return useCallback(
    async (network: Network): Promise<GlobalGasOverrides> => {
      const gasQueryTimeout = new Promise<null>((response) =>
        setTimeout(() => response(null), 3000)
      );

      const gasRecommendation = await Promise.race<GasRecommendation | null>([
        queryRecommendedGas({ chainId: network.id }).unwrap(),
        gasQueryTimeout,
      ]);

      const overrides: GlobalGasOverrides = {};

      if (gasRecommendation) {
        overrides.maxPriorityFeePerGas = parseUnits(
          gasRecommendation.maxPriorityFeeGwei.toFixed(8).toString(),
          "gwei"
        );
        overrides.maxFeePerGas = parseUnits(
          gasRecommendation.maxFeeGwei.toFixed(8).toString(),
          "gwei"
        );
      }

      if (!isEOA) {
        overrides.gasLimit = 0; // Disable gas estimation for Gnosis Safe (and other smart wallets) completely because they don't use it anyway.
      }

      const globalOverrides = popGlobalGasOverrides();
      return merge(overrides, globalOverrides);
    },
    [queryRecommendedGas, activeConnector, isEOA]
  );
};

export default useGetTransactionOverrides;
