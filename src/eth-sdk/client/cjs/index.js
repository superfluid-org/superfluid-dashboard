"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContract = getContract;
exports.getOptimismSepoliaSdk = getOptimismSepoliaSdk;
exports.getMainnetSdk = getMainnetSdk;
const ethers_1 = require("ethers");
const vestingScheduler_v2_json_1 = __importDefault(require("../../abis/optimismSepolia/vestingScheduler_v2.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/optimismSepolia/vestingScheduler.json"));
const flowScheduler_json_1 = __importDefault(require("../../abis/mainnet/flowScheduler.json"));
const autoWrapManager_json_1 = __importDefault(require("../../abis/mainnet/autoWrapManager.json"));
const autoWrapStrategy_json_1 = __importDefault(require("../../abis/mainnet/autoWrapStrategy.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
function getOptimismSepoliaSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler_v2": getContract('0x3aa62b96f44D0f8892BeBBC819DE8e02E9DE69A8', vestingScheduler_v2_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x27444c0235a4D921F3106475faeba0B5e7ABDD7a', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA', flowScheduler_json_1.default, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', autoWrapManager_json_1.default, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', autoWrapStrategy_json_1.default, defaultSignerOrProvider),
    };
}
