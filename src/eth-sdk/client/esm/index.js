import { Contract } from 'ethers';
import goerli_flowScheduler_abi from '../../abis/goerli/flowScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
import polygon_vestingScheduler_abi from '../../abis/polygon/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', goerli_flowScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x2A6dD60Dbb8CE65813842eEe1688b21CA30D6ffd', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
export function getPolygonSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c', polygon_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
