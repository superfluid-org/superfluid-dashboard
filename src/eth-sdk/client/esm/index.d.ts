import { providers, Signer } from 'ethers';
import * as types from './types';
export declare function getContract(address: string, abi: object, defaultSignerOrProvider: Signer | providers.Provider): any;
export type PolygonMumbaiSdk = ReturnType<typeof getPolygonMumbaiSdk>;
export declare function getPolygonMumbaiSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    flowScheduler: types.polygonMumbai.FlowScheduler;
};
export type MainnetSdk = ReturnType<typeof getMainnetSdk>;
export declare function getMainnetSdk(defaultSignerOrProvider: Signer | providers.Provider): {
    vestingScheduler: types.mainnet.VestingScheduler;
    autoWrapManager: types.mainnet.AutoWrapManager;
    autoWrapStrategy: types.mainnet.AutoWrapStrategy;
};
