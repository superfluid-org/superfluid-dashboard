import { ethers } from "ethers";
import { memoize } from "lodash";

export const getAddress = memoize((address: string) =>
  ethers.utils.getAddress(address)
);