"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoerliSdk = exports.getContract = void 0;
const ethers_1 = require("ethers");
const StreamScheduler_json_1 = __importDefault(require("../../abis/goerli/StreamScheduler.json"));
function getContract(address, abi, defaultSignerOrProvider) {
    return new ethers_1.Contract(address, abi, defaultSignerOrProvider);
}
exports.getContract = getContract;
function getGoerliSdk(defaultSignerOrProvider) {
    return {
        "StreamScheduler": getContract('0x04851f0be31a98133E2D6bFFDAe56908b05cdBDB', StreamScheduler_json_1.default, defaultSignerOrProvider),
    };
}
exports.getGoerliSdk = getGoerliSdk;
