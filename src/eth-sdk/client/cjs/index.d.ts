import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export type MainnetSdk = ReturnType<typeof getMainnetSdk>;
export declare function getMainnetSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.mainnet.FlowScheduler;
    vestingScheduler: types.mainnet.VestingScheduler;
    autoWrapManager: types.mainnet.AutoWrapManager;
    autoWrapStrategy: types.mainnet.AutoWrapStrategy;
};
