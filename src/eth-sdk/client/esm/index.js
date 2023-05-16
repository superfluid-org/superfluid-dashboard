import { Contract } from 'ethers';
import goerli_autoWrapManager_abi from '../../abis/goerli/autoWrapManager.json';
import goerli_autoWrapStrategy_abi from '../../abis/goerli/autoWrapStrategy.json';
import goerli_flowScheduler_abi from '../../abis/goerli/flowScheduler.json';
import mainnet_vestingScheduler_abi from '../../abis/mainnet/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "autoWrapManager": getContract('0x0B82D14E9616ca4d260E77454834AdCf5887595F', goerli_autoWrapManager_abi, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60', goerli_autoWrapStrategy_abi, defaultSignerOrProvider),
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', goerli_flowScheduler_abi, defaultSignerOrProvider),
    };
}
export function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0x39D5cBBa9adEBc25085a3918d36D5325546C001B', mainnet_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
