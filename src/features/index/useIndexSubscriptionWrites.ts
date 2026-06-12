import { useCallback } from "react";
import { idaAbi, idaAddress } from "@sfpro/sdk/abi/core";
import { Address, Hex, encodeFunctionData } from "viem";
import { ViemFeeOverrides } from "../transactions/viemFeeOverrides";
import {
  buildIndexSubscriptionApprovePendingUpdate,
  buildIndexSubscriptionRevokePendingUpdate,
} from "../pendingUpdates/buildPendingUpdates";
import {
  agreementCallSubOperation,
  getContractAddress,
  subOperationsWriteFragment,
} from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

interface IndexSubscriptionArgs {
  chainId: number;
  indexId: string;
  publisherAddress: string;
  superTokenAddress: string;
  userDataBytes?: Hex;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

const indexSubscriptionWriteFragment = (
  functionName: "approveSubscription" | "revokeSubscription",
  title: "Approve Index Subscription" | "Revoke Index Subscription",
  arg: IndexSubscriptionArgs
) => {
  const subOperation = agreementCallSubOperation({
    chainId: arg.chainId,
    agreementAddress: getContractAddress(idaAddress, arg.chainId, "IDAv1"),
    callData: encodeFunctionData({
      abi: idaAbi,
      functionName,
      args: [
        arg.superTokenAddress as Address,
        arg.publisherAddress as Address,
        Number(arg.indexId),
        "0x",
      ],
    }),
    userData: arg.userDataBytes ?? "0x",
    title,
  });
  return subOperationsWriteFragment(arg.chainId, [subOperation]);
};

/**
 * Approve an IDA index subscription via Host `callAgreement`. Drop-in replacement for
 * `rpcApi.useIndexSubscriptionApproveMutation()` — returns `[trigger, result]`.
 */
export function useIndexSubscriptionApprove() {
  const { write, result } = useSuperfluidWriteContract();

  const approveSubscription = useCallback(
    (arg: IndexSubscriptionArgs) =>
      write(() => ({
        chainId: arg.chainId,
        ...indexSubscriptionWriteFragment(
          "approveSubscription",
          "Approve Index Subscription",
          arg
        ),
        title: "Approve Index Subscription" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildIndexSubscriptionApprovePendingUpdate(hash, {
            chainId: arg.chainId,
            indexId: arg.indexId,
            publisherAddress: arg.publisherAddress,
            superTokenAddress: arg.superTokenAddress,
          }),
      })),
    [write]
  );

  return [approveSubscription, result] as const;
}

/**
 * Revoke an IDA index subscription via Host `callAgreement`. Drop-in replacement for
 * `rpcApi.useIndexSubscriptionRevokeMutation()` — returns `[trigger, result]`.
 */
export function useIndexSubscriptionRevoke() {
  const { write, result } = useSuperfluidWriteContract();

  const revokeSubscription = useCallback(
    (arg: IndexSubscriptionArgs) =>
      write(() => ({
        chainId: arg.chainId,
        ...indexSubscriptionWriteFragment(
          "revokeSubscription",
          "Revoke Index Subscription",
          arg
        ),
        title: "Revoke Index Subscription" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        getPendingUpdates: (hash: string) =>
          buildIndexSubscriptionRevokePendingUpdate(hash, {
            chainId: arg.chainId,
            indexId: arg.indexId,
            publisherAddress: arg.publisherAddress,
            superTokenAddress: arg.superTokenAddress,
          }),
      })),
    [write]
  );

  return [revokeSubscription, result] as const;
}
