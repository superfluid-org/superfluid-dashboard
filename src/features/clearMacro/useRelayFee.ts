import { useMemo } from "react";
import { Address, formatUnits, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import { findTokenFromTokenList } from "@/hooks/useTokenQuery";
import { Network } from "../network/networks";
import { ClearMacroActionKind, dashboardClearMacroAbi } from "./dashboardClearMacro";

/** Super Tokens are always 18 decimals, so the fee (in the fee Super Token) formats with 18. */
const FEE_TOKEN_DECIMALS = 18;

/** A scheduling action reserves up to 3 relayed txs (setup + 2 keeper runs); everything else is 1. */
function maxTxMultiplier(actionKind: ClearMacroActionKind | undefined): number {
  return actionKind === "scheduleFlow" ? 3 : 1;
}

export interface RelayFeeDisclosure {
  /** Whether the deployed macro exposes a non-zero fee we could read. */
  feeAvailable: boolean;
  feeSymbol?: string;
  /** Human-readable fee, e.g. `"0.001 USDCx"` — a range like `"0.001–0.003 USDCx"` for scheduling. */
  feeText?: string;
}

/**
 * Action-independent fee disclosure for the relay chip: reads the macro's `feeToken()` /
 * `baseFee()` getters and formats the amount. The exact per-action fee (incl. the schedule
 * multiplier and modify-detection) is quoted by the contract's `previewRelayFee` at execution;
 * here we only need enough for an honest pre-click label, so we show the base fee and — for a
 * scheduling action — the up-to-3× range from `actionKind` alone. Resilient: an older/feeless
 * macro without the getters simply reports `feeAvailable: false`.
 */
export function useRelayFeeDisclosure(
  network: Network,
  actionKind: ClearMacroActionKind | undefined
): RelayFeeDisclosure {
  const macroAddress = network.dashboardClearMacro?.macroAddress;

  const { data } = useReadContracts({
    contracts: macroAddress
      ? [
          {
            chainId: network.id,
            abi: dashboardClearMacroAbi,
            address: macroAddress,
            functionName: "feeToken",
          },
          {
            chainId: network.id,
            abi: dashboardClearMacroAbi,
            address: macroAddress,
            functionName: "baseFee",
          },
        ]
      : [],
    query: { enabled: Boolean(macroAddress) },
  });

  return useMemo<RelayFeeDisclosure>(() => {
    const feeTokenResult = data?.[0];
    const baseFeeResult = data?.[1];
    if (
      feeTokenResult?.status !== "success" ||
      baseFeeResult?.status !== "success"
    ) {
      return { feeAvailable: false };
    }

    const feeToken = feeTokenResult.result as Address;
    const baseFee = baseFeeResult.result as bigint;
    if (baseFee === 0n || feeToken === zeroAddress) {
      return { feeAvailable: false }; // feeless deployment
    }

    const symbol =
      findTokenFromTokenList({ chainId: network.id, address: feeToken })?.symbol ??
      "tokens";
    const format = (value: bigint) => formatUnits(value, FEE_TOKEN_DECIMALS);
    const multiplier = maxTxMultiplier(actionKind);
    const feeText =
      multiplier > 1
        ? `${format(baseFee)}–${format(baseFee * BigInt(multiplier))} ${symbol}`
        : `${format(baseFee)} ${symbol}`;

    return { feeAvailable: true, feeSymbol: symbol, feeText };
  }, [data, network.id, actionKind]);
}
