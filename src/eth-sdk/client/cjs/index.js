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
        "flowScheduler": getContract('0x5b2D8d18FE90D840cbc012a8a06C3EeAA5cBe1a6', flowScheduler_json_1.default, defaultSignerOrProvider),
        "vestingScheduler": getContract('0x6f54e4744b13879482b5a487e832b23e566661b5', vestingScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
