import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export type OptimismSepoliaSdk = ReturnType<typeof getOptimismSepoliaSdk>;
export declare function getOptimismSepoliaSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    vestingScheduler_v3: types.optimismSepolia.VestingScheduler_v3;
    vestingScheduler_v2: types.optimismSepolia.VestingScheduler_v2;
    vestingScheduler: types.optimismSepolia.VestingScheduler;
};
export type MainnetSdk = ReturnType<typeof getMainnetSdk>;
export declare function getMainnetSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.mainnet.FlowScheduler;
    autoWrapManager: types.mainnet.AutoWrapManager;
    autoWrapStrategy: types.mainnet.AutoWrapStrategy;
};
