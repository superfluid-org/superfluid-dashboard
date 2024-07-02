"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContract = getContract;
exports.getOptimismSepoliaSdk = getOptimismSepoliaSdk;
exports.getMainnetSdk = getMainnetSdk;
const ethers_1 = require("ethers");
const vestingScheduler_json_1 = __importDefault(require("../../abis/optimismSepolia/vestingScheduler.json"));
const flowScheduler_json_1 = __importDefault(require("../../abis/mainnet/flowScheduler.json"));
const autoWrapManager_json_1 = __importDefault(require("../../abis/mainnet/autoWrapManager.json"));
const autoWrapStrategy_json_1 = __importDefault(require("../../abis/mainnet/autoWrapStrategy.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
function getOptimismSepoliaSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0x55DbCe3f4968616E8a3c0a04D76b5Fdf420AF5F5', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA', flowScheduler_json_1.default, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', autoWrapManager_json_1.default, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', autoWrapStrategy_json_1.default, defaultSignerOrProvider),
    };
}
