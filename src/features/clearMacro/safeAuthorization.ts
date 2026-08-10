import SafeAppsSDK from "@safe-global/safe-apps-sdk";
import type { Address, Hex } from "viem";
import { SAFE_APPS_ALLOWED_DOMAINS } from "../wallet/safeAppsAllowedDomains";
import {
  generateSafeMessageHash,
  isValidSafeMessageHash,
  type SafeEip712TypedData,
} from "./safeMessageHash";

/**
 * The Safe Apps SDK interactions the relay flow needs, kept apart from the executor so the
 * control flow there stays readable and so the SDK is mockable in isolation.
 */

/**
 * The wagmi `safe` connector builds its own SDK instance but keeps it as a closure local and
 * exposes nothing, so we construct our own. It is only a `postMessage` client to the parent
 * frame, so a second instance is harmless — but it MUST carry the same allowed-domain list,
 * which is why that list is shared rather than duplicated.
 */
export function createSafeAppsSdk(): SafeAppsSDK {
  return new SafeAppsSDK({ allowedDomains: SAFE_APPS_ALLOWED_DOMAINS });
}

export interface SafeAuthorizationContext {
  safeAddress: Address;
  chainId: number;
  threshold: number;
  version: string;
}

export class SafeAuthorizationUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SafeAuthorizationUnavailableError";
  }
}

/**
 * Reads and validates the Safe we are about to ask to sign.
 *
 * This is the execution-time defence behind the connector-id gate in the UI: the connector
 * says "a Safe App is connected", but only `getInfo()` says WHICH Safe and on WHICH chain.
 * Every mismatch fails closed — an authorization built for the wrong Safe or wrong chain
 * produces a hash no owner can ever sign, and the provider would poll it until it expired.
 *
 * Trusting `getInfo()` at all depends on the Safe Apps allowed-domain patterns being anchored
 * (PR #888): without anchoring, a lookalike parent origin could answer these calls.
 */
export async function readSafeAuthorizationContext(
  sdk: SafeAppsSDK,
  expected: { signerAddress: Address; chainId: number }
): Promise<SafeAuthorizationContext> {
  let info: Awaited<ReturnType<SafeAppsSDK["safe"]["getInfo"]>>;
  try {
    info = await sdk.safe.getInfo();
  } catch (error) {
    throw new SafeAuthorizationUnavailableError(
      "Could not read the connected Safe.",
      { cause: error }
    );
  }

  if (info.safeAddress.toLowerCase() !== expected.signerAddress.toLowerCase()) {
    throw new SafeAuthorizationUnavailableError(
      `Connected Safe ${info.safeAddress} does not match the signer ${expected.signerAddress}.`
    );
  }
  if (Number(info.chainId) !== expected.chainId) {
    throw new SafeAuthorizationUnavailableError(
      `Connected Safe is on chain ${info.chainId}, expected ${expected.chainId}.`
    );
  }
  // The Safe wallet itself throws on a null version, and so must we: the version decides
  // whether `chainId` belongs in the SafeMessage domain, and there is no safe guess.
  if (!info.version) {
    throw new SafeAuthorizationUnavailableError(
      "The connected Safe did not report a version, so its message hash cannot be derived."
    );
  }
  if (!Number.isFinite(info.threshold) || info.threshold < 1) {
    throw new SafeAuthorizationUnavailableError(
      `The connected Safe reported an unusable threshold (${info.threshold}).`
    );
  }

  return {
    safeAddress: info.safeAddress as Address,
    chainId: Number(info.chainId),
    threshold: info.threshold,
    version: info.version,
  };
}

/**
 * Asks the Safe to sign messages off-chain rather than on-chain.
 *
 * A request, not a guarantee — the wallet may still take the on-chain route, which the caller
 * has to handle (an on-chain signature is a different ceremony with its own gas, and it is not
 * established that the provider would accept it). Failure here is not fatal on its own.
 */
export async function requestOffChainSigning(sdk: SafeAppsSDK): Promise<void> {
  try {
    await sdk.eth.setSafeSettings([{ offChainSigning: true }]);
  } catch {
    // Older Safe wallets do not implement the method at all. The `{ safeTxHash }` branch in
    // the caller is what actually protects us, so swallowing this is deliberate.
  }
}

/**
 * The Safe message hash for a payload, cross-checked against the wallet's own view.
 *
 * `calculateTypedMessageHash` is asked for the INNER EIP-712 digest as a second opinion: if the
 * wallet and viem disagree about the payload we are about to hash, nothing downstream can be
 * trusted, and it is far better to stop before an owner is asked to sign.
 */
export async function deriveSafeMessageHash(
  sdk: SafeAppsSDK,
  context: SafeAuthorizationContext,
  typedData: SafeEip712TypedData,
  expectedInnerDigest: Hex
): Promise<Hex> {
  let sdkInnerDigest: string;
  try {
    sdkInnerDigest = sdk.safe.calculateTypedMessageHash(
      typedData as Parameters<
        SafeAppsSDK["safe"]["calculateTypedMessageHash"]
      >[0]
    );
  } catch (error) {
    throw new SafeAuthorizationUnavailableError(
      "The Safe app could not hash this payload.",
      { cause: error }
    );
  }
  if (sdkInnerDigest.toLowerCase() !== expectedInnerDigest.toLowerCase()) {
    throw new SafeAuthorizationUnavailableError(
      `The Safe app's EIP-712 digest (${sdkInnerDigest}) does not match ours (${expectedInnerDigest}).`
    );
  }

  const safeMessageHash = generateSafeMessageHash(
    {
      address: context.safeAddress,
      chainId: context.chainId,
      version: context.version,
    },
    typedData
  );
  if (!isValidSafeMessageHash(safeMessageHash)) {
    throw new SafeAuthorizationUnavailableError(
      `Derived an unusable Safe message hash (${safeMessageHash}).`
    );
  }
  return safeMessageHash;
}

/** What the Safe wallet ultimately answered the signing request with. */
export type SafeSigningOutcome =
  /** Off-chain signature collected and the threshold met. */
  | { kind: "signed"; messageHash: Hex }
  /** The wallet signed the message ON chain despite the off-chain request. */
  | { kind: "on-chain"; safeTxHash: string }
  /**
   * The wallet answered with a rejection. This is AMBIGUOUS and never means "declined" on its
   * own — see `safeMessageLookup.ts`.
   */
  | { kind: "rejected"; error: unknown };

/**
 * Starts the signing request and normalizes its three outcomes.
 *
 * Deliberately returns rather than throws on rejection: the caller must treat a rejection as a
 * question to resolve, not as an answer. Register exactly one handler pair on the single
 * promise — the wallet also sends a reject AFTER a successful signature dispatch, which is
 * harmless only because the SDK deletes the callback once the first response arrives.
 */
export function watchSafeSigning(
  sdk: SafeAppsSDK,
  typedData: SafeEip712TypedData
): Promise<SafeSigningOutcome> {
  return sdk.txs
    .signTypedMessage(
      typedData as Parameters<SafeAppsSDK["txs"]["signTypedMessage"]>[0]
    )
    .then((response): SafeSigningOutcome => {
      if ("safeTxHash" in response) {
        return { kind: "on-chain", safeTxHash: response.safeTxHash };
      }
      // Note: the off-chain response carries ONLY `messageHash` — there is no `signature`
      // field on it in safe-apps-sdk v9.
      return { kind: "signed", messageHash: response.messageHash as Hex };
    })
    .catch((error): SafeSigningOutcome => ({ kind: "rejected", error }));
}
