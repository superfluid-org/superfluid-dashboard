import { parseGwei } from "viem";
import { Network } from "../features/network/networks";
import gasApi, { GasRecommendation } from "../features/gas/gasApi.slice";
import { useCallback } from "react";
import { useAccount } from "@/hooks/useAccount"
import { popGlobalGasOverrides } from "../global";
import { ViemFeeOverrides } from "../features/transactions/viemFeeOverrides";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const useGetTransactionOverrides = () => {
  const [queryRecommendedGas] = gasApi.useLazyRecommendedGasQuery();
  const { connector: activeConnector } = useAccount();
  const { isEOA } = useVisibleAddress();
  
  return useCallback(
    async (network: Network): Promise<ViemFeeOverrides> => {
      const gasQueryTimeout = new Promise<null>((response) =>
        setTimeout(() => response(null), 3000)
      );

      const gasRecommendation = await Promise.race<GasRecommendation | null>([
        queryRecommendedGas({ chainId: network.id }).unwrap(),
        gasQueryTimeout,
      ]);

      const overrides: ViemFeeOverrides = {};

      if (gasRecommendation) {
        overrides.maxPriorityFeePerGas = parseGwei(
          gasRecommendation.maxPriorityFeeGwei.toFixed(8)
        );
        overrides.maxFeePerGas = parseGwei(
          gasRecommendation.maxFeeGwei.toFixed(8)
        );
      }

      if (isEOA === false) {
        overrides.gas = 0n; // Disable gas estimation for Gnosis Safe (and other smart wallets) completely because they don't use it anyway.
      }

      const globalOverrides = popGlobalGasOverrides();
      return { ...overrides, ...globalOverrides };
    },
    [queryRecommendedGas, activeConnector, isEOA]
  );
};

export default useGetTransactionOverrides;
