import { useCallback, useRef, useState } from "react";
import { Abi, Address } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { simulateContract } from "@wagmi/core";
import { TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { useAppDispatch } from "../redux/store";
import { useAccount } from "@/hooks/useAccount";
import MutationResult from "../../MutationResult";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { ViemFeeOverrides } from "../../utils/ethersOverridesToViem";
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
  /** viem fee fields (see `ethersOverridesToViem`); `gas: 0n` means smart wallet — omit gas + skip simulation. */
  overrides?: ViemFeeOverrides;
  /** Build the optimistic pending updates once the hash is known (ids/hash filled by caller). */
  getPendingUpdates?: (hash: string) => PendingUpdate[];
  /** Run `simulateContract` first to surface reverts before the wallet prompt. */
  simulate?: boolean;
}

const toSerializedError = (error: Error) => ({
  name: error.name,
  // viem errors expose a concise `shortMessage`; fall back to the full message.
  message: (error as { shortMessage?: string }).shortMessage ?? error.message,
});

/**
 * Shared core for wagmi-hook based Superfluid writes. Wraps `useWriteContract`, optionally
 * simulates, then hands the resulting hash to the Redux tracker via `trackTransaction`.
 * Returns a `result` shaped like RTK Query's mutation result so the existing
 * `TransactionBoundary` / `TransactionDialog` / button UX consume it unchanged.
 */
export function useSuperfluidWriteContract() {
  const config = useConfig();
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const {
    writeContractAsync,
    data: hash,
    status,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // `simulateContract` runs outside `useWriteContract`, so track its in-flight + error state
  // here to keep `result` a faithful single source of truth for the dialog.
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState<Error | undefined>(
    undefined
  );

  // useWriteContract only exposes the hash; remember the chainId of the in-flight write so
  // `result.data` can carry the full TransactionInfo the boundary expects.
  const chainIdRef = useRef<number | undefined>(undefined);

  const write = useCallback(
    async (params: SuperfluidWriteArgs): Promise<TransactionInfo> => {
      if (!address) throw new Error("No connected account.");

      setSimulateError(undefined);

      // `gas: 0n` signals a smart wallet (e.g. Gnosis Safe): it estimates gas itself, and
      // simulating against the EOA-style call context would be misleading (4337/delegatecall
      // execution differs), so omit gas and skip simulation entirely.
      const { gas, ...feeOverrides } = params.overrides ?? {};
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
      } as Parameters<typeof writeContractAsync>[0];

      chainIdRef.current = params.chainId;

      if (params.simulate && !isSmartWallet) {
        setIsSimulating(true);
        try {
          await simulateContract(config, request);
        } catch (error) {
          setSimulateError(error as Error);
          throw error;
        } finally {
          setIsSimulating(false);
        }
      }

      const txHash = await writeContractAsync(request);

      await dispatch(
        trackTransaction({
          hash: txHash,
          chainId: params.chainId,
          signerAddress: address,
          title: params.title,
          extraData: {
            ...(params.subTransactionTitles
              ? { subTransactionTitles: params.subTransactionTitles }
              : {}),
            ...params.extraData,
          },
          pendingUpdates: params.getPendingUpdates?.(txHash),
        })
      );

      return { hash: txHash, chainId: params.chainId };
    },
    [address, config, dispatch, writeContractAsync]
  );

  const reset = useCallback(() => {
    setSimulateError(undefined);
    setIsSimulating(false);
    resetWrite();
  }, [resetWrite]);

  const error = simulateError ?? writeError ?? undefined;

  const result: MutationResult<TransactionInfo> = {
    isUninitialized: status === "idle" && !isSimulating && !simulateError,
    isLoading: isSimulating || status === "pending",
    isSuccess: status === "success",
    isError: !!error,
    error: error ? toSerializedError(error) : undefined,
    data:
      hash && chainIdRef.current !== undefined
        ? { hash, chainId: chainIdRef.current }
        : undefined,
    reset,
  };

  return { write, result };
}
