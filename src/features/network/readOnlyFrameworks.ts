import { Framework } from "@superfluid-finance/sdk-core";
import promiseRetry from "promise-retry";
import { wagmiPublicClient } from "../wallet/WagmiManager";
import { allNetworks } from "./networks";
import superfluidMetadata from "@superfluid-finance/metadata";
import { publicClientToProvider } from "../../utils/wagmiEthersAdapters";

const readOnlyFrameworks = allNetworks.map((network) => {
  const networkFromMetadata = superfluidMetadata.getNetworkByChainId(
    network.id
  );

  const subgraphEndpoint =
    networkFromMetadata?.subgraphV1?.satsumaEndpoint ??
    networkFromMetadata?.subgraphV1?.hostedEndpoint ??
    network.fallbackSubgraphUrl;

  return {
    chainId: network.id,
    frameworkGetter: () =>
      promiseRetry<Framework>(
        (retry) =>
          Framework.create({
            chainId: network.id,
            provider: publicClientToProvider(
              wagmiPublicClient({ chainId: network.id })
            ),
            customSubgraphQueriesEndpoint: subgraphEndpoint,
          }).catch(retry),
        {
          minTimeout: 500,
          maxTimeout: 3000,
          retries: 10,
        }
      ),
  };
});

export default readOnlyFrameworks;
