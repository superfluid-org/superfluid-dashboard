import {
  BaseError,
  ContractFunctionRevertedError,
  ExecutionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

// viem's `ExecutionRevertedError` is overloaded: its `nodeMessage` regex is
// `/execution reverted|gas required exceeds allowance/`, so the SAME class is produced both for a
// genuine bare revert AND for a "gas required exceeds allowance" gas-cap/estimation failure (which
// is NOT a contract revert). We must not block a write on the latter, so we exclude it by message.
const GAS_ALLOWANCE_MESSAGE = /gas required exceeds allowance/i;

/**
 * Discriminates a real on-chain revert from an infra/transport failure on a pre-flight estimate.
 *
 * `true`  = the EVM actually reverted (a decodable on-chain revert) → surface it in the dialog,
 *           matching sdk-core's `estimateGas` revert check.
 * `false` = the generic `ContractFunctionExecutionError` wrapper around a transport/timeout/
 *           unsupported-method/node/gas-cap failure → best-effort: omit gas, let the wallet estimate.
 *
 * NOTE: we must NOT match `ContractFunctionExecutionError`/`CallExecutionError`. `estimateContractGas`
 * rethrows EVERY failure wrapped in `ContractFunctionExecutionError`, and `BaseError.walk()` tests the
 * outer error first — matching that wrapper would return `true` for every failure and make the
 * best-effort branch dead code. The decoded revert (reason string / custom error — i.e. essentially
 * every Superfluid/ERC20 revert) lives at the `ContractFunctionRevertedError` cause.
 * `ExecutionRevertedError` catches reason-less bare reverts too, but is excluded for the
 * gas-allowance case (see `GAS_ALLOWANCE_MESSAGE`) so a gas-cap estimation failure falls back to
 * wallet estimation rather than wrongly blocking the write.
 */
export function isContractRevert(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false;
  return !!error.walk((e) => {
    if (e instanceof ContractFunctionRevertedError) return true;
    if (e instanceof ExecutionRevertedError)
      return !GAS_ALLOWANCE_MESSAGE.test(e.message);
    return false;
  });
}

/** Stable, viem-aware error categories the transaction dialog renders friendly copy for. */
export type TxErrorCode =
  | "USER_REJECTED"
  | "INSUFFICIENT_FUNDS"
  | "CONTRACT_REVERT";

/**
 * Classifies a thrown write/estimate error by walking the viem error cause chain. Replaces the
 * dialog's old ethers-era string matching (`INSUFFICIENT_FUNDS`/`UNPREDICTABLE_GAS_LIMIT`), which
 * viem never emits. Order matters: a user rejection can be wrapped in a contract-execution error,
 * so it is checked before the revert classification.
 */
export function classifyError(error: unknown): TxErrorCode | undefined {
  if (!(error instanceof BaseError)) return undefined;
  if (error.walk((e) => e instanceof UserRejectedRequestError))
    return "USER_REJECTED";
  if (error.walk((e) => e instanceof InsufficientFundsError))
    return "INSUFFICIENT_FUNDS";
  if (isContractRevert(error)) return "CONTRACT_REVERT";
  return undefined;
}

/**
 * Pure message-level user-cancellation signals that viem may NOT wrap as
 * `UserRejectedRequestError` (so `classifyError` misses them): the auto-wrap permission flow and
 * Cypress-injected errors. Operates on a single message string (e.g. a serialized error in the
 * dialog).
 *
 * IMPORTANT: match SPECIFIC cancellation phrases, NOT loose words. An unordered
 * `includes("rejected") && includes("request")` would wrongly classify real failures such as
 * `ClearMacroRelayError`'s "Relay rejected the execution: ..." (relayApi.ts) as a user
 * cancellation. The viem-typed "User rejected the request." case is already handled by
 * `classifyError(...) === "USER_REJECTED"` (which walks the cause chain), so it need not be
 * matched here.
 */
export function isUserRejectionMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("denied transaction signature") || // Cypress + some wallets
    m.includes("user rejected") || // exact provider phrase, when the viem type is lost
    m.includes("user denied") // MetaMask-style
  );
}

/**
 * Walk-aware: does any node in the (viem) error cause chain carry a message-only cancellation
 * signal? Use for live errors; `classifyError(...) === "USER_REJECTED"` already covers the
 * viem-typed `UserRejectedRequestError` case (also via walk).
 *
 * SCOPE: viem's `BaseError.walk` follows the linear `.cause` chain only. We add a top-level
 * fallback for a plain (non-`BaseError`) `Error` (e.g. a Cypress-injected one). Deeply nested
 * plain `Error.cause` chains and `AggregateError.errors` are intentionally NOT traversed — the
 * write path's cancellation errors are either viem `BaseError`s or a top-level plain `Error`.
 */
export function hasUserRejectionMessage(error: unknown): boolean {
  if (error instanceof BaseError)
    return !!error.walk(
      (e) => e instanceof Error && isUserRejectionMessage(e.message)
    );
  return error instanceof Error && isUserRejectionMessage(error.message);
}
