import { Contract } from 'ethers';
import optimismSepolia_vestingScheduler_v3_abi from '../../abis/optimismSepolia/vestingScheduler_v3.json';
import optimismSepolia_vestingScheduler_v2_abi from '../../abis/optimismSepolia/vestingScheduler_v2.json';
import optimismSepolia_vestingScheduler_abi from '../../abis/optimismSepolia/vestingScheduler.json';
import mainnet_flowScheduler_abi from '../../abis/mainnet/flowScheduler.json';
import mainnet_autoWrapManager_abi from '../../abis/mainnet/autoWrapManager.json';
import mainnet_autoWrapStrategy_abi from '../../abis/mainnet/autoWrapStrategy.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getOptimismSepoliaSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler_v3": getContract('0x4F4BC2ca9A7CA26AfcFabc6A2A381c104927D72C', optimismSepolia_vestingScheduler_v3_abi, defaultSignerOrProvider),
        "vestingScheduler_v2": getContract('0x3aa62b96f44D0f8892BeBBC819DE8e02E9DE69A8', optimismSepolia_vestingScheduler_v2_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x27444c0235a4D921F3106475faeba0B5e7ABDD7a', optimismSepolia_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
export function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA', mainnet_flowScheduler_abi, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', mainnet_autoWrapManager_abi, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', mainnet_autoWrapStrategy_abi, defaultSignerOrProvider),
    };
}
