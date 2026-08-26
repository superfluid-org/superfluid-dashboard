import { Address, Hex, hashMessage, hashTypedData, isHex } from "viem";

/**
 * Local derivation of a Safe message hash.
 *
 * This is a reproduction of the Safe wallet's own `generateSafeMessageHash`
 * (`packages/utils/src/utils/safe-messages.ts` in safe-global/safe-wallet-monorepo), and it has
 * to match byte-for-byte, because the same value is three different things at once:
 *
 * 1. what we send the relay provider as `authorization.safeMessageHash`, and therefore what it
 *    polls ERC-1271 with;
 * 2. the Safe Transaction Service's key for the message resource — the Safe wallet addresses it
 *    by exactly this value (`dispatchSafeMsgConfirmation` passes it as the `messageHash` path
 *    parameter), which is what lets us look a proposal up by hash;
 * 3. what the Safe Apps SDK hands back on a successful off-chain signature, so a mismatch is
 *    detectable.
 *
 * Deriving it locally rather than waiting for the signing promise is what makes the whole flow
 * possible: the POST can then happen immediately, before any owner has signed and before the
 * message is visible to the Transaction Service.
 */

/** Safes from 1.3.0 on handle EIP-1271 in the fallback handler, which puts `chainId` in the domain. */
const EIP1271_FALLBACK_HANDLER_SUPPORTED_SAFE_VERSION = "1.3.0";

/** The EIP-712 payload shape the Safe Apps SDK accepts (its `primaryType` is optional). */
export interface SafeEip712TypedData {
  domain: Record<string, unknown>;
  types: Record<string, { name: string; type: string }[]>;
  message: Record<string, unknown>;
  primaryType?: string;
}

export interface SafeMessageSafeInfo {
  address: Address;
  chainId: number;
  /**
   * `SafeInfoExtended.version` is `string | null`. Null is not a version we may guess around:
   * it decides whether `chainId` belongs in the domain, and guessing wrong yields a hash no
   * owner will ever sign and the provider will poll forever.
   */
  version: string | null;
}

/**
 * Numeric `major.minor.patch` comparison that tolerates the suffixes real Safe deployments
 * carry — `1.3.0+L2` (build metadata) and prerelease tags. A string compare would get
 * `1.10.0` vs `1.9.0` wrong, and `>= "1.3.0"` would reject `"1.3.0+L2"`.
 *
 * Per semver, a prerelease sorts below its release (`1.3.0-rc.1` < `1.3.0`); build metadata is
 * not ordered and is ignored.
 */
/**
 * Parses a Safe version, or returns `undefined` if it is not a version at all.
 *
 * Strict about component shape on purpose: `parseInt` would happily read `1foo.3.0` as 1.3.0,
 * and the Safe wallet's own `semver.gte` rejects such input rather than interpreting it.
 */
function parseSafeVersion(raw: string) {
  const [withoutBuild] = raw.trim().split("+");
  const [core, ...prerelease] = withoutBuild.split("-");
  const parts = core.split(".");
  if (parts.length < 2 || parts.length > 3) return undefined;
  if (!parts.every((part) => /^\d+$/.test(part))) return undefined;
  const numbers = parts.map((part) => Number.parseInt(part, 10));
  return {
    numbers: [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0],
    hasPrerelease: prerelease.length > 0 && prerelease[0].length > 0,
  };
}

export function isSafeVersionParseable(version: string): boolean {
  return parseSafeVersion(version) !== undefined;
}

export function isSafeVersionGte(version: string, minimum: string): boolean {
  const left = parseSafeVersion(version);
  const right = parseSafeVersion(minimum);
  // An unparseable version answers `false`, but callers must NOT read that as "pre-1.3.0" —
  // `generateSafeMessageTypedData` rejects it outright before the domain is chosen.
  if (!left || !right) return false;

  for (let i = 0; i < 3; i++) {
    if (left.numbers[i] !== right.numbers[i]) {
      return left.numbers[i] > right.numbers[i];
    }
  }
  // Equal cores: a prerelease of the minimum does not reach it, but the release does.
  return !(left.hasPrerelease && !right.hasPrerelease);
}

/**
 * The EIP-712 primary type, when the payload omits it.
 *
 * viem requires `primaryType`; ethers' `TypedDataEncoder` (what the Safe wallet uses) derives
 * it. The rule is the same one ethers applies: the single type no other type refers to.
 */
function derivePrimaryType(types: SafeEip712TypedData["types"]): string {
  const candidates = new Set(
    Object.keys(types).filter((name) => name !== "EIP712Domain")
  );
  for (const fields of Object.values(types)) {
    for (const field of fields) {
      // Array and reference fields both point at a base type name (`Foo`, `Foo[]`, `Foo[2]`).
      candidates.delete(field.type.replace(/\[.*\]$/, ""));
    }
  }
  const [primaryType, ...rest] = [...candidates];
  if (!primaryType || rest.length > 0) {
    throw new Error(
      `Cannot derive an EIP-712 primary type (${
        rest.length > 0 ? "ambiguous" : "none found"
      }).`
    );
  }
  return primaryType;
}

/** The inner hash a Safe message wraps: an EIP-191 personal-sign hash, or an EIP-712 digest. */
export function generateSafeMessageMessage(
  message: string | SafeEip712TypedData
): Hex {
  if (typeof message === "string") return hashMessage(message);
  return hashTypedData({
    domain: message.domain,
    types: message.types,
    primaryType: message.primaryType ?? derivePrimaryType(message.types),
    message: message.message,
  } as Parameters<typeof hashTypedData>[0]);
}

/**
 * The `SafeMessage` EIP-712 payload the Safe's owners actually sign.
 *
 * Note the version-conditional domain: below 1.3.0 the domain is `{ verifyingContract }` with
 * NO `chainId`. Reproduce it exactly — an extra domain field changes the hash.
 */
export function generateSafeMessageTypedData(
  safe: SafeMessageSafeInfo,
  message: string | SafeEip712TypedData
) {
  if (!safe.version) {
    throw new Error("Cannot create a Safe message without the Safe's version.");
  }
  // Fail closed rather than defaulting to the legacy domain: below 1.3.0 the domain omits
  // `chainId`, so misreading an unparseable version silently produces a hash no owner will
  // ever sign and the provider would poll until it expired.
  if (!isSafeVersionParseable(safe.version)) {
    throw new Error(
      `Cannot create a Safe message: unrecognized Safe version "${safe.version}".`
    );
  }
  const isHandledByFallbackHandler = isSafeVersionGte(
    safe.version,
    EIP1271_FALLBACK_HANDLER_SUPPORTED_SAFE_VERSION
  );
  return {
    domain: isHandledByFallbackHandler
      ? { chainId: Number(safe.chainId), verifyingContract: safe.address }
      : { verifyingContract: safe.address },
    types: { SafeMessage: [{ name: "message", type: "bytes" }] },
    message: { message: generateSafeMessageMessage(message) },
    primaryType: "SafeMessage" as const,
  };
}

/**
 * The Safe message hash — see the module header for the three roles this single value plays.
 *
 * Hashing the very object we hand to `signTypedMessage` is deliberate. The Safe wallet proposes
 * `normalizeTypedData(message)` while hashing the un-normalized `message`; that is only sound
 * because normalization is the canonical EIP-712 payload plus a chainId hex-to-number coercion,
 * which is hash-preserving. Rather than rely on that, we hash exactly what we send.
 */
export function generateSafeMessageHash(
  safe: SafeMessageSafeInfo,
  message: string | SafeEip712TypedData
): Hex {
  return hashTypedData(generateSafeMessageTypedData(safe, message));
}

/** A 32-byte hex string. Anything else must never reach the provider as an authorization. */
export function isValidSafeMessageHash(value: string): value is Hex {
  return isHex(value) && value.length === 66;
}
