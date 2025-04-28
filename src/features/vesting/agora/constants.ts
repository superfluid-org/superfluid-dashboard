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
    // [optimismSepolia.id]: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/onchain-builders",
    [optimism.id]: {
        onchain_builders: `https://atlas.optimism.io/api/v1/rewards/7/onchain-builders`,
        dev_tooling: "https://atlas.optimism.io/api/v1/rewards/7/dev-tooling"
    },
    [optimismSepolia.id]: {
        onchain_builders: `${APP_URL}/api/mock`,
        // onchain_builders: "https://op-atlas-git-stepan-rewards-claiming-voteagora.vercel.app/api/v1/rewards/7/onchain-builders",
        dev_tooling: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/dev-tooling",
    },
} as const satisfies Record<number, Record<RoundType, string>>;

export const validChainIds = Object.keys(agoraApiEndpoints).map(Number);

export const agoraSenderAddresses = {
    [optimism.id]: {
        onchain_builders: "0x823557699A455F3c2C6f964017880f3f3a6583Ac".toLowerCase() as Address,
        dev_tooling: "0xA2928CC2D210bC42d8ffe5Ad8b1314E872F5fb54".toLowerCase() as Address
    },
    [optimismSepolia.id]: null
} as const satisfies Record<number, Record<RoundType, Address> | null>;

export const isAgoraSender = (chainId: number, address: Address) => {
    const addressLowerCased = address.toLowerCase();
    if (chainId === optimism.id) {
        return addressLowerCased === agoraSenderAddresses[optimism.id].dev_tooling ||
            addressLowerCased === agoraSenderAddresses[optimism.id].onchain_builders;
    }
    if (chainId === optimismSepolia.id) {
        return true;
    }
    return false;
}

export const START_TIMESTAMP_OF_FIRST_TRANCH_ON_OPTIMISM = 1745931600; // 29th of April, 2025