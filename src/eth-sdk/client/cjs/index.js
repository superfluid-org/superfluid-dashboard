"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainnetSdk = exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const autoWrapManager_json_1 = __importDefault(require("../../abis/goerli/autoWrapManager.json"));
const autoWrapStrategy_json_1 = __importDefault(require("../../abis/goerli/autoWrapStrategy.json"));
const flowScheduler_json_1 = __importDefault(require("../../abis/goerli/flowScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/mainnet/vestingScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "autoWrapManager": getContract('0x0B82D14E9616ca4d260E77454834AdCf5887595F', autoWrapManager_json_1.default, defaultSignerOrProvider),
        "autoWrapStrategy": getContract('0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60', autoWrapStrategy_json_1.default, defaultSignerOrProvider),
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', flowScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
function getMainnetSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0x39D5cBBa9adEBc25085a3918d36D5325546C001B', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getMainnetSdk = getMainnetSdk;
