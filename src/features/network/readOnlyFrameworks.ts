import { Framework } from "@superfluid-finance/sdk-core";
import { Provider } from "@wagmi/core";
import { ethers } from "ethers";
import promiseRetry from "promise-retry";
import { wagmiRpcProvider } from "../wallet/WagmiManager";
import { Network, networkDefinition, networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    promiseRetry<Framework>(
      (retry) =>
        Framework.create({
          chainId: network.id,
          provider: wagmiRpcProvider({ chainId: network.id }),
          customSubgraphQueriesEndpoint: network.subgraphUrl,
          resolverAddress: "0x1910f44c232f040b63251e5b27970c254a74a1c7", // Similarly get this from the hardhat node, see below
          // this also should not be hardcoded
          protocolReleaseVersion: "test"
        }).catch(retry),
      {
        minTimeout: 500,
        maxTimeout: 3000,
        retries: 10,
      }
    ),
}));

export default readOnlyFrameworks;
