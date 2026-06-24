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
