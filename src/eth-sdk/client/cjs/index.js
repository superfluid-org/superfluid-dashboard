"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainnetSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const flowScheduler_json_1 = __importDefault(require("../../abis/mainnet/flowScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/mainnet/vestingScheduler.json"));
const autoWrapManager_json_1 = __importDefault(require("../../abis/mainnet/autoWrapManager.json"));
const autoWrapStrategy_json_1 = __importDefault(require("../../abis/mainnet/autoWrapStrategy.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA', flowScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x39D5cBBa9adEBc25085a3918d36D5325546C001B', vestingScheduler_json_1.default, defaultSignerOrProvider),
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', autoWrapManager_json_1.default, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', autoWrapStrategy_json_1.default, defaultSignerOrProvider),
    };
}
exports.getMainnetSdk = getMainnetSdk;
