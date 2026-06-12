import { useCallback } from "react";
import { gdaForwarderAbi, gdaForwarderAddress } from "@sfpro/sdk/abi";
import { ViemFeeOverrides } from "../transactions/viemFeeOverrides";
import { buildConnectToPoolPendingUpdate } from "../pendingUpdates/buildPendingUpdates";
import { getContractAddress } from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

interface PoolConnectionArgs {
  chainId: number;
  poolAddress: string;
  superTokenAddress: string;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Connect the signer to a GDA pool via the GDAv1 forwarder. Drop-in replacement for
 * `rpcApi.useConnectToPoolMutation()` — returns `[trigger, result]`.
 */
export function useConnectToPool() {
  const { write, result } = useSuperfluidWriteContract();

  const connectToPool = useCallback(
    (arg: PoolConnectionArgs) =>
      write(() => ({
        chainId: arg.chainId,
        abi: gdaForwarderAbi,
        address: getContractAddress(
          gdaForwarderAddress,
          arg.chainId,
          "GDAv1 Forwarder"
        ),
        functionName: "connectPool",
        args: [arg.poolAddress, "0x"],
        title: "Connect to Pool" as const,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildConnectToPoolPendingUpdate(hash, {
            chainId: arg.chainId,
            poolAddress: arg.poolAddress,
            superTokenAddress: arg.superTokenAddress,
          }),
      })),
    [write]
  );

  return [connectToPool, result] as const;
}

/**
 * Disconnect the signer from a GDA pool via the GDAv1 forwarder. Drop-in replacement for
 * `rpcApi.useDisconnectFromPoolMutation()`. Mirrors existing behaviour: no optimistic pending
 * update is created (the legacy `disconnectFromPool` mutation never created one either).
 */
export function useDisconnectFromPool() {
  const { write, result } = useSuperfluidWriteContract();

  const disconnectFromPool = useCallback(
    (arg: PoolConnectionArgs) =>
      write(() => ({
        chainId: arg.chainId,
        abi: gdaForwarderAbi,
        address: getContractAddress(
          gdaForwarderAddress,
          arg.chainId,
          "GDAv1 Forwarder"
        ),
        functionName: "disconnectPool",
        args: [arg.poolAddress, "0x"],
        title: "Disconnect from Pool" as const,
        overrides: arg.overrides,
        simulate: arg.simulate,
      })),
    [write]
  );

  return [disconnectFromPool, result] as const;
}
