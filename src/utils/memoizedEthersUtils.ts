import { utils } from "ethers";
import { memoize } from "lodash";

export const isAddress = memoize((address: string) =>
    utils.isAddress(address.toLowerCase())
);

export const getAddress = memoize((address: string) =>
    utils.getAddress(address.toLowerCase())
);
