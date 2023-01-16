"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolygonSdk = exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const flowScheduler_json_1 = __importDefault(require("../../abis/goerli/flowScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/goerli/vestingScheduler.json"));
const vestingScheduler_json_2 = __importDefault(require("../../abis/polygon/vestingScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', flowScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x2A6dD60Dbb8CE65813842eEe1688b21CA30D6ffd', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
function getPolygonSdk(defaultSignerOrProvider) {
    return {
        "vestingScheduler": getContract('0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c', vestingScheduler_json_2.default, defaultSignerOrProvider),
    };
}
exports.getPolygonSdk = getPolygonSdk;
