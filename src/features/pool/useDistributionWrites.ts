import { useCallback } from "react";
import { gdaForwarderAbi, gdaForwarderAddress } from "@sfpro/sdk/abi";
import { Address } from "viem";
import { ViemFeeOverrides } from "../transactions/viemFeeOverrides";
import { buildCancelDistributionStreamPendingUpdate } from "../pendingUpdates/buildPendingUpdates";
import { getContractAddress } from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

interface CancelDistributionStreamArgs {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  poolAddress: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Cancel an outgoing GDA distribution stream by requesting flow rate 0 via the GDAv1
 * forwarder. Drop-in replacement for `rpcApi.useCancelDistributionStreamMutation()` —
 * returns `[trigger, result]`.
 */
export function useCancelDistributionStream() {
  const { write, result } = useSuperfluidWriteContract();

  const cancelDistributionStream = useCallback(
    (arg: CancelDistributionStreamArgs) =>
      write(() => ({
        chainId: arg.chainId,
        abi: gdaForwarderAbi,
        address: getContractAddress(
          gdaForwarderAddress,
          arg.chainId,
          "GDAv1 Forwarder"
        ),
        functionName: "distributeFlow",
        args: [
          arg.superTokenAddress as Address, // token
          arg.senderAddress as Address, // from
          arg.poolAddress as Address, // pool
          0n, // requestedFlowRate (cancel = 0)
          "0x", // userData
        ],
        title: "Cancel Distribution Stream" as const,
        subTransactionTitles: ["Cancel Distribution Stream" as const],
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildCancelDistributionStreamPendingUpdate(hash, {
            chainId: arg.chainId,
            superTokenAddress: arg.superTokenAddress,
            senderAddress: arg.senderAddress,
            poolAddress: arg.poolAddress,
          }),
      })),
    [write]
  );

  return [cancelDistributionStream, result] as const;
}
