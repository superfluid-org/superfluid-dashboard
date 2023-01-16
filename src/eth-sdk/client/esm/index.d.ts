import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export declare type GoerliSdk = ReturnType<typeof getGoerliSdk>;
export declare function getGoerliSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.goerli.FlowScheduler;
    vestingScheduler: types.goerli.VestingScheduler;
};
export declare type PolygonSdk = ReturnType<typeof getPolygonSdk>;
export declare function getPolygonSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    vestingScheduler: types.polygon.VestingScheduler;
};
