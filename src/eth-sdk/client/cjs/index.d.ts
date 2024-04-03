import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export type AvalancheFujiSdk = ReturnType<typeof getAvalancheFujiSdk>;
export declare function getAvalancheFujiSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.avalancheFuji.FlowScheduler;
};
export type MainnetSdk = ReturnType<typeof getMainnetSdk>;
export declare function getMainnetSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    vestingScheduler: types.mainnet.VestingScheduler;
    autoWrapManager: types.mainnet.AutoWrapManager;
    autoWrapStrategy: types.mainnet.AutoWrapStrategy;
};
