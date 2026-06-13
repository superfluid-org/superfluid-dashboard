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

export interface RelayCapabilities {
  providerName: string;
  chains: {
    chainId: number;
    forwarderAddress: Address;
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
  kind: "clearMacroV1";
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

export interface CreateRelayExecutionBody {
  kind: "clearMacroV1";
  chainId: number;
  macroAddress: Address;
  signerAddress: Address;
  payload: Hex;
  signature: Hex;
  clientRequestId?: string;
  metadata?: Record<string, string>;
}

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

export async function getRelayExecution(id: string): Promise<RelayExecution> {
  const response = await fetch(
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
    const execution = await getRelayExecution(id);
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
