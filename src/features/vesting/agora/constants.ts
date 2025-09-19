import { Address } from "viem";
import { optimism, optimismSepolia } from "wagmi/chains";

export type RoundType = "onchain_builders" | "dev_tooling"
export const roundTypes: Record<RoundType, RoundType> = {
    onchain_builders: "onchain_builders",
    dev_tooling: "dev_tooling"
} as const satisfies Record<RoundType, RoundType>;

export const tokenAddresses = {
    [optimism.id]: "0x1828Bff08BD244F7990edDCd9B19cc654b33cDB4", // OPx
    [optimismSepolia.id]: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7" // ETHx
} as const satisfies Record<number, Address>;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
export const agoraApiEndpoints = {
    [optimism.id]: {
        rf7: {
            onchain_builders: `https://atlas.optimism.io/api/v1/rewards/7/onchain-builders`,
            dev_tooling: "https://atlas.optimism.io/api/v1/rewards/7/dev-tooling"
        },
        rf8: {
            onchain_builders: `https://atlas.optimism.io/api/v1/rewards/8/onchain-builders`,
            dev_tooling: "https://atlas.optimism.io/api/v1/rewards/8/dev-tooling"
        }
    },
    // [optimismSepolia.id]: {
    //     rf7: {
    //         onchain_builders: `${APP_URL}/api/mock`,
    //         dev_tooling: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/dev-tooling",
    //     },
    //     rf8: {
    //         onchain_builders: `${APP_URL}/api/mock`,
    //         dev_tooling: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/8/dev-tooling",
    //     }
    // },
} as const satisfies Record<number, Record<RoundIdentifier, Record<RoundType, string>>>;

export const validChainIds = Object.keys(agoraApiEndpoints).map(Number);

export type RoundIdentifier = "rf7" | "rf8";

export const agoraSenderAddresses = {
    [optimism.id]: {
        rf7: {
            onchain_builders: "0x823557699A455F3c2C6f964017880f3f3a6583Ac".toLowerCase() as Address,
            dev_tooling: "0xA2928CC2D210bC42d8ffe5Ad8b1314E872F5fb54".toLowerCase() as Address
        },
        rf8: {
            onchain_builders: "0x37606E9C052CB5A85B2E2322E36AC03111e9Dd04".toLowerCase() as Address,
            dev_tooling: "0x3f750de67A00e8606aC74c298e4F910c721e1e37".toLowerCase() as Address
        }
    },
    [optimismSepolia.id]: null
} as const satisfies Record<number, Record<RoundIdentifier, Record<RoundType, Address>> | null>;

export const isAgoraSender = (chainId: number, address: Address, round: RoundIdentifier, roundType?: RoundType) => {
    const addressLowerCased = address.toLowerCase();
    if (chainId === optimism.id) {
        const agoraSenders: Address[] = [];
        const roundSenders = agoraSenderAddresses[optimism.id][round];
        if (!roundSenders) return false;

        switch (roundType) {
            case "onchain_builders":
                agoraSenders.push(roundSenders.onchain_builders);
                break;
            case "dev_tooling":
                agoraSenders.push(roundSenders.dev_tooling);
                break;
            default:
                agoraSenders.push(roundSenders.dev_tooling);
                agoraSenders.push(roundSenders.onchain_builders);
                break;
        }

        return agoraSenders.some(sender => sender === addressLowerCased);
    }
    if (chainId === optimismSepolia.id) {
        return true;
    }
    return false;
}

export const ROUND_START_TIMESTAMPS = {
    rf7: 1746637200, // May 7, 2025
    rf8: 1758528000  // September 22, 2025 12:00 UTC
} as const satisfies Record<RoundIdentifier, number>;
