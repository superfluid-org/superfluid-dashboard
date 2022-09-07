import { Overrides } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Network } from "../features/network/networks";
import gasApi, { GasRecommendation } from "../features/gas/gasApi.slice";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";

const useGetTransactionOverrides = () => {
  const [queryRecommendedGas] = gasApi.useLazyRecommendedGasQuery();
  const { connector: activeConnector } = useAccount();

  return useCallback(
    async (
      transactionTitle: TransactionTitle,
      network: Network
    ): Promise<Overrides> => {
      const gasQueryTimeout = new Promise<null>((response) =>
        setTimeout(() => response(null), 3000)
      );

      const gasRecommendation = await Promise.race<GasRecommendation | null>([
        queryRecommendedGas({ chainId: network.id }).unwrap(),
        gasQueryTimeout,
      ]);

      const overrides: Overrides = {};

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

      const isGnosisSafe = activeConnector?.id === "safe";
      if (isGnosisSafe) {
        overrides.gasLimit = tryGetHardcodedGasLimit(transactionTitle);
      }

      return overrides;
    },
    [queryRecommendedGas, activeConnector]
  );
};

export default useGetTransactionOverrides;

// Very approximate list of safe gas limits for operations invokable from the UI.
const tryGetHardcodedGasLimit = (
  transactionTitle: TransactionTitle
): number | undefined => {
  switch (transactionTitle) {
    case "Create Stream":
      return 415_000;
    case "Update Stream":
      return 365_000;
    case "Close Stream":
      return 350_000;
    case "Revoke Index Subscription":
      return 250_000;
    case "Upgrade to Super Token":
      return 160_000;
    case "Downgrade from Super Token":
      return 245_000;
    case "Approve Index Subscription":
      return 295_000;
    case "Transfer Super Token":
    case "Approve Allowance":
      return undefined; // These operations are safe to use estimation for.
    case "Create Index":
    case "Distribute Index":
    case "Update Index Subscription Units":
    case "Claim from Index Subscription":
    case "Delete Index Subscription":
    default:
      console.warn(`Hard-coded gas limit not defined for: ${transactionTitle}.`);
      return undefined;
  }
};
