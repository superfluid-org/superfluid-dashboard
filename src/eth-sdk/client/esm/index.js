import { Contract } from 'ethers';
import goerli_streamScheduler_abi from '../../abis/goerli/streamScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "streamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', goerli_streamScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x6f54e4744b13879482b5a487e832b23e566661b5', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
