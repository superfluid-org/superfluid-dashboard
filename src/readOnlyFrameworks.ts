import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.chainId,
  frameworkGetter: () =>
    Framework.create({
      chainId: network.chainId,
      provider: new ethers.providers.JsonRpcProvider(network.rpcUrl),
    }),
}));

export default readOnlyFrameworks;
