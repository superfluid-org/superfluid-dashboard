/**
 * A read-only probe of the Safe Transaction Service, keyed by the Safe message hash we derive
 * locally (see `safeMessageHash.ts`).
 *
 * Why this exists: a rejection from `signTypedMessage` is ambiguous. The Safe wallet sends the
 * bare string `'Transaction was rejected'` on ANY close of the sign-message flow while a
 * request is outstanding — so an owner who declined, an owner who signed but did not meet the
 * threshold and then closed the modal, and even a sole owner who signed and closed within the
 * wallet's 3s post-sign delay are byte-identical to us. Cancelling on a rejection alone would
 * destroy live, fully-authorized intents. This lookup turns that question into an answer: a
 * proposal either exists (keep the intent) or provably does not (cancel it).
 *
 * Deliberately narrow, and optional by construction:
 *
 * - Unauthenticated, read-only GET against a public endpoint. Nothing is proposed, no key is
 *   held, no owner is authenticated. It is not a dashboard-owned Transaction Service backend.
 * - Every failure — network, rate limit, 403, an unmapped chain, a malformed body — returns
 *   `"unavailable"`, never throws. Callers must treat that as "keep the intent and ask the
 *   user", so an outage degrades copy rather than breaking correctness.
 * - No retry loop of its own; callers bound the retries, because visibility lags a proposal and
 *   a 404 is only meaningful after a window has passed.
 *
 * Called directly rather than through the `/clearmacro-provider` style rewrite: this host sends
 * `access-control-allow-origin: *`, so no proxy is needed, and proxying would put every user
 * behind the same egress IPs and so share one per-IP rate limit (5000 per ~30 days) globally.
 *
 * The anonymous access this relies on is Safe deployment policy, not a contract, and could
 * tighten without notice. That is exactly why nothing here is load-bearing.
 */

const SAFE_TX_SERVICE_BASE_URL = "https://api.safe.global/tx-service";

/** A short cap: this probe is never worth making a user wait on. */
const LOOKUP_TIMEOUT_MS = 8_000;

/**
 * EIP-3770 short names, which the Transaction Service uses as its path segment. Covers only the
 * chains the provider advertises for `safeMessageV1`; anything else answers `"unavailable"`
 * rather than guessing a segment.
 *
 * The numeric-chainId gateway variant (`safe-client.safe.global/v1/chains/{chainId}/messages`)
 * returns 403, so the short-name host is the working route and this map is unavoidable.
 */
const SAFE_SHORT_NAME_BY_CHAIN_ID: Record<number, string> = {
  1: "eth",
  10: "oeth",
  56: "bnb",
  100: "gno",
  137: "matic",
  8453: "base",
  42161: "arb1",
  42220: "celo",
  43114: "avax",
  84532: "basesep",
  534352: "scr",
  11155111: "sep",
};

export type SafeMessageLookupResult =
  /** A proposal exists. At least one owner has signed. */
  | { status: "found"; confirmations: number }
  /** The service positively reports no such message. Only meaningful after a retry window. */
  | { status: "absent" }
  /** No answer. Never a reason to cancel anything. */
  | { status: "unavailable"; reason: string };

export function isSafeMessageLookupSupported(chainId: number): boolean {
  return chainId in SAFE_SHORT_NAME_BY_CHAIN_ID;
}

export async function getSafeMessage(
  chainId: number,
  safeMessageHash: string
): Promise<SafeMessageLookupResult> {
  const shortName = SAFE_SHORT_NAME_BY_CHAIN_ID[chainId];
  if (!shortName) {
    return { status: "unavailable", reason: `Unmapped chain ${chainId}.` };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${SAFE_TX_SERVICE_BASE_URL}/${shortName}/api/v1/messages/${encodeURIComponent(
        safeMessageHash
      )}/`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    );

    // The service's own "no such message" answer. Only this is a positive absence — and only
    // the CALLER can decide it is final, because a POST may legitimately precede visibility.
    if (response.status === 404) return { status: "absent" };
    if (!response.ok) {
      return { status: "unavailable", reason: `HTTP ${response.status}.` };
    }

    const body = (await response.json()) as { confirmations?: unknown };
    // A body we cannot read is not an absence.
    if (!Array.isArray(body.confirmations)) {
      return { status: "unavailable", reason: "Unexpected response shape." };
    }
    return { status: "found", confirmations: body.confirmations.length };
  } catch (error) {
    return {
      status: "unavailable",
      reason: error instanceof Error ? error.message : "Lookup failed.",
    };
  } finally {
    clearTimeout(timer);
  }
}
