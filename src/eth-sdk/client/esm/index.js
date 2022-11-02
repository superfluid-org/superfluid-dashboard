import { Contract } from 'ethers';
import goerli_StreamScheduler_abi from '../../abis/goerli/StreamScheduler.json';
import goerli_VestingScheduler_abi from '../../abis/goerli/VestingScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', goerli_StreamScheduler_abi, defaultSignerOrProvider),
        "VestingScheduler": getContract('0xaab383b52F17E709fA5E5fD016D3205F563D89c7', goerli_VestingScheduler_abi, defaultSignerOrProvider),
    };
}
