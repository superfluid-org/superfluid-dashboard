import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import promiseRetry from "promise-retry";
import { wagmiRpcProvider } from "../wallet/WagmiManager";
import { networkDefinition, networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    promiseRetry<Framework>(
      (retry) =>
        Framework.create({
          chainId: network.id,
          provider: wagmiRpcProvider({ chainId: network.id }),
          customSubgraphQueriesEndpoint:
            network === networkDefinition.gnosis &&
            new Date() < new Date(2022, 10, 4, 12) // Use Satsuma until trial period ends.
              ? "https://subgraph.satsuma-prod.com/superfluid/xdai/api"
              : undefined,
        }).catch(retry),
      {
        minTimeout: 500,
        maxTimeout: 3000,
        retries: 10,
      }
    ),
}));

export default readOnlyFrameworks;
