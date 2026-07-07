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

export interface RelayCapabilities {
  providerName: string;
  chains: {
    chainId: number;
    forwarderAddress: Address;
    /** The relay kinds this provider accepts on this chain. */
    supportedKinds: RelayKind[];
    macroPolicy: { mode: string };
  }[];
}

export type RelayExecutionState =
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

/** Error from the relay provider API or a non-success terminal execution state. */
export class ClearMacroRelayError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly executionId?: string
  ) {
    super(message);
    this.name = "ClearMacroRelayError";
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

let capabilitiesCache: Promise<RelayCapabilities> | undefined;

/** Module-cached provider capabilities; a failed fetch clears the cache so it can retry. */
export function getCapabilities(): Promise<RelayCapabilities> {
  if (!capabilitiesCache) {
    capabilitiesCache = fetch(`${RELAY_PROVIDER_BASE_URL}/v1/capabilities`).then(
      async (response) => {
        if (!response.ok) {
          throw new ClearMacroRelayError(
            `Relay provider capabilities request failed (HTTP ${response.status}).`
          );
        }
        return (await response.json()) as RelayCapabilities;
      }
    );
    capabilitiesCache.catch(() => {
      capabilitiesCache = undefined;
    });
  }
  return capabilitiesCache;
}

/** `runMacro` relay body — a single ClearMacro digest signature. */
export interface ClearMacroV1Body {
  kind: "clearMacroV1";
  chainId: number;
  macroAddress: Address;
  signerAddress: Address;
  payload: Hex;
  signature: Hex;
  value?: string;
  clientRequestId?: string;
  metadata?: Record<string, string>;
}

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

export async function createRelayExecution(
  body: CreateRelayExecutionBody
): Promise<RelayExecution> {
  const response = await fetch(`${RELAY_PROVIDER_BASE_URL}/v1/relay-executions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await parseErrorBody(response);
    throw new ClearMacroRelayError(
      error
        ? `Relay rejected the execution: ${formatRelayApiError(error)}`
        : `Relay execution request failed (HTTP ${response.status}).`,
      error?.code,
      error?.executionId
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
      error?.code,
      id
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
          "POLL_TIMEOUT",
          id
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
        execution.error?.code,
        id
      );
    }
    if (Date.now() >= deadline) {
      throw new ClearMacroRelayError(
        `Timed out waiting for the relayed transaction (execution ${id}, last state: ${execution.state}).`,
        "POLL_TIMEOUT",
        id
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
