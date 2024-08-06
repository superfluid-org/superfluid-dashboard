import { Framework } from "@superfluid-finance/sdk-core";
import promiseRetry from "promise-retry";
import { resolvedWagmiClients } from "../wallet/WagmiManager";
import { allNetworks } from "./networks";
import superfluidMetadata from "@superfluid-finance/metadata";
import { publicClientToProvider } from "../../utils/wagmiEthersAdapters";

const readOnlyFrameworks = allNetworks.map((network) => {
  const networkFromMetadata = superfluidMetadata.getNetworkByChainId(
    network.id
  );
  const subgraphEndpoint = networkFromMetadata ? `https://${networkFromMetadata.name}.subgraph.x.superfluid.dev` : undefined;
  return {
    chainId: network.id,
    frameworkGetter: () =>
      promiseRetry<Framework>(
        (retry) =>
          {
            const publicClient = resolvedWagmiClients[network.id]();
            return Framework.create({
              chainId: network.id,
              provider: publicClientToProvider(publicClient),
              customSubgraphQueriesEndpoint: subgraphEndpoint,
            }).catch(retry);
          },
        {
          minTimeout: 500,
          maxTimeout: 3000,
          retries: 10,
        }
      ),
  };
});

export default readOnlyFrameworks;
