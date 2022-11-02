"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const StreamScheduler_json_1 = __importDefault(require("../../abis/goerli/StreamScheduler.json"));
const VestingScheduler_json_1 = __importDefault(require("../../abis/goerli/VestingScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e', StreamScheduler_json_1.default, defaultSignerOrProvider),
        "VestingScheduler": getContract('0xaab383b52F17E709fA5E5fD016D3205F563D89c7', VestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
