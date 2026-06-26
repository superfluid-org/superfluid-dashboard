import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem";
import * as Sentry from "@sentry/react";
import { useConfig } from "wagmi";
import { getPublicClient, simulateContract, writeContract } from "@wagmi/core";
import { clearMacroForwarderAddress } from "@sfpro/sdk/abi";
import { TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { useAppDispatch } from "../redux/store";
import { useAccount } from "@/hooks/useAccount";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import MutationResult, { RelayPhase } from "../../MutationResult";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { ViemFeeOverrides } from "./viemFeeOverrides";
import {
  classifyError,
  hasUserRejectionMessage,
  isContractRevert,
} from "./viemTransactionErrors";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useClearMacroEnabled } from "../settings/appSettingsHooks";
import { ClearMacroAction } from "../clearMacro/dashboardClearMacro";
import {
  ClearMacroNotEligibleError,
  executeClearMacro,
} from "../clearMacro/executeClearMacro";
import { trackTransaction } from "./trackTransaction";
import { WriteMutability } from "./operations";

export interface SuperfluidWriteArgs<
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<
    TAbi,
    WriteMutability
  > = ContractFunctionName<TAbi, WriteMutability>,
  // `args` is its own (inferred) type parameter, mirroring wagmi's
  // `WriteContractParameters` — the literal infers as a tuple first and is then
  // constraint-checked, which a bare `ContractFunctionArgs<...>` property can't do
  // (the unresolved conditional gives the array literal no tuple context).
  TArgs extends ContractFunctionArgs<
    TAbi,
    WriteMutability,
    TFunctionName
  > = ContractFunctionArgs<TAbi, WriteMutability, TFunctionName>,
> {
  chainId: number;
  abi: TAbi;
  address: Address;
  functionName: TFunctionName;
  args: TArgs;
  /**
   * Native value sent with the call (payable batchCall, native-asset upgrade).
   * Only accepted when the selected function is payable (wagmi's `GetValue`
   * pattern); widened usage (e.g. spread `subOperationsWriteFragment` results)
   * stays permissive via the `Abi extends TAbi` fallback.
   */
  value?: Abi extends TAbi
    ? bigint
    : TFunctionName extends Extract<
          TAbi[number],
          { type: "function"; stateMutability: "payable" }
        >["name"]
      ? bigint
      : never;
  /** Tracked-transaction title shown in the drawer. */
  title: TransactionTitle;
  /** Per-operation titles shown in the drawer for batched calls (kept in `extraData`). */
  subTransactionTitles?: TransactionTitle[];
  extraData?: Record<string, unknown>;
  /**
   * Optional per-call overrides merged OVER the automatically resolved ones (gas API fee
   * recommendation + smart-wallet detection + advanced global overrides). Only needed for
   * special cases, e.g. a fixed gas limit for quirky tokens.
   */
  overrides?: ViemFeeOverrides;
  /** Build the optimistic pending updates once the hash is known (ids/hash filled by caller). */
  getPendingUpdates?: (hash: string) => PendingUpdate[];
  /**
   * The Clear Macro equivalent of this write. When set AND the relay path is enabled +
   * eligible, the write executes gaslessly via the relay (one EIP-712 signature); any
   * pre-signature miss falls back to the normal path below.
   */
  clearMacro?: ClearMacroAction;
}

/**
 * Feature hooks pass a builder so that their preflight work (RPC reads, operation assembly,
 * validation) runs INSIDE the mutation lifecycle — failures there must surface through
 * `result` (dialog/error UI) just like the legacy RTK Query `queryFn` did, and `isLoading`
 * must cover them so buttons can't double-submit while reads are pending.
 */
export type SuperfluidWriteArgsBuilder = () =>
  | SuperfluidWriteArgs
  | Promise<SuperfluidWriteArgs>;

const toSerializedError = (error: Error) => ({
  name: error.name,
  // viem errors expose a concise `shortMessage`; fall back to the full message.
  message: (error as { shortMessage?: string }).shortMessage ?? error.message,
  // Stable, viem-aware category for the error dialog to switch on (the viem error CLASS is lost
  // once serialized to `{ name, message }`, so we classify here while the live error is in hand).
  code: classifyError(error),
});

// sdk-core parity: gas limit = estimate + 20%. Protects Superfluid agreement calls and Host
// `batchCall`s whose real on-chain gas exceeds a bare estimate (SuperApp callbacks, solvency
// branches). Integer-only bigint math.
const GAS_LIMIT_MULTIPLIER_NUM = 120n;
const GAS_LIMIT_MULTIPLIER_DEN = 100n;

/**
 * Shared core for wagmi-hook based Superfluid writes. One TanStack `useMutation` spans the
 * whole trigger — preflight (args builder) → gas estimate + buffer → `writeContract` → handing
 * the hash to the Redux tracker via `trackTransaction` — so the entire lifecycle is
 * library-managed (no hand-rolled loading/error state). Returns a `result` shaped like RTK
 * Query's mutation result so the existing `TransactionBoundary` / `TransactionDialog` /
 * button UX consume it unchanged.
 */
export function useSuperfluidWriteContract() {
  const config = useConfig();
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const getTransactionOverrides = useGetTransactionOverrides();
  const clearMacroEnabled = useClearMacroEnabled();
  const { isEOA, visibleAddress } = useVisibleAddress();
  const [relayPhase, setRelayPhase] = useState<RelayPhase | undefined>();

  const mutation = useMutation<
    TransactionInfo,
    Error,
    SuperfluidWriteArgs | SuperfluidWriteArgsBuilder
  >({
    // Clear a stale phase from a previous run (it is deliberately left set after success
    // so the success view can note the relay).
    onMutate: () => setRelayPhase(undefined),
    // Centralized Sentry logging for write failures. The old RTK Query write path got this from
    // the `sentryErrorLogger` Redux middleware (store.ts), which no longer sees these wagmi /
    // TanStack mutations. Skip user-side, non-actionable conditions the dialog already explains:
    // user rejections (viem-typed + message-only, both walking the cause chain) and insufficient
    // native funds. Contract reverts are intentionally logged — they can signal a real
    // tx-construction bug.
    onError: (error) => {
      const code = classifyError(error); // walks for UserRejectedRequestError / InsufficientFundsError
      if (code === "USER_REJECTED" || code === "INSUFFICIENT_FUNDS") return;
      if (hasUserRejectionMessage(error)) return; // rejections viem doesn't type (auto-wrap, Cypress)
      Sentry.captureException(error);
    },
    mutationFn: async (argsOrBuilder) => {
      if (!address) throw new Error("No connected account.");

      const params =
        typeof argsOrBuilder === "function"
          ? await argsOrBuilder()
          : argsOrBuilder;

      const network = findNetworkOrThrow(allNetworks, params.chainId);
      const resolvedOverrides = await getTransactionOverrides(network);

      // `gas: 0n` signals a smart wallet (e.g. Gnosis Safe): it estimates gas itself, and
      // simulating against the EOA-style call context would be misleading (4337/delegatecall
      // execution differs), so omit gas and skip simulation entirely.
      const { gas, ...feeOverrides } = {
        ...resolvedOverrides,
        ...params.overrides,
      };
      const isSmartWallet = gas === 0n;

      const request = {
        chainId: params.chainId,
        abi: params.abi,
        address: params.address,
        functionName: params.functionName,
        args: params.args,
        account: address,
        ...(params.value !== undefined ? { value: params.value } : {}),
        ...feeOverrides,
        ...(!isSmartWallet && gas !== undefined ? { gas } : {}),
        // The concrete ABI/functionName/args typing lives at the per-use-case call sites;
        // the generic core widens to `Abi`, so we relax the request type here.
      } as Parameters<typeof writeContract>[1];

      // Clear Macro relay path: gasless execution off one EIP-712 signature. Fee
      // overrides don't apply (the relay provider pays gas). Gated on `isEOA === true`
      // (not just the gas sentinel — `isEOA` is null while still classifying the wallet).
      // `isEOA` classifies the VISIBLE address, so it only stands for the signer when
      // they are the same account (i.e. not impersonating).
      if (
        params.clearMacro &&
        clearMacroEnabled &&
        isEOA === true &&
        visibleAddress?.toLowerCase() === address.toLowerCase() &&
        !isSmartWallet &&
        network.dashboardClearMacro &&
        clearMacroForwarderAddress[
          params.chainId as keyof typeof clearMacroForwarderAddress
        ]
      ) {
        try {
          const { hash, executionId } = await executeClearMacro(config, {
            chainId: params.chainId,
            signerAddress: address,
            action: params.clearMacro,
            macroAddress: network.dashboardClearMacro.macroAddress,
            // Simulating the fallback write surfaces reverts (insufficient balance,
            // existing stream, ...) in the dialog before the signature prompt.
            fallbackSimulationRequest:
              request as Parameters<typeof simulateContract>[1],
            onPhase: setRelayPhase,
          });

          await dispatch(
            trackTransaction({
              hash,
              chainId: params.chainId,
              signerAddress: address,
              title: params.title,
              extraData: {
                ...(params.subTransactionTitles
                  ? { subTransactionTitles: params.subTransactionTitles }
                  : {}),
                ...params.extraData,
                clearMacroExecutionId: executionId,
              },
              pendingUpdates: params.getPendingUpdates?.(hash),
            })
          );

          return { hash, chainId: params.chainId };
        } catch (error) {
          if (error instanceof ClearMacroNotEligibleError) {
            // Nothing was signed — fall through to the normal write path below.
            // The cause carries the real reason (failed fetch/read, field mismatch).
            console.warn(
              "Clear Macro relay not eligible, falling back to the direct write.",
              error,
              error.cause
            );
            // Surface the gasless→self-pay switch in the dialog. The phase persists through the
            // self-pay `writeContract` that follows (and into success); the dialog narrates it.
            setRelayPhase("fallback");
          } else {
            throw error;
          }
        }
      }

      // Unified pre-flight (sdk-core parity): one `eth_estimateGas` that both buffers the gas
      // limit (+20%) AND surfaces reverts before the wallet prompt. Skipped for smart wallets
      // (estimate themselves) and when a caller supplied an explicit `gas` override. The Clear
      // Macro relay path already returned above, so this only runs for self-pay writes
      // (including the relay-fallback case, where self-paying is now correct).
      //
      // We only *throw* a revert when the signer is a confirmed EOA paying for its own call
      // (mirrors the relay branch's gate). While the wallet is still being classified
      // (`isEOA === null`), a smart wallet hasn't been tagged with the `gas: 0n` sentinel yet, so
      // an EOA-style estimate against it could falsely revert — during that window we still buffer
      // on success but never block: fall back to wallet estimation instead.
      const isConfirmedEoaSigner =
        isEOA === true &&
        visibleAddress?.toLowerCase() === address.toLowerCase();
      if (!isSmartWallet && gas === undefined) {
        const publicClient = getPublicClient(config, { chainId: params.chainId });
        try {
          const estimated = await publicClient!.estimateContractGas({
            abi: params.abi,
            address: params.address,
            functionName: params.functionName,
            args: params.args,
            account: address,
            ...(params.value !== undefined ? { value: params.value } : {}),
            // Plain eth_estimateGas, no fee prepay. json-rpc/injected accounts already skip
            // fee-fill; `prepare: false` pins that + skips the prepare round-trip, keeping the
            // pre-pay check at `balance >= value` (passes for non-payable value=0 and for native
            // wraps the form already balance-checks).
            prepare: false,
          } as Parameters<NonNullable<typeof publicClient>["estimateContractGas"]>[0]);
          request.gas =
            (estimated * GAS_LIMIT_MULTIPLIER_NUM) / GAS_LIMIT_MULTIPLIER_DEN;
        } catch (error) {
          // A real on-chain revert surfaces in the dialog (sdk-core parity) — but only for a
          // confirmed EOA signer; while classification is pending we never block (see above).
          if (isConfirmedEoaSigner && isContractRevert(error)) throw error;
          // Any other failure (transport/timeout, unsupported method, node hiccup, gas-cap, or
          // `publicClient` undefined) — log and fall back: omit gas, let the wallet estimate.
          Sentry.captureException(error, { level: "warning" });
        }
      }

      const hash = await writeContract(config, request);

      await dispatch(
        trackTransaction({
          hash,
          chainId: params.chainId,
          signerAddress: address,
          title: params.title,
          extraData: {
            ...(params.subTransactionTitles
              ? { subTransactionTitles: params.subTransactionTitles }
              : {}),
            ...params.extraData,
          },
          pendingUpdates: params.getPendingUpdates?.(hash),
        })
      );

      return { hash, chainId: params.chainId };
    },
  });

  const result: MutationResult<TransactionInfo> = {
    isUninitialized: mutation.isIdle,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error ? toSerializedError(mutation.error) : undefined,
    data: mutation.data,
    relayPhase,
    reset: () => {
      setRelayPhase(undefined);
      mutation.reset();
    },
  };

  const { mutateAsync } = mutation;
  // Generic wrapper so each call infers functionName/args from the concrete ABI
  // (`useMutation` fixes its variables type at hook creation, so the generics must
  // live here). A narrow instantiation is structurally within the widened type, but
  // TS can't prove that through the unresolved `ContractFunctionArgs` conditional,
  // hence the cast.
  const write = useCallback(
    <
      const TAbi extends Abi,
      TFunctionName extends ContractFunctionName<TAbi, WriteMutability>,
      const TArgs extends ContractFunctionArgs<
        TAbi,
        WriteMutability,
        TFunctionName
      >,
    >(
      argsOrBuilder:
        | SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>
        | (() =>
            | SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>
            | Promise<SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>>)
    ) =>
      mutateAsync(
        argsOrBuilder as unknown as
          | SuperfluidWriteArgs
          | SuperfluidWriteArgsBuilder
      ),
    [mutateAsync]
  );

  return { write, result };
}
