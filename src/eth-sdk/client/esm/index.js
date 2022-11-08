import { Contract } from 'ethers';
import goerli_streamScheduler_abi from '../../abis/goerli/streamScheduler.json';
import goerli_vestingScheduler_abi from '../../abis/goerli/vestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "streamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', goerli_streamScheduler_abi, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x91134bC1Ed5FFB24c48F4b1A282231620608b7cc', goerli_vestingScheduler_abi, defaultSignerOrProvider),
    };
}
