import { useCallback } from "react";
import { Address, erc20Abi } from "viem";
import { ViemFeeOverrides } from "../../../utils/ethersOverridesToViem";
import { useSuperfluidWriteContract } from "../../transactions/useSuperfluidWriteContract";

interface TransferArgs {
  chainId: number;
  tokenAddress: string;
  receiverAddress: string;
  amountWei: string;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

/**
 * ERC-20 transfer of a (super) token. Drop-in replacement for
 * `rpcApi.useTransferMutation()` — returns `[trigger, result]`.
 */
export function useTransfer() {
  const { write, result } = useSuperfluidWriteContract();

  const transfer = useCallback(
    (arg: TransferArgs) =>
      write(() => ({
        chainId: arg.chainId,
        abi: erc20Abi,
        address: arg.tokenAddress as Address,
        functionName: "transfer",
        args: [arg.receiverAddress as Address, BigInt(arg.amountWei)],
        title: "Send Transfer" as const,
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
      })),
    [write]
  );

  return [transfer, result] as const;
}
