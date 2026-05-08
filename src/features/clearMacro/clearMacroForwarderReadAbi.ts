/**
 * Minimal read-only ClearMacroForwarderV1 surface for relay prep.
 * Full source: @superfluid-finance/ethereum-contracts ClearMacroForwarderV1.sol
 */
export const clearMacroForwarderReadAbi = [
  "function encodeParams(bytes params, tuple(string domain, address macroContract, string provider, uint256 validAfter, uint256 validBefore, uint256 nonce) security) pure returns (bytes memory)",
  "function getDigest(address m, bytes params) view returns (bytes32)",
  "function getNonce(address sender, uint192 key) view returns (uint256)",
] as const;
