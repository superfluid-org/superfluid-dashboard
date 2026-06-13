/**
 * Compile-time regression tests for the ABI-typed write layer. Never imported at
 * runtime — `pnpm typecheck` is the test runner: tsc fails when a valid case stops
 * compiling OR when a `@ts-expect-error` case starts compiling (unused directive).
 * This guards the inference machinery (`const TArgs`, payable-gated `value`)
 * against being "simplified" away.
 *
 * `@ts-expect-error` only covers the NEXT line, and tsc reports these errors on the
 * offending property's line — keep each failing property on a single line directly
 * below its directive.
 */
import { erc20Abi } from "viem";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { OPERATION_TYPE } from "@sfpro/sdk/constant";
import { useSuperfluidWriteContract } from "./useSuperfluidWriteContract";
import {
  cfaForwarderWriteFragment,
  contractCallSubOperation,
  WriteFragment,
} from "./operations";

declare const write: ReturnType<typeof useSuperfluidWriteContract>["write"];
declare const account: `0x${string}`;
declare const someString: string;
declare const widenedFragment: WriteFragment;

export function writeTypeRegressionTests() {
  // ── write(): valid calls compile ────────────────────────────────────────────

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    args: [account, 1n],
    title: "Approve Allowance",
  });

  // Builder form.
  void write(() => ({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    args: [account, 1n],
    title: "Approve Allowance" as const,
  }));

  // `value` is accepted on a payable function.
  void write({
    chainId: 1,
    abi: superTokenAbi,
    address: account,
    functionName: "upgradeByETH",
    args: [],
    value: 1n,
    title: "Upgrade to Super Token",
  });

  // Widened usage (spread `subOperationsWriteFragment` result) keeps compiling,
  // including `value` (payable batchCall path).
  void write({
    chainId: 1,
    ...widenedFragment,
    value: 1n,
    title: "Approve Allowance",
  });

  // ── write(): invalid calls are compile errors ───────────────────────────────

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    // @ts-expect-error — misspelled function name
    functionName: "aprove",
    args: [account, 1n],
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    // @ts-expect-error — swapped args order (amount, spender)
    args: [1n, account],
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    // @ts-expect-error — missing arg (amount)
    args: [account],
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    // @ts-expect-error — extra arg
    args: [account, 1n, 1n],
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    // @ts-expect-error — plain string where an address is required
    args: [someString, 1n],
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    // @ts-expect-error — read-only function (view) is not a write
    functionName: "balanceOf",
    args: [account, 1n], // approve-shaped so only `functionName` errors
    title: "Approve Allowance",
  });

  void write({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    args: [account, 1n],
    // @ts-expect-error — `value` on a nonpayable function
    value: 1n,
    title: "Approve Allowance",
  });

  // Builder form stays checked too (the error surfaces on the call, not the property).
  // @ts-expect-error — swapped args order inside a builder
  void write(() => ({
    chainId: 1,
    abi: erc20Abi,
    address: account,
    functionName: "approve",
    args: [1n, account],
    title: "Approve Allowance" as const,
  }));

  // ── contractCallSubOperation() ──────────────────────────────────────────────

  void contractCallSubOperation({
    operationType: OPERATION_TYPE.ERC20_APPROVE,
    target: account,
    abi: erc20Abi,
    functionName: "approve",
    args: [account, 1n],
    title: "Approve Allowance",
  });

  void contractCallSubOperation({
    operationType: OPERATION_TYPE.ERC20_APPROVE,
    target: account,
    abi: erc20Abi,
    functionName: "approve",
    // @ts-expect-error — swapped args order
    args: [1n, account],
    title: "Approve Allowance",
  });

  // ── cfaForwarderWriteFragment() (ABI-checked positional args) ───────────────
  // NOTE: like all positional args, a swap of two same-typed elements (the
  // `token, sender, receiver` address run) is NOT caught — only name/arity/type.

  void cfaForwarderWriteFragment(1, "deleteFlow", [
    account,
    account,
    account,
    "0x",
  ]);

  void cfaForwarderWriteFragment(
    1,
    "deleteFlow",
    // @ts-expect-error — missing element (userData)
    [account, account, account]
  );
}
