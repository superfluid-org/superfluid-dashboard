import { useCallback } from "react";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { Address, erc20Abi } from "viem";
import { nativeAssetSuperTokenAbi } from "../../generated";
import { ViemFeeOverrides } from "../../utils/ethersOverridesToViem";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

interface TokenApproveArgs {
  chainId: number;
  /** The wrapper super token whose underlying allowance is approved (the spender). */
  superTokenAddress: string;
  underlyingTokenAddress: string;
  amountWei: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Approve the wrapper super token to spend the underlying ERC-20 (needed before wrapping).
 * Drop-in replacement for `rpcApi.useApproveMutation()` — returns `[trigger, result]`.
 */
export function useTokenApprove() {
  const { write, result } = useSuperfluidWriteContract();

  const approve = useCallback(
    (arg: TokenApproveArgs) =>
      write(() => ({
        chainId: arg.chainId,
        abi: erc20Abi,
        address: arg.underlyingTokenAddress as Address,
        functionName: "approve",
        args: [arg.superTokenAddress as Address, BigInt(arg.amountWei)],
        title: "Approve Allowance" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
      })),
    [write]
  );

  return [approve, result] as const;
}

interface TokenWrapArgs {
  chainId: number;
  superTokenAddress: string;
  /** When the underlying is the chain's native asset, wrap goes through `upgradeByETH` (payable). */
  isNativeAssetUnderlyingToken: boolean;
  amountWei: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * Wrap (upgrade) an underlying token into its super token. Drop-in replacement for
 * `rpcApi.useSuperTokenUpgradeMutation()` — returns `[trigger, result]`.
 */
export function useTokenWrap() {
  const { write, result } = useSuperfluidWriteContract();

  const wrap = useCallback(
    (arg: TokenWrapArgs) =>
      write(() => ({
        chainId: arg.chainId,
        title: "Upgrade to Super Token" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        ...(arg.isNativeAssetUnderlyingToken
          ? {
              abi: nativeAssetSuperTokenAbi,
              address: arg.superTokenAddress as Address,
              functionName: "upgradeByETH",
              args: [],
              value: BigInt(arg.amountWei),
            }
          : {
              abi: superTokenAbi,
              address: arg.superTokenAddress as Address,
              functionName: "upgrade",
              args: [BigInt(arg.amountWei)],
            }),
      })),
    [write]
  );

  return [wrap, result] as const;
}

type TokenUnwrapArgs = TokenWrapArgs;

/**
 * Unwrap (downgrade) a super token back to its underlying token. Drop-in replacement for
 * `rpcApi.useSuperTokenDowngradeMutation()` — returns `[trigger, result]`.
 */
export function useTokenUnwrap() {
  const { write, result } = useSuperfluidWriteContract();

  const unwrap = useCallback(
    (arg: TokenUnwrapArgs) =>
      write(() => ({
        chainId: arg.chainId,
        title: "Downgrade from Super Token" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
        ...(arg.isNativeAssetUnderlyingToken
          ? {
              abi: nativeAssetSuperTokenAbi,
              address: arg.superTokenAddress as Address,
              functionName: "downgradeToETH",
              args: [BigInt(arg.amountWei)],
            }
          : {
              abi: superTokenAbi,
              address: arg.superTokenAddress as Address,
              functionName: "downgrade",
              args: [BigInt(arg.amountWei)],
            }),
      })),
    [write]
  );

  return [unwrap, result] as const;
}
