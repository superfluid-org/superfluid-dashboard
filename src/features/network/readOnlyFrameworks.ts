import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { networks } from "./networks";

const readOnlyFrameworks = networks.map((network) => ({
  chainId: network.id,
  frameworkGetter: () =>
    Framework.create({
      chainId: network.id,
      provider: new ethers.providers.JsonRpcProvider(network.rpcUrls.superfluid),
    }),
}));

export default readOnlyFrameworks;
