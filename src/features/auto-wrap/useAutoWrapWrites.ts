import { useCallback } from "react";
import { autoWrapManagerAbi } from "@sfpro/sdk/abi/automation";
import { Address, erc20Abi, maxUint256 } from "viem";
import { ViemFeeOverrides } from "../../utils/ethersOverridesToViem";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

/** Wrap schedules are open-ended; the manager just wants a far-future expiry (year 2065). */
const WRAP_SCHEDULE_EXPIRY = 3000000000n;

interface EnableAutoWrapArgs {
  chainId: number;
  superTokenAddress: string;
  underlyingTokenAddress: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Resolved inside the write builder so an unsupported chain surfaces through `result`
 * (dialog) instead of a render-time `!` bang.
 */
function getAutoWrapOrThrow(chainId: number) {
  const network = findNetworkOrThrow(allNetworks, chainId);
  if (!network.autoWrap) {
    throw new Error(`Auto-Wrap is not supported on ${network.name}.`);
  }
  return network.autoWrap;
}

/**
 * Create an Auto-Wrap schedule on the manager contract so the strategy tops up the super
 * token from the underlying when the balance runs low. Returns `[trigger, result]`.
 */
export function useEnableAutoWrap() {
  const { write, result } = useSuperfluidWriteContract();

  const enableAutoWrap = useCallback(
    (arg: EnableAutoWrapArgs) =>
      write(() => {
        const autoWrap = getAutoWrapOrThrow(arg.chainId);
        return {
          chainId: arg.chainId,
          abi: autoWrapManagerAbi,
          address: autoWrap.managerContractAddress,
          functionName: "createWrapSchedule",
          args: [
            arg.superTokenAddress as Address,
            autoWrap.strategyContractAddress,
            arg.underlyingTokenAddress as Address,
            WRAP_SCHEDULE_EXPIRY,
            BigInt(autoWrap.lowerLimit.toString()),
            BigInt(autoWrap.upperLimit.toString()),
          ],
          title: "Enable Auto-Wrap" as const,
          extraData: arg.transactionExtraData,
          overrides: arg.overrides,
          simulate: arg.simulate,
        };
      }),
    [write]
  );

  return [enableAutoWrap, result] as const;
}

interface AutoWrapAllowanceArgs {
  chainId: number;
  underlyingTokenAddress: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Approve the Auto-Wrap strategy to spend the underlying ERC-20 (unlimited allowance).
 * Returns `[trigger, result]`.
 */
export function useApproveAutoWrapAllowance() {
  const { write, result } = useSuperfluidWriteContract();

  const approveAllowance = useCallback(
    (arg: AutoWrapAllowanceArgs) =>
      write(() => {
        const autoWrap = getAutoWrapOrThrow(arg.chainId);
        return {
          chainId: arg.chainId,
          abi: erc20Abi,
          address: arg.underlyingTokenAddress as Address,
          functionName: "approve",
          args: [autoWrap.strategyContractAddress, maxUint256],
          title: "Approve Allowance" as const,
          extraData: arg.transactionExtraData,
          overrides: arg.overrides,
          simulate: arg.simulate,
        };
      }),
    [write]
  );

  return [approveAllowance, result] as const;
}

/**
 * Disable Auto-Wrap by zeroing the strategy's underlying ERC-20 allowance.
 * Returns `[trigger, result]`.
 */
export function useDisableAutoWrap() {
  const { write, result } = useSuperfluidWriteContract();

  const disableAutoWrap = useCallback(
    (arg: AutoWrapAllowanceArgs) =>
      write(() => {
        const autoWrap = getAutoWrapOrThrow(arg.chainId);
        return {
          chainId: arg.chainId,
          abi: erc20Abi,
          address: arg.underlyingTokenAddress as Address,
          functionName: "approve",
          args: [autoWrap.strategyContractAddress, 0n],
          title: "Disable Auto-Wrap" as const,
          extraData: arg.transactionExtraData,
          overrides: arg.overrides,
          simulate: arg.simulate,
        };
      }),
    [write]
  );

  return [disableAutoWrap, result] as const;
}
