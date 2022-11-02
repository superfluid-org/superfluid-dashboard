"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const streamScheduler_json_1 = __importDefault(require("../../abis/goerli/streamScheduler.json"));
const vestingScheduler_json_1 = __importDefault(require("../../abis/goerli/vestingScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "streamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', streamScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0xaab383b52F17E709fA5E5fD016D3205F563D89c7', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
