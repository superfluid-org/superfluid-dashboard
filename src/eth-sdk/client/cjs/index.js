"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const flowScheduler_json_1 = __importDefault(require("../../abis/goerli/flowScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/goerli/vestingScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "flowScheduler": getContract('0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca', flowScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0xD2542C725291aE9b7f088B73525F9Bc1e4B4f21C', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
