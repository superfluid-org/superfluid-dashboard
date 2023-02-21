import { Framework } from "@superfluid-finance/sdk-core";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import promiseRetry from "promise-retry";
import { wagmiRpcProvider } from "../wallet/WagmiManager";
import { allNetworks } from "./networks";

const readOnlyFrameworks = allNetworks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    promiseRetry<Framework>(
      (retry) =>
        Framework.create({
          chainId: network.id,
          provider: wagmiRpcProvider({ chainId: network.id }),
          customSubgraphQueriesEndpoint: network.subgraphUrl,
        }).catch(retry),
      {
        minTimeout: 500,
        maxTimeout: 3000,
        retries: 10,
      }
    ),
}));

readOnlyFrameworks.forEach(
  (x) => void setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
);

export default readOnlyFrameworks;
