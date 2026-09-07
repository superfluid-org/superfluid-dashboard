import { useMemo } from "react";
import { Address, formatUnits, Hex, isAddress, zeroAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { useAccount } from "@/hooks/useAccount";
import { findTokenFromTokenList } from "@/hooks/useTokenQuery";
import { Network } from "../network/networks";
import { TokenType } from "../redux/endpoints/tokenTypes";
import {
  CLEAR_MACRO_LANG,
  ClearMacroAction,
  ClearMacroActionKind,
  dashboardClearMacroAbi,
} from "./dashboardClearMacro";
import { feeToUnderlyingUnitsCeil } from "./permit2";
import { isClearMacroSupportedOnNetwork } from "./useClearMacroEligibility";

/** Super Tokens are always 18 decimals, so the fee (in the fee Super Token) formats with 18. */
const FEE_TOKEN_DECIMALS = 18;

/** Worst-case fallback while no exact quote is in: a new schedule pays 2x base per reserved keeper run on top of the setup tx, so up to 5x (start and stop); everything else is 1x. */
function maxFeeMultiplier(actionKind: ClearMacroActionKind | undefined): number {
  return actionKind === "scheduleFlow" ? 5 : 1;
}

/** The ScheduleFlow action shape the chip quotes the exact fee with (the write path's `clearMacro` attach shape — the rate is fee-irrelevant and canonicalized here). */
export type ScheduleFlowQuoteAction = Extract<
  ClearMacroAction,
  { kind: "scheduleFlow" }
>;

export interface RelayFeeDisclosure {
  /** Whether the deployed macro exposes a non-zero fee we could read. */
  feeAvailable: boolean;
  feeSymbol?: string;
  /** Human-readable fee: the exact quote or flat base (e.g. `"0.1 USDCx"`), or an `"up to 0.5 USDCx"` placeholder while a schedule quote is loading/unavailable. */
  feeText?: string;
  /** The exact `previewRelayFee` quote is in — `feeWei`/`feeText` are the contract's own number, not the worst-case fallback. */
  isQuoteExact: boolean;
  /** The fee Super Token (USDCx) address, when a fee is disclosed. */
  feeToken?: Address;
  /** The fee the executor's guard and the Permit2 permit are sized against (18 decimals): the exact quote when available, else the worst-case heuristic. Point-in-time — the charge follows the schedule state at relay execution. */
  feeWei?: bigint;
  /** The fee token's ERC-20 underlying (USDC) — resolvable only for a Wrapper Super Token. */
  underlyingAddress?: Address;
  underlyingDecimals?: number;
  underlyingSymbol?: string;
  /** `feeWei` in underlying units, rounded up — the exact Permit2 permit size. */
  requiredUnderlyingWei?: bigint;
}

/**
 * Fee disclosure for the relay chip: reads the macro's `feeToken()` / `baseFee()` getters
 * and — for a scheduling action with enough form state — quotes the EXACT fee through the
 * contract's own `encodeScheduleFlow` + `previewRelayFee` (the same reads the executor
 * trusts), so the label shows the precise 1x/3x/5x tier including modify-detection against
 * the on-chain schedule row. The quote is point-in-time: schedule state can change between
 * signing and relay execution, and the charge follows it (the signed description discloses
 * the amounts). While the quote is loading or the form can't be quoted yet, the label falls
 * back to a worst-case "up to" placeholder from `actionKind` alone. Also resolves the fee
 * token's ERC-20 underlying (for the pay-with-USDC option). Resilient: an older/feeless
 * macro without the getters simply reports `feeAvailable: false`.
 */
export function useRelayFeeDisclosure(
  network: Network,
  actionKind: ClearMacroActionKind | undefined,
  scheduleAction?: ScheduleFlowQuoteAction
): RelayFeeDisclosure {
  // Via the support predicate so the kill switch also stops the macro's fee reads —
  // with the relay off the quote is never used, and every read below is gated on this.
  const macroAddress = isClearMacroSupportedOnNetwork(network)
    ? network.dashboardClearMacro?.macroAddress
    : undefined;
  const { address } = useAccount();

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
  const feeTokenRead =
    data?.[0]?.status === "success" ? (data[0].result as Address) : undefined;
  const baseFeeRead =
    data?.[1]?.status === "success" ? (data[1].result as bigint) : undefined;
  const feeConfigured =
    feeTokenRead != null &&
    feeTokenRead !== zeroAddress &&
    baseFeeRead != null &&
    baseFeeRead > 0n;

  // The exact-quote struct, rate canonicalized to 0: the fee depends only on which dates
  // are set and whether a schedule row exists (`previewRelayFee` never validates the rate),
  // so per-keystroke rate edits must not refire the reads. Undefined = not quotable yet.
  const quoteStruct = useMemo(() => {
    if (actionKind !== "scheduleFlow" || !scheduleAction) return undefined;
    if (
      !isAddress(scheduleAction.superToken) ||
      !isAddress(scheduleAction.receiver)
    ) {
      return undefined;
    }
    if (!scheduleAction.startDate && !scheduleAction.endDate) return undefined;
    return {
      superToken: scheduleAction.superToken,
      receiver: scheduleAction.receiver,
      startDate: scheduleAction.startDate,
      flowRate: 0n,
      endDate: scheduleAction.endDate,
    };
  }, [actionKind, scheduleAction]);

  // Two chained reads keyed on the stable action-defining fields. No keepPreviousData
  // anywhere: a changed key (dates, receiver, token, account) drops straight back to the
  // "up to" placeholder instead of presenting a stale quote as exact. A failed read (e.g.
  // an older macro without these functions) does the same — never crashes the chip.
  const { data: quoteActionParams } = useReadContract({
    chainId: network.id,
    abi: dashboardClearMacroAbi,
    address: macroAddress,
    functionName: "encodeScheduleFlow",
    args: quoteStruct ? [CLEAR_MACRO_LANG as Hex, quoteStruct] : undefined,
    query: {
      enabled: Boolean(macroAddress && address && quoteStruct && feeConfigured),
    },
  });
  const { data: quoteResult } = useReadContract({
    chainId: network.id,
    abi: dashboardClearMacroAbi,
    address: macroAddress,
    functionName: "previewRelayFee",
    args:
      quoteActionParams && address
        ? [quoteActionParams as Hex, address]
        : undefined,
    query: {
      enabled: Boolean(
        macroAddress && address && quoteStruct && quoteActionParams
      ),
    },
  });
  // previewRelayFee returns [feeToken, feeReceiver, currentFee, maxFee]; the assumed
  // charge is currentFee. Only meaningful while the current form state is quotable.
  const quotedFeeWei =
    quoteStruct && quoteResult
      ? (quoteResult as readonly [Address, Address, bigint, bigint])[2]
      : undefined;

  return useMemo<RelayFeeDisclosure>(() => {
    if (!feeConfigured || feeTokenRead == null || baseFeeRead == null) {
      return { feeAvailable: false, isQuoteExact: false }; // unreadable or feeless deployment
    }

    const feeToken = feeTokenRead;
    const feeTokenEntry = findTokenFromTokenList({
      chainId: network.id,
      address: feeToken,
    });
    const symbol = feeTokenEntry?.symbol ?? "tokens";
    const format = (value: bigint) => formatUnits(value, FEE_TOKEN_DECIMALS);
    const isQuoteExact = quotedFeeWei != null;
    const feeWei = isQuoteExact
      ? quotedFeeWei
      : baseFeeRead * BigInt(maxFeeMultiplier(actionKind));
    const feeText =
      !isQuoteExact && actionKind === "scheduleFlow"
        ? `up to ${format(feeWei)} ${symbol}`
        : `${format(feeWei)} ${symbol}`;

    // Only a Wrapper Super Token has an ERC-20 underlying that Permit2 can pull.
    const underlyingAddress =
      feeTokenEntry?.type === TokenType.WrapperSuperToken &&
      "underlyingAddress" in feeTokenEntry &&
      feeTokenEntry.underlyingAddress
        ? (feeTokenEntry.underlyingAddress as Address)
        : undefined;
    const underlyingEntry = underlyingAddress
      ? findTokenFromTokenList({ chainId: network.id, address: underlyingAddress })
      : undefined;
    const underlyingDecimals = underlyingEntry?.decimals;
    const requiredUnderlyingWei =
      underlyingAddress && underlyingDecimals != null
        ? feeToUnderlyingUnitsCeil(feeWei, underlyingDecimals)
        : undefined;

    return {
      feeAvailable: true,
      isQuoteExact,
      feeSymbol: symbol,
      feeText,
      feeToken,
      feeWei,
      ...(underlyingAddress && underlyingDecimals != null
        ? {
            underlyingAddress,
            underlyingDecimals,
            underlyingSymbol: underlyingEntry?.symbol,
            requiredUnderlyingWei,
          }
        : {}),
    };
  }, [feeConfigured, feeTokenRead, baseFeeRead, quotedFeeWei, network.id, actionKind]);
}
