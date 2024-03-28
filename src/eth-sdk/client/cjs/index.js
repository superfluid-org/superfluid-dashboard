"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainnetSdk = exports.getPolygonMumbaiSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const flowScheduler_json_1 = __importDefault(require("../../abis/polygonMumbai/flowScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/polygonMumbai/vestingScheduler.json"));
const autoWrapManager_json_1 = __importDefault(require("../../abis/mainnet/autoWrapManager.json"));
const autoWrapStrategy_json_1 = __importDefault(require("../../abis/mainnet/autoWrapStrategy.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getPolygonMumbaiSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0x59A3Ba9d34c387FB70b4f4e4Fbc9eD7519194139', flowScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x3962EE56c9f7176215D149938BA685F91aBB633B', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getPolygonMumbaiSdk = getPolygonMumbaiSdk;
function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "autoWrapManager": getContract('0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1', autoWrapManager_json_1.default, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d', autoWrapStrategy_json_1.default, defaultSignerOrProvider),
    };
}
exports.getMainnetSdk = getMainnetSdk;
