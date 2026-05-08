import { isClearMacroChainSupported } from "./capabilities";
import { getDashboardClearMacroAddress } from "./dashboardClearMacroAddresses";
import type { ClearMacroCapabilities } from "./types";

/**
 * True when we have a static DashboardClearMacro address for the chain and the
 * provider capabilities list that chain (optionally matching an expected forwarder).
 */
export function isDashboardClearMacroRelayReady(
  chainId: number,
  capabilities: ClearMacroCapabilities | null | undefined,
  expectedForwarder?: string
): boolean {
  const macroAddress = getDashboardClearMacroAddress(chainId);
  if (!macroAddress || !capabilities) {
    return false;
  }
  return isClearMacroChainSupported(
    capabilities,
    chainId,
    expectedForwarder
  );
}
