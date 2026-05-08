import type { ClearMacroCapabilities, ClearMacroChainCapability } from "./types";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function parseClearMacroCapabilities(
  data: unknown
): ClearMacroCapabilities | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  if (typeof o.providerName !== "string" || o.providerName.length === 0) {
    return null;
  }
  if (!Array.isArray(o.chains)) {
    return null;
  }

  const chains: ClearMacroChainCapability[] = [];
  for (const entry of o.chains) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const c = entry as Record<string, unknown>;
    if (
      typeof c.chainId !== "number" ||
      !Number.isInteger(c.chainId) ||
      c.chainId < 1
    ) {
      return null;
    }
    if (typeof c.forwarderAddress !== "string" || !ADDRESS_RE.test(c.forwarderAddress)) {
      return null;
    }
    chains.push({
      chainId: c.chainId,
      forwarderAddress: c.forwarderAddress as `0x${string}`,
    });
  }

  return { providerName: o.providerName, chains };
}

export function getClearMacroForwarderForChain(
  capabilities: ClearMacroCapabilities,
  chainId: number
): `0x${string}` | undefined {
  return capabilities.chains.find((c) => c.chainId === chainId)?.forwarderAddress;
}

/**
 * Case-insensitive forwarder comparison (capabilities vs an expected testnet value).
 */
export function addressesEqualCaseInsensitive(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * True when the provider lists the chain and, if `expectedForwarder` is set,
 * the listed forwarder matches (case-insensitive).
 */
export function isClearMacroChainSupported(
  capabilities: ClearMacroCapabilities,
  chainId: number,
  expectedForwarder?: string
): boolean {
  const forwarder = getClearMacroForwarderForChain(capabilities, chainId);
  if (!forwarder) {
    return false;
  }
  if (expectedForwarder === undefined) {
    return true;
  }
  return addressesEqualCaseInsensitive(forwarder, expectedForwarder);
}
