import { Address, Hex } from "viem";

/**
 * Minimal fetch client for the Clear Macro relay provider
 * (https://clearmacro-provider.superfluid.dev, OpenAPI at GET /docs/json).
 * Schema verified against the live spec on 2026-06-11.
 *
 * Reached through the same-origin Next.js rewrite (see `next.config.ts`) because the
 * provider serves no CORS headers — a direct browser fetch would be blocked.
 */
const RELAY_PROVIDER_BASE_URL = "/clearmacro-provider";

/**
 * Relay execution modes the provider supports:
 * - `clearMacroV1`: plain `runMacro` with a ClearMacro digest signature (fee paid from an
 *   existing USDCx balance).
 * - `clearMacroPermit2V1`: `runPermit2AndMacro` with a single Permit2 witness signature that
 *   wraps USDC→USDCx just-in-time (used by the Phase 2 pay-with-USDC path).
 */
export type RelayKind = "clearMacroV1" | "clearMacroPermit2V1";

/**
 * How the signer authorizes the ClearMacro digest:
 * - `signature`: a plain EIP-712 signature recovered to the signer (EOAs).
 * - `safeMessageV1`: an off-chain Safe message the provider polls via ERC-1271 (Safes).
 */
export type RelayAuthorizationMethod = "signature" | "safeMessageV1";

export interface RelayCapabilities {
  providerName: string;
  chains: {
    chainId: number;
    forwarderAddress: Address;
    /** The relay kinds this provider accepts on this chain. */
    supportedKinds: RelayKind[];
    /**
     * The authorization methods this provider accepts on this chain. Optional because an
     * older provider deployment omits it entirely — treat a missing field as
     * `signature`-only, never as "everything supported" (fail closed).
     */
    supportedAuthorizationMethods?: RelayAuthorizationMethod[];
    macroPolicy: { mode: string };
  }[];
}

export type RelayExecutionState =
  /** Created, but the signer's authorization has not validated yet (Safe messages). */
  | "awaiting_authorization"
  | "pending"
  | "submitted"
  | "succeeded"
  | "reverted"
  | "rejected"
  | "failed"
  | "expired"
  | "canceled";

export interface RelayExecution {
  id: string;
  state: RelayExecutionState;
  terminal: boolean;
  kind: RelayKind;
  chainId: number;
  clientRequestId?: string;
  metadata: Record<string, string>;
  forwarderAddress: Address;
  macroAddress: Address;
  signerAddress: Address;
  nonce: string;
  validity: { validAfter: string; validBefore: string };
  value: string;
  /**
   * Present on responses only, and only for Safe-authorized executions. `messageLink` is the
   * provider's own deep link to the Safe message — the ONLY link we may render (never build
   * Safe URLs from chain names ourselves).
   */
  authorization?: {
    type: "safeMessageV1";
    safeMessageHash: Hex;
    messageLink?: string;
  };
  /** Current hash while in flight — may change before terminal (relayer replacements), final once terminal. */
  transaction?: { hash: Hex; from?: Address; to: Address; submittedAt?: string };
  /** Final receipt — the live provider may omit it even on terminal `succeeded` (then `transaction.hash` is the final hash). */
  receipt?: {
    transactionHash: Hex;
    blockNumber: string;
    blockHash?: Hex;
    status: "success" | "reverted";
    gasUsed?: string;
  };
  error?: RelayApiErrorBody;
  timestamps: { createdAt: string; updatedAt: string; terminalAt?: string };
  links: { self: string };
}

interface RelayApiErrorBody {
  code: string;
  message: string;
  category: "user" | "provider" | "chain" | "relayer" | "unknown";
  retryable: boolean;
  executionId?: string;
  details?: unknown;
}

export interface ClearMacroRelayErrorOptions {
  /** The provider's error code, or a synthetic one (`POLL_TIMEOUT`). Display/diagnostics only. */
  code?: string;
  executionId?: string;
  /**
   * The HTTP status, when the failure came from a response rather than the network.
   * `undefined` means "we never got an answer" (offline, DNS, abort/timeout) — which is a
   * DIFFERENT thing from any status code and must never be collapsed into one.
   *
   * Three separate decisions depend on telling these apart, so this is load-bearing rather
   * than diagnostic: cancel branches on 409 vs no-answer (both keep a direct write blocked,
   * but only one is retryable), recovery branches on a confirmed 404 vs an unreachable
   * provider (only the former stops polling), and the pre-POST intent replay branches on
   * whether the create was refused or merely unanswered.
   */
  status?: number;
  /**
   * The execution's state when the error was raised — its terminal state when the error IS a
   * terminal state, otherwise the last state observed before giving up. Absent for failures
   * raised before any execution state was read.
   */
  state?: RelayExecutionState;
}

/** Error from the relay provider API or a non-success terminal execution state. */
export class ClearMacroRelayError extends Error {
  readonly code?: string;
  readonly executionId?: string;
  readonly status?: number;
  readonly state?: RelayExecutionState;

  constructor(message: string, options: ClearMacroRelayErrorOptions = {}) {
    super(message);
    this.name = "ClearMacroRelayError";
    this.code = options.code;
    this.executionId = options.executionId;
    this.status = options.status;
    this.state = options.state;
  }
}

async function parseErrorBody(response: Response): Promise<RelayApiErrorBody | undefined> {
  try {
    const body = (await response.json()) as { error?: RelayApiErrorBody };
    return body.error;
  } catch {
    return undefined;
  }
}

/** The API error's message plus its `details` (when populated) — the only revert diagnostics the relay exposes. */
function formatRelayApiError(error: RelayApiErrorBody): string {
  const { details } = error;
  const hasDetails =
    details != null &&
    (typeof details !== "object" || Object.keys(details).length > 0);
  return hasDetails
    ? `${error.message} Details: ${JSON.stringify(details)}`
    : error.message;
}

/**
 * The final on-chain hash of a terminal `succeeded` execution. The live provider may omit
 * `receipt` even at terminal; `transaction.hash` can no longer be replaced once terminal,
 * so it is an equally final source for the hash.
 */
export function getFinalTransactionHash(execution: RelayExecution): Hex | undefined {
  return execution.receipt?.transactionHash ?? execution.transaction?.hash;
}

/**
 * How long a successful capabilities answer stays authoritative. The executor re-checks
 * capabilities at click time specifically so a provider that dropped support since page load
 * cannot be relied on — a permanent memo would make that re-check a no-op against a stale
 * answer, silently downgrading a Safe user into a path that cannot work.
 */
const CAPABILITIES_TTL_MS = 5 * 60_000;

let capabilitiesCache:
  | { promise: Promise<RelayCapabilities>; fetchedAt: number }
  | undefined;

/**
 * Provider capabilities, memoized for `CAPABILITIES_TTL_MS`. A failed fetch clears the cache
 * immediately so the next caller retries rather than inheriting the rejection.
 */
export function getCapabilities(): Promise<RelayCapabilities> {
  const cached = capabilitiesCache;
  if (cached && Date.now() - cached.fetchedAt < CAPABILITIES_TTL_MS) {
    return cached.promise;
  }
  const promise = fetchWithTimeout(
    `${RELAY_PROVIDER_BASE_URL}/v1/capabilities`
  ).then(async (response) => {
    if (!response.ok) {
      throw new ClearMacroRelayError(
        `Relay provider capabilities request failed (HTTP ${response.status}).`,
        { status: response.status }
      );
    }
    return (await response.json()) as RelayCapabilities;
  });
  const entry = { promise, fetchedAt: Date.now() };
  capabilitiesCache = entry;
  promise.catch(() => {
    // Only evict our own entry — a later successful fetch may have replaced it already.
    if (capabilitiesCache === entry) capabilitiesCache = undefined;
  });
  return promise;
}

/**
 * Whether a provider-returned `messageLink` is safe to render as a link.
 *
 * Only the provider's own link is ever rendered — Safe URLs are never constructed from chain
 * names — and even that is validated: it is persisted, so it outlives the response it came in,
 * and a link is a user-visible navigation target. An absent or unusable link degrades to the
 * execution id and explanatory text rather than a broken button.
 */
export function isRenderableMessageLink(
  link: string | undefined
): link is string {
  if (!link) return false;
  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

/** Whether the provider accepts `clearMacroPermit2V1` (pay-with-USDC) on this chain. */
export function chainSupportsPermit2(
  capabilities: RelayCapabilities,
  chainId: number
): boolean {
  return (
    capabilities.chains
      .find((chain) => chain.chainId === chainId)
      ?.supportedKinds.includes("clearMacroPermit2V1") ?? false
  );
}

/**
 * Whether the provider accepts a Safe message as the authorization on this chain.
 *
 * Fails closed on every unknown: a chain the provider does not serve, and a provider
 * deployment old enough to omit `supportedAuthorizationMethods` entirely, both answer
 * `false`. Never derive this from a hardcoded chain list — the enabled set is the
 * provider's to change.
 */
export function chainSupportsSafeMessage(
  capabilities: RelayCapabilities,
  chainId: number
): boolean {
  return (
    capabilities.chains
      .find((chain) => chain.chainId === chainId)
      ?.supportedAuthorizationMethods?.includes("safeMessageV1") ?? false
  );
}

interface ClearMacroV1BodyBase {
  kind: "clearMacroV1";
  chainId: number;
  macroAddress: Address;
  signerAddress: Address;
  payload: Hex;
  value?: string;
  clientRequestId?: string;
  metadata?: Record<string, string>;
}

/**
 * `runMacro` relay body. The digest is authorized EITHER by a recovered EIP-712 signature
 * (EOAs) OR by a Safe message the provider polls until ERC-1271 validates it — never both.
 *
 * Modelled as an exclusive union with `never` on the absent arm so sending both is a compile
 * error rather than a schema rejection at runtime: by the time the provider refuses it, a Safe
 * owner has already been asked to sign something.
 */
export type ClearMacroV1Body = ClearMacroV1BodyBase &
  (
    | { signature: Hex; authorization?: never }
    | {
        signature?: never;
        authorization: { type: "safeMessageV1"; safeMessageHash: Hex };
      }
  );

/**
 * `runPermit2AndMacro` relay body — one Permit2 `PermitWitnessTransferFrom` signature whose
 * witness binds the ClearMacro payload (no top-level `signature`). The provider derives the
 * witness on-chain from `macroAddress` + `payload` + `permit2.upgradeSuperToken`. Amounts,
 * nonce, and deadline are decimal strings (Uniswap SignatureTransfer). Used by Phase 2.
 */
export interface ClearMacroPermit2V1Body {
  kind: "clearMacroPermit2V1";
  chainId: number;
  macroAddress: Address;
  signerAddress: Address;
  payload: Hex;
  permit2: {
    permit: {
      permitted: { token: Address; amount: string };
      nonce: string;
      deadline: string;
    };
    spender: Address;
    upgradeSuperToken: Address;
    signature: Hex;
  };
  value?: string;
  clientRequestId?: string;
  metadata?: Record<string, string>;
}

/** Discriminated on `kind`. Phase 1 only builds `ClearMacroV1Body`. */
export type CreateRelayExecutionBody = ClearMacroV1Body | ClearMacroPermit2V1Body;

/**
 * Creates a relay execution.
 *
 * Both success statuses return an execution and are promoted identically: `202` created a new
 * one, `200` means the provider deduplicated against an existing execution for the same signed
 * authorization intent. That dedup is what makes the pre-POST intent replay safe — replaying a
 * byte-identical body after an unanswered POST returns the original execution instead of
 * creating a second one.
 *
 * Timed out like every other call: without a cap an unanswered POST hangs the mutation
 * indefinitely instead of failing, and the whole pre-POST recovery path exists precisely to
 * handle a POST whose outcome we do not know.
 */
export async function createRelayExecution(
  body: CreateRelayExecutionBody
): Promise<RelayExecution> {
  const response = await fetchWithTimeout(
    `${RELAY_PROVIDER_BASE_URL}/v1/relay-executions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const error = await parseErrorBody(response);
    throw new ClearMacroRelayError(
      error
        ? `Relay rejected the execution: ${formatRelayApiError(error)}`
        : `Relay execution request failed (HTTP ${response.status}).`,
      {
        code: error?.code,
        executionId: error?.executionId,
        status: response.status,
      }
    );
  }
  return (await response.json()) as RelayExecution;
}

/**
 * Cancels an execution the provider has not yet handed to a relayer.
 *
 * Cancelable in `awaiting_authorization`, or in `pending` before OZ submit/claim; idempotent
 * once already `canceled` (→ 200). Returns the execution resource on success.
 *
 * Callers MUST branch on `error.status`, never on the error code string: the `409` body's code
 * is not in the provider's documented code list, and confirming it would require cancelling a
 * real in-flight execution. Treat any code here as display-only.
 *
 * A thrown error with no `status` means the request was never answered — that is NOT a
 * "cancel failed" answer, and callers must keep the corresponding direct write blocked.
 */
export async function cancelRelayExecution(id: string): Promise<RelayExecution> {
  const response = await fetchWithTimeout(
    `${RELAY_PROVIDER_BASE_URL}/v1/relay-executions/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    const error = await parseErrorBody(response);
    throw new ClearMacroRelayError(
      error
        ? `Relay execution cancel failed: ${formatRelayApiError(error)}`
        : `Relay execution cancel failed (HTTP ${response.status}).`,
      { code: error?.code, executionId: id, status: response.status }
    );
  }
  return (await response.json()) as RelayExecution;
}

/** Per-request cap so a hung fetch can't outlast the poll's own deadline check. */
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * `fetch` with a timeout via `AbortController` — deliberately NOT `AbortSignal.timeout` (Baseline
 * 2024; the project's browserslist still includes browsers without it, where it would throw before
 * the request and break every poll).
 */
function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function getRelayExecution(id: string): Promise<RelayExecution> {
  const response = await fetchWithTimeout(
    `${RELAY_PROVIDER_BASE_URL}/v1/relay-executions/${encodeURIComponent(id)}`
  );
  if (!response.ok) {
    const error = await parseErrorBody(response);
    throw new ClearMacroRelayError(
      error
        ? `Relay execution lookup failed: ${formatRelayApiError(error)}`
        : `Relay execution lookup failed (HTTP ${response.status}).`,
      { code: error?.code, executionId: id, status: response.status }
    );
  }
  return (await response.json()) as RelayExecution;
}

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 120_000;

/**
 * Polls the execution until `terminal`. Resolves only on `succeeded` with a final hash
 * (see `getFinalTransactionHash`); any other terminal state — or the polling cap — throws
 * so the transaction dialog surfaces it. The relay executes the signed payload regardless,
 * so the error message names the execution id for manual follow-up.
 */
export async function pollRelayExecutionUntilTerminal(id: string): Promise<RelayExecution> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    let execution: RelayExecution;
    try {
      execution = await getRelayExecution(id);
    } catch (error) {
      // Transient lookup failure (network blip / request timeout). Keep retrying until the
      // deadline; then surface POLL_TIMEOUT so the caller hands the execution off to the
      // background recovery poller rather than treating it as a hard failure.
      if (Date.now() >= deadline) {
        throw new ClearMacroRelayError(
          `Timed out waiting for the relayed transaction (execution ${id}).`,
          { code: "POLL_TIMEOUT", executionId: id }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      continue;
    }
    if (execution.terminal) {
      if (execution.state === "succeeded" && getFinalTransactionHash(execution)) {
        return execution;
      }
      throw new ClearMacroRelayError(
        execution.state === "succeeded"
          ? `Relayed transaction succeeded but the relay returned no transaction hash (execution ${id}).`
          : `Relayed transaction ${execution.state}${
              execution.error ? `: ${formatRelayApiError(execution.error)}` : ""
            } (execution ${id}).`,
        {
          code: execution.error?.code,
          executionId: id,
          // Carries the terminal state so the dialog can render `canceled` / `rejected` /
          // `expired` distinctly instead of collapsing them into one generic failure. A
          // cancelled execution in particular is a user action, not an error.
          state: execution.state,
        }
      );
    }
    if (Date.now() >= deadline) {
      throw new ClearMacroRelayError(
        `Timed out waiting for the relayed transaction (execution ${id}, last state: ${execution.state}).`,
        { code: "POLL_TIMEOUT", executionId: id, state: execution.state }
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
