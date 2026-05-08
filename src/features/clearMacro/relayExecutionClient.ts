import axios, { AxiosError } from "axios";
import {
  joinClearMacroApiPath,
  normalizeClearMacroProviderBaseUrl,
} from "./providerUrl";
import { parseClearMacroCapabilities } from "./capabilities";
import type {
  ClearMacroCapabilities,
  ClearMacroErrorBody,
  CreateRelayExecutionRequest,
  RelayExecution,
} from "./types";

// When the provider runs with API_AUTH_ENABLED, requests need a bearer token; no
// dashboard config or header wiring in this slice (prefer a same-origin proxy later).

const CAPABILITIES_TIMEOUT_MS = 15_000;
const RELAY_TIMEOUT_MS = 60_000;

export class ClearMacroClientError extends Error {
  constructor(
    message: string,
    readonly httpStatus?: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "ClearMacroClientError";
  }
}

export function isClearMacroErrorBody(x: unknown): x is ClearMacroErrorBody {
  if (!x || typeof x !== "object") {
    return false;
  }
  const err = (x as ClearMacroErrorBody).error;
  return (
    !!err &&
    typeof err === "object" &&
    typeof err.code === "string" &&
    typeof err.message === "string"
  );
}

export async function fetchClearMacroCapabilities(
  baseUrl: string
): Promise<ClearMacroCapabilities> {
  const url = joinClearMacroApiPath(baseUrl, "/v1/capabilities");
  let data: unknown;
  try {
    const res = await axios.get<unknown>(url, {
      timeout: CAPABILITIES_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    });
    data = res.data;
  } catch (e) {
    throw coerceAxiosError("ClearMacro capabilities request failed", e);
  }
  const parsed = parseClearMacroCapabilities(data);
  if (!parsed) {
    throw new ClearMacroClientError("Invalid ClearMacro capabilities JSON shape");
  }
  return parsed;
}

function coerceAxiosError(prefix: string, e: unknown): ClearMacroClientError {
  if (axios.isAxiosError(e)) {
    const ax = e as AxiosError<unknown>;
    return new ClearMacroClientError(
      `${prefix}: ${ax.message}`,
      ax.response?.status,
      ax.response?.data
    );
  }
  return new ClearMacroClientError(`${prefix}: ${String(e)}`);
}

/**
 * POST /v1/relay-executions — synchronous validation; worker submits async.
 * Successful HTTP statuses: 200 (dedup), 202 (created).
 */
export async function postRelayExecution(
  baseUrl: string,
  body: CreateRelayExecutionRequest
): Promise<RelayExecution> {
  const url = joinClearMacroApiPath(baseUrl, "/v1/relay-executions");
  try {
    const response = await axios.post<RelayExecution>(url, body, {
      timeout: RELAY_TIMEOUT_MS,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      validateStatus: (s) => s === 200 || s === 202,
    });
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response && e.response.status !== 200 && e.response.status !== 202) {
      throw new ClearMacroClientError(
        "ClearMacro relay-executions rejected",
        e.response.status,
        e.response.data
      );
    }
    throw coerceAxiosError("ClearMacro relay-executions request failed", e);
  }
}

export type GetRelayExecutionOptions = {
  includeEvents?: boolean;
};

export async function getRelayExecution(
  baseUrl: string,
  executionId: string,
  options?: GetRelayExecutionOptions
): Promise<RelayExecution> {
  const path =
    `/v1/relay-executions/${encodeURIComponent(executionId)}` +
    (options?.includeEvents ? "?include=events" : "");
  const url = joinClearMacroApiPath(baseUrl, path);
  try {
    const { data } = await axios.get<RelayExecution>(url, {
      timeout: RELAY_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    });
    return data;
  } catch (e) {
    throw coerceAxiosError("ClearMacro relay execution GET failed", e);
  }
}

export type PollRelayExecutionUntilTerminalOptions = {
  /** @default 30 */
  maxAttempts?: number;
  /** @default 2000 */
  intervalMs?: number;
  includeEvents?: boolean;
  signal?: AbortSignal;
};

/**
 * Polls execution status until `terminal` or attempts exhausted.
 * For UI integration, prefer RTK Query `refetch` / polling flags instead.
 */
export async function pollRelayExecutionUntilTerminal(
  baseUrl: string,
  executionId: string,
  options?: PollRelayExecutionUntilTerminalOptions
): Promise<RelayExecution> {
  const maxAttempts = options?.maxAttempts ?? 30;
  const intervalMs = options?.intervalMs ?? 2000;
  const normalized = normalizeClearMacroProviderBaseUrl(baseUrl);

  for (let i = 0; i < maxAttempts; i++) {
    if (options?.signal?.aborted) {
      throw new ClearMacroClientError("Polling aborted", undefined, undefined);
    }
    const execution = await getRelayExecution(normalized, executionId, {
      includeEvents: options?.includeEvents,
    });
    if (execution.terminal) {
      return execution;
    }
    await delay(intervalMs, options?.signal);
  }

  throw new ClearMacroClientError(
    `Relay execution ${executionId} did not reach a terminal state within ${maxAttempts} attempts`
  );
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ClearMacroClientError("Polling aborted"));
      return;
    }
    const t = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new ClearMacroClientError("Polling aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Poll relay execution until a transaction hash appears (successful submit path). */
export async function waitForRelayExecutionTransactionHash(
  baseUrl: string,
  executionId: string,
  options?: { maxAttempts?: number; intervalMs?: number }
): Promise<string> {
  const maxAttempts = options?.maxAttempts ?? 45;
  const intervalMs = options?.intervalMs ?? 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const ex = await getRelayExecution(baseUrl, executionId);
    const h = ex.transaction?.hash ?? ex.receipt?.transactionHash;
    if (h) {
      return h;
    }
    if (
      ex.terminal &&
      (ex.state === "failed" ||
        ex.state === "rejected" ||
        ex.state === "reverted" ||
        ex.state === "expired" ||
        ex.state === "canceled")
    ) {
      const msg = ex.error?.message ?? ex.state;
      throw new ClearMacroClientError(
        `ClearMacro relay ended without transaction hash: ${msg}`
      );
    }
    await delay(intervalMs);
  }

  throw new ClearMacroClientError(
    "ClearMacro relay timed out waiting for transaction hash"
  );
}
