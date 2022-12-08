import { Contract } from 'ethers';
import goerli_flowScheduler_abi from '../../abis/goerli/flowScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', goerli_flowScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x46fd3EfDD1d19694403dbE967Ee1D7842eE0E131', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
