import { Contract } from 'ethers';
import goerli_flowScheduler_abi from '../../abis/goerli/flowScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', goerli_flowScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0xD2542C725291aE9b7f088B73525F9Bc1e4B4f21C', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
