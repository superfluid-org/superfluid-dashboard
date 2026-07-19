import { useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { useAccount } from "@/hooks/useAccount";
import { Network } from "../network/networks";
import { rpcApi, useAppDispatch } from "../redux/store";
import { applySettings } from "../settings/appSettings.slice";
import { useClearMacroPaymentMode } from "../settings/appSettingsHooks";
import { ClearMacroActionKind } from "./dashboardClearMacro";
import { ClearMacroPaymentMode } from "./executeClearMacro";
import { PERMIT2_ADDRESS } from "./permit2";
import { chainSupportsPermit2, getCapabilities } from "./relayApi";
import {
  RelayFeeDisclosure,
  ScheduleFlowQuoteAction,
  useRelayFeeDisclosure,
} from "./useRelayFee";

/**
 * The relay provider's capabilities as a react-query query. `getCapabilities` is already
 * module-cached (with failed fetches evicted), so this only adds the hook-side state.
 */
export function useRelayCapabilities() {
  return useQuery({
    queryKey: ["clearMacroRelayCapabilities"],
    queryFn: () => getCapabilities(),
    staleTime: Infinity,
    retry: 1,
  });
}

export interface ClearMacroUsdcFeePayment {
  fee: RelayFeeDisclosure;
  /** The persisted fee-payment selection (the chip is its only writer). */
  paymentMode: ClearMacroPaymentMode;
  setPaymentMode: (mode: ClearMacroPaymentMode) => void;
  /** Provider supports `clearMacroPermit2V1` here AND the fee token's underlying resolves. */
  canPayWithUsdc: boolean;
  /**
   * The capabilities fetch hasn't settled yet, so `canPayWithUsdc` is still pessimistic.
   * The chip uses this to keep a persisted USDC selection VISIBLE (disabled) during the
   * window — the executor resolves capabilities independently and could already honor it.
   */
  isCapabilitiesPending: boolean;
  /**
   * Permit2 support has NOT been positively ruled out: the fetch is still in flight, or it
   * failed and told us nothing. Failed capability fetches are evicted from the module cache,
   * so the executor's independent `getCapabilities()` can still succeed and pick Permit2 —
   * which makes an error state tentative, not a settled "unsupported". Callers sizing a
   * reservation must treat it as such; `canPayWithUsdc === false` alone cannot distinguish
   * "unsupported" from "unknown".
   */
  isCapabilitiesUnresolved: boolean;
  /** The signer's fee token (USDCx) available balance — the executor's exact read. */
  usdcxBalanceWei?: bigint;
  /** The signer's underlying (USDC) balance. */
  usdcBalanceWei?: bigint;
  /** USDCx can't cover the action's quoted fee — pay-with-USDC is the natural pick. */
  usdcxShortfall: boolean;
  /** The one-time USDC→Permit2 approval is still missing (only meaningful with `canPayWithUsdc`). */
  needsApproval: boolean;
  /** USDC can't cover the permit either. */
  usdcInsufficient: boolean;
  /** Re-read the Permit2 allowance (call after the one-time approve confirms). */
  refetchAllowance: () => void;
}

/**
 * Everything the chip's fee-payment selector needs, derived from the same sources the
 * executor guards against (`realtimeBalanceOfNow` available balance, underlying `balanceOf`,
 * Permit2 `allowance`, relay capabilities) so what the user sees and what executes can't drift.
 */
export function useClearMacroUsdcFeePayment(
  network: Network,
  actionKind: ClearMacroActionKind | undefined,
  scheduleAction?: ScheduleFlowQuoteAction
): ClearMacroUsdcFeePayment {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const fee = useRelayFeeDisclosure(network, actionKind, scheduleAction);
  const paymentMode = useClearMacroPaymentMode();

  const {
    data: capabilities,
    isPending: isCapabilitiesPending,
    isError: isCapabilitiesError,
  } = useRelayCapabilities();
  const canPayWithUsdc = Boolean(
    capabilities &&
      chainSupportsPermit2(capabilities, network.id) &&
      fee.feeAvailable &&
      fee.underlyingAddress &&
      fee.requiredUnderlyingWei != null
  );

  const { currentData: usdcxBalanceData } = rpcApi.useRealtimeBalanceOfNowQuery(
    address && fee.feeToken
      ? {
          chainId: network.id,
          tokenAddress: fee.feeToken,
          accountAddress: address,
        }
      : skipToken
  );
  const usdcxBalanceWei = usdcxBalanceData
    ? BigInt(usdcxBalanceData.availableBalance)
    : undefined;

  const { currentData: usdcBalanceData } = rpcApi.useUnderlyingBalanceQuery(
    address && fee.underlyingAddress
      ? {
          chainId: network.id,
          tokenAddress: fee.underlyingAddress,
          accountAddress: address,
        }
      : skipToken
  );
  const usdcBalanceWei = usdcBalanceData
    ? BigInt(usdcBalanceData.balance)
    : undefined;

  const allowanceQuery = useReadContract({
    chainId: network.id,
    abi: erc20Abi,
    address: fee.underlyingAddress,
    functionName: "allowance",
    args: address ? [address, PERMIT2_ADDRESS] : undefined,
    query: {
      enabled: Boolean(address && fee.underlyingAddress && canPayWithUsdc),
    },
  });
  const { refetch: refetchAllowance } = allowanceQuery;

  const usdcxShortfall =
    fee.feeWei != null &&
    usdcxBalanceWei != null &&
    usdcxBalanceWei < fee.feeWei;
  const needsApproval =
    canPayWithUsdc &&
    fee.requiredUnderlyingWei != null &&
    allowanceQuery.data != null &&
    allowanceQuery.data < fee.requiredUnderlyingWei;
  const usdcInsufficient =
    canPayWithUsdc &&
    fee.requiredUnderlyingWei != null &&
    usdcBalanceWei != null &&
    usdcBalanceWei < fee.requiredUnderlyingWei;

  const setPaymentMode = useCallback(
    (mode: ClearMacroPaymentMode) =>
      dispatch(applySettings({ clearMacroPaymentMode: mode })),
    [dispatch]
  );

  return {
    fee,
    paymentMode,
    setPaymentMode,
    canPayWithUsdc,
    isCapabilitiesPending,
    isCapabilitiesUnresolved: isCapabilitiesPending || isCapabilitiesError,
    usdcxBalanceWei,
    usdcBalanceWei,
    usdcxShortfall,
    needsApproval,
    usdcInsufficient,
    refetchAllowance: useCallback(() => {
      void refetchAllowance();
    }, [refetchAllowance]),
  };
}
