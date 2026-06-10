import { useMutation } from "@tanstack/react-query";
import { Abi, Address } from "viem";
import { useConfig } from "wagmi";
import { simulateContract, writeContract } from "@wagmi/core";
import { TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { useAppDispatch } from "../redux/store";
import { useAccount } from "@/hooks/useAccount";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import MutationResult from "../../MutationResult";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import {
  ethersOverridesToViem,
  ViemFeeOverrides,
} from "../../utils/ethersOverridesToViem";
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

  const mutation = useMutation<
    TransactionInfo,
    Error,
    SuperfluidWriteArgs | SuperfluidWriteArgsBuilder
  >({
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
    reset: mutation.reset,
  };

  return { write: mutation.mutateAsync, result };
}
