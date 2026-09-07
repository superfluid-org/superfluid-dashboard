import { useCallback } from "react";
import { Address, erc20Abi, maxUint256 } from "viem";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";
import { PERMIT2_ADDRESS } from "./permit2";

interface ApproveUsdcForPermit2Args {
  chainId: number;
  /** The fee token's ERC-20 underlying (USDC). */
  underlyingTokenAddress: string;
}

/**
 * The one-time `USDC.approve(Permit2, max)` that the `usdc-permit2` payment mode needs
 * before its first fee permit. Same shape as `useTokenApprove` (useTokenWrapWrites.ts) but
 * deliberately WITHOUT a `clearMacro` field: this write must self-pay through the normal
 * path — relayed through the macro it would consume the very fee it is enabling.
 */
export function useApproveUsdcForPermit2() {
  const { write, result } = useSuperfluidWriteContract();

  const approve = useCallback(
    (arg: ApproveUsdcForPermit2Args) =>
      write(() => ({
        chainId: arg.chainId,
        abi: erc20Abi,
        address: arg.underlyingTokenAddress as Address,
        functionName: "approve",
        // Max approval is the Permit2 convention: actual spending is bounded per-transfer
        // by the signed permit's amount, so there is nothing to re-approve later.
        args: [PERMIT2_ADDRESS, maxUint256],
        title: "Approve Allowance" as const,
      })),
    [write]
  );

  return [approve, result] as const;
}
