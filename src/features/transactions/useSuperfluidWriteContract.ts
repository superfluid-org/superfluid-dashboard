import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Abi, Address } from "viem";
import { useConfig } from "wagmi";
import { simulateContract, writeContract } from "@wagmi/core";
import { clearMacroForwarderAddress } from "@sfpro/sdk/abi";
import { TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { useAppDispatch } from "../redux/store";
import { useAccount } from "@/hooks/useAccount";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import MutationResult, { RelayPhase } from "../../MutationResult";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import {
  ethersOverridesToViem,
  ViemFeeOverrides,
} from "../../utils/ethersOverridesToViem";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useClearMacroEnabled } from "../settings/appSettingsHooks";
import { ClearMacroAction } from "../clearMacro/dashboardClearMacro";
import {
  ClearMacroNotEligibleError,
  executeClearMacro,
} from "../clearMacro/executeClearMacro";
import { trackTransaction } from "./trackTransaction";

export interface SuperfluidWriteArgs {
  chainId: number;
  abi: Abi;
  address: Address;
  functionName: string;
  args: readonly unknown[];
  /** Native value sent with the call (payable batchCall, native-asset upgrade). */
  value?: bigint;
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
  /** Run `simulateContract` first to surface reverts before the wallet prompt. */
  simulate?: boolean;
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
});

/**
 * Shared core for wagmi-hook based Superfluid writes. One TanStack `useMutation` spans the
 * whole trigger — preflight (args builder) → optional simulate → `writeContract` → handing
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
    mutationFn: async (argsOrBuilder) => {
      if (!address) throw new Error("No connected account.");

      const params =
        typeof argsOrBuilder === "function"
          ? await argsOrBuilder()
          : argsOrBuilder;

      const network = findNetworkOrThrow(allNetworks, params.chainId);
      const resolvedOverrides = ethersOverridesToViem(
        await getTransactionOverrides(network)
      );

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
            fallbackSimulationRequest: request,
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
            setRelayPhase(undefined);
          } else {
            throw error;
          }
        }
      }

      if (params.simulate && !isSmartWallet) {
        await simulateContract(config, request);
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

  return { write: mutation.mutateAsync, result };
}
