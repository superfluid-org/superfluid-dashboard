import { Contract } from 'ethers';
import avalancheFuji_flowScheduler_abi from '../../abis/avalancheFuji/flowScheduler.json';
import mainnet_vestingScheduler_abi from '../../abis/mainnet/vestingScheduler.json';
import mainnet_autoWrapManager_abi from '../../abis/mainnet/autoWrapManager.json';
import mainnet_autoWrapStrategy_abi from '../../abis/mainnet/autoWrapStrategy.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getAvalancheFujiSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0x59A3Ba9d34c387FB70b4f4e4Fbc9eD7519194139', avalancheFuji_flowScheduler_abi, defaultSignerOrProvider),
    };
}
export function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0x39D5cBBa9adEBc25085a3918d36D5325546C001B', mainnet_vestingScheduler_abi, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', mainnet_autoWrapManager_abi, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', mainnet_autoWrapStrategy_abi, defaultSignerOrProvider),
    };
}
