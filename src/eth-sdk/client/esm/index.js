import { Contract } from 'ethers';
import goerli_StreamScheduler_abi from '../../abis/goerli/StreamScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x3eAB3c6207F488E475b7955B631B564F0E6317B9', goerli_StreamScheduler_abi, defaultSignerOrProvider),
    };
}
