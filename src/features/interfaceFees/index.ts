import { parseEther } from "ethers/lib/utils";

export const interfaceFeeAddress = process.env.NEXT_PUBLIC_INTERFACE_FEE_ADDRESS?.trim() as `0x${string}` | undefined;

export const interfaceFees = {
    createStream: 1
} as const;

// The fees should be approximately $1.
export const interfaceBaseFeeInNativeCurrency = {
    ETH: parseEther("0.00035"),
    BNB: parseEther("0.0015"),
    CELO: parseEther("2"),
    AVAX: parseEther("0.0375"),
    POL: parseEther("4"),
    XDAI: parseEther("1"),
    DEGEN: parseEther("200")
} as const;