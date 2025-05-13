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

export const interfaceBaseFeeInNativeCurrency = {
    ETH: parseEther("0.0003"),
    BNB: parseEther("0.0015"),
    CELO: parseEther("2"),
    AVAX: parseEther("0.0325"),
    POL: parseEther("3"),
    XDAI: parseEther("1"),
    DEGEN: parseEther("200")
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