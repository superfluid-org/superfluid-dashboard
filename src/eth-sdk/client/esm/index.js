import { Contract } from 'ethers';
import goerli_flowScheduler_abi from '../../abis/goerli/flowScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0x5b2D8d18FE90D840cbc012a8a06C3EeAA5cBe1a6', goerli_flowScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x6f54e4744b13879482b5a487e832b23e566661b5', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
