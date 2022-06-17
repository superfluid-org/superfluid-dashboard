import { ethers } from "ethers";
import { memoize } from "lodash";

export const isAddress = memoize((address: string) =>
  ethers.utils.isAddress(address)
);

export const getAddress = memoize((address: string) =>
  ethers.utils.getAddress(address)
);