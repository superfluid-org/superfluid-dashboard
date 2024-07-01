import { Contract } from 'ethers';
import optimismSepolia_vestingScheduler_abi from '../../abis/optimismSepolia/vestingScheduler.json';
import mainnet_flowScheduler_abi from '../../abis/mainnet/flowScheduler.json';
import mainnet_autoWrapManager_abi from '../../abis/mainnet/autoWrapManager.json';
import mainnet_autoWrapStrategy_abi from '../../abis/mainnet/autoWrapStrategy.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getOptimismSepoliaSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0xc340dc452C4704a4E24f92BeF4F04B20C6587581', optimismSepolia_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
export function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA', mainnet_flowScheduler_abi, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', mainnet_autoWrapManager_abi, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', mainnet_autoWrapStrategy_abi, defaultSignerOrProvider),
    };
}
