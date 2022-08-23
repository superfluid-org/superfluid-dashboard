import { Contract } from 'ethers';
import goerli_StreamScheduler_abi from '../../abis/goerli/StreamScheduler.json';
import polygonMumbai_StreamScheduler_abi from '../../abis/polygonMumbai/StreamScheduler.json';
export function getContract(address, abi, defaultSignerOrProvider) {
    return new Contract(address, abi, defaultSignerOrProvider);
}
export function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x04851f0be31a98133E2D6bFFDAe56908b05cdBDB', goerli_StreamScheduler_abi, defaultSignerOrProvider),
    };
}
export function getPolygonMumbaiSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x51FBAbD31A615E14b1bC12E9d887f60997264a4E', polygonMumbai_StreamScheduler_abi, defaultSignerOrProvider),
    };
}
