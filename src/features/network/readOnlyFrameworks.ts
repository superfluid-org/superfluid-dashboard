import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import promiseRetry from "promise-retry";
import { networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    promiseRetry<Framework>(
      () =>
        Framework.create({
          chainId: network.id,
          provider: new ethers.providers.JsonRpcProvider(
            network.rpcUrls.superfluid
          ),
        }),
      {
        minTimeout: 1000,
        retries: 5,
      }
    ),
}));

export default readOnlyFrameworks;
