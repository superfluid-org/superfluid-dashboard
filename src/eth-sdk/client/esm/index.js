import { Contract } from 'ethers';
import goerli_StreamScheduler_abi from '../../abis/goerli/StreamScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x04851f0be31a98133E2D6bFFDAe56908b05cdBDB', goerli_StreamScheduler_abi, defaultSignerOrProvider),
    };
}
