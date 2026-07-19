import { type Address } from "viem";

/** The canonical Uniswap Permit2, same address on every chain (forwarder's `PERMIT2()`). */
export const PERMIT2_ADDRESS: Address =
  "0x000000000022D473030F116dDEE9F6B43aC78BA3";

/**
 * A fresh unordered Permit2 SignatureTransfer nonce (bitmap-based — any unused uint256).
 * Crypto-random so parallel signers can't collide; Permit2 rejects a reused one anyway.
 */
export function generatePermit2Nonce(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytes.reduce((acc, b) => (acc << 8n) | BigInt(b), 0n);
}

/**
 * Converts an 18-decimal fee Super Token amount to its underlying token's units,
 * rounding UP — the permit must always cover the full fee after the wrap.
 */
export function feeToUnderlyingUnitsCeil(
  feeWei18: bigint,
  underlyingDecimals: number
): bigint {
  const diff = 18 - underlyingDecimals;
  if (diff === 0) return feeWei18;
  if (diff < 0) return feeWei18 * 10n ** BigInt(-diff);
  const scale = 10n ** BigInt(diff);
  return (feeWei18 + scale - 1n) / scale;
}

/**
 * The fixed outer type of a Uniswap SignatureTransfer witness permit:
 * `PermitWitnessTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline,<WitnessType> witness)`.
 * The witness sub-types come from the forwarder's `getPermit2WitnessTypeString` at runtime.
 * A witness type must never be named `PermitWitnessTransferFrom` (the caller pre-checks and
 * degrades); the spread order below makes the fixed outer type win regardless.
 */
export function buildPermit2Types(
  witnessTypes: Record<string, { type: string; name: string }[]>,
  witnessTypeName: string
): Record<string, { type: string; name: string }[]> {
  return {
    ...witnessTypes,
    PermitWitnessTransferFrom: [
      { type: "TokenPermissions", name: "permitted" },
      { type: "address", name: "spender" },
      { type: "uint256", name: "nonce" },
      { type: "uint256", name: "deadline" },
      { type: witnessTypeName, name: "witness" },
    ],
  };
}
