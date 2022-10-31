import { Contract } from 'ethers';
import goerli_StreamScheduler_abi from '../../abis/goerli/StreamScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', goerli_StreamScheduler_abi, defaultSignerOrProvider),
    };
}
