import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import promiseRetry from "promise-retry";
import { networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    promiseRetry<Framework>(
      (retry) =>
        Framework.create({
          chainId: network.id,
          provider: new ethers.providers.JsonRpcProvider(
            network.rpcUrls.superfluid
          ),
        }).catch(retry),
      {
        minTimeout: 500,
        maxTimeout: 3000,
        retries: 10,
      }
    ),
}));

export default readOnlyFrameworks;
