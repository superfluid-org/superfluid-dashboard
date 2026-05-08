/**
 * Minimal DashboardClearMacro view functions for descriptions (EIP-712 action hash).
 */
export const dashboardClearMacroReadAbi = [
  "function describeCreateFlow(bytes32 lang, tuple(address superToken, address receiver, int96 flowRate) p) view returns (string)",
  "function describeUpdateFlow(bytes32 lang, tuple(address superToken, address receiver, int96 flowRate) p) view returns (string)",
  "function describeDeleteFlow(bytes32 lang, tuple(address superToken, address sender, address receiver) p) view returns (string)",
  "function describeTransfer(bytes32 lang, tuple(address superToken, address receiver, uint256 amount) p) view returns (string)",
] as const;
