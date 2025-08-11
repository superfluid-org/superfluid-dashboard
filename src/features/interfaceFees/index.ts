import { parseEther } from "ethers/lib/utils";
import { allNetworks, findNetworkOrThrow, Network } from "../network/networks";
import { BigNumber } from "ethers";
import { memoize } from "lodash";
import { BIG_NUMBER_ZERO } from "../../utils/tokenUtils";

export const interfaceFeeAddress = process.env.NEXT_PUBLIC_INTERFACE_FEE_ADDRESS?.trim() as `0x${string}` | undefined;

export const interfaceFees = {
    createStream: BigNumber.from(1)
} as const;

type IntefaceAction = keyof typeof interfaceFees;

// The fees should be approximately $1.
export const interfaceBaseFeeInNativeCurrency = {
    ETH: parseEther("0.00025"),
    BNB: parseEther("0.00125"),
    CELO: parseEther("3"),
    AVAX: parseEther("0.0425"),
    POL: parseEther("4"),
    XDAI: parseEther("1"),
    DEGEN: parseEther("250")
} as const;

export const getIntefaceFee = memoize(
    (action: IntefaceAction, chainId: number, isEOA: boolean) => {
        if (!isEOA) {
            return BIG_NUMBER_ZERO;
        }

        const network = findNetworkOrThrow(allNetworks, chainId);

        return interfaceFees[action].mul(network.interfaceBaseFeeInNativeCurrency);
    },
    (action, chainId, isEOA) => `${action}_${chainId}_${isEOA}`
);