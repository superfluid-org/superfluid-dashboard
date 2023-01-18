import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export declare type GoerliSdk = ReturnType<typeof getGoerliSdk>;
export declare function getGoerliSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.goerli.FlowScheduler;
};
export declare type MainnetSdk = ReturnType<typeof getMainnetSdk>;
export declare function getMainnetSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    vestingScheduler: types.mainnet.VestingScheduler;
};
