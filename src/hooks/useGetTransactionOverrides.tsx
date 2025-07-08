import { parseUnits } from "ethers/lib/utils";
import { Network } from "../features/network/networks";
import gasApi, { GasRecommendation } from "../features/gas/gasApi.slice";
import { useCallback } from "react";
import { useAccount } from "@/hooks/useAccount"
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
      console.log('⚙️ Building transaction overrides:', {
        networkId: network.id,
        networkName: network.name,
        connectorId: activeConnector?.id,
        connectorName: activeConnector?.name,
        isEOA,
        isAA: !isEOA // Account Abstraction
      });

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
        console.log('💰 Gas recommendation applied:', {
          maxFeeGwei: gasRecommendation.maxFeeGwei,
          maxPriorityFeeGwei: gasRecommendation.maxPriorityFeeGwei
        });
      } else {
        console.log('⚠️ No gas recommendation received (using network defaults)');
      }

      if (!isEOA) {
        overrides.gasLimit = 0; // Disable gas estimation for Gnosis Safe (and other smart wallets) completely because they don't use it anyway.
        console.log('🔧 Gas estimation disabled for Account Abstraction wallet');
      } else {
        console.log('🔧 Gas estimation enabled for EOA wallet');
      }

      const globalOverrides = popGlobalGasOverrides();
      const finalOverrides = merge(overrides, globalOverrides);
      
      console.log('✅ Final transaction overrides:', finalOverrides);
      
      return finalOverrides;
    },
    [queryRecommendedGas, activeConnector, isEOA]
  );
};

export default useGetTransactionOverrides;
