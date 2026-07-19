import { useMemo } from "react";
import { Address } from "viem";
import { Network } from "../network/networks";
import { useClearMacroEligibility } from "./useClearMacroEligibility";
import { useClearMacroUsdcFeePayment } from "./useClearMacroUsdcFeePayment";

export interface ClearMacroFeeFacts {
  /** The relay could charge a fee for a write from this account on this network. */
  isRelayActive: boolean;
  /** The fee Super Token (USDCx) and the amount charged, in its 18 decimals. */
  feeToken?: Address;
  feeWei?: bigint;
  /** The fee token's ERC-20 underlying (USDC) and the permit size, in ITS decimals. */
  feeUnderlyingToken?: Address;
  feeUnderlyingWei?: bigint;
  /** The fee could be taken from the Super Token balance (`usdcx-direct`). */
  couldPayFromSuperToken: boolean;
  /** The fee could be taken from the underlying balance (`usdc-permit2`). */
  couldPayFromUnderlying: boolean;
  /**
   * Changes whenever anything above changes. Feed it to a `trigger()` effect: form validation
   * is the thing that enforces the fee, and React Hook Form does not re-run a resolver just
   * because its captured values changed.
   */
  fingerprint: string;
}

/**
 * What the relay fee WOULD cost this account, independent of any particular token — callers
 * compare their own token against `feeToken`/`feeUnderlyingToken`.
 *
 * Both `couldPay*` flags can be true at once, and that is the point. The executor picks its
 * payment path at submit time from state this hook may not have settled yet (relay
 * capabilities, whether the fee token's underlying resolves), and an earlier design that
 * committed to one path produced a ZERO reservation whenever the guess went the wrong way —
 * which silently means "spend everything". So a path counts as possible unless it has been
 * positively ruled out. Over-reserving costs a fee-sized remainder the user still holds;
 * under-reserving costs an amount the form cannot submit and does not explain.
 *
 * Correctness does NOT depend on this being resolved at any particular moment. Consumers
 * enforce it in validation, which re-runs — so a fee that resolves late simply surfaces its
 * error late, rather than being baked into an amount at button-press time.
 */
export function useClearMacroFeeFacts(network: Network): ClearMacroFeeFacts {
  // `isAccountEligible` is the action-independent half: this hook is used where the action
  // kind isn't known yet (a form provider serving both wrap and unwrap).
  const { isAccountEligible, isRelayEnabled } = useClearMacroEligibility(
    undefined,
    network
  );
  const { fee, paymentMode, canPayWithUsdc, isCapabilitiesUnresolved } =
    useClearMacroUsdcFeePayment(network, undefined);

  const isRelayActive = isAccountEligible && isRelayEnabled && fee.feeAvailable;

  return useMemo(() => {
    if (!isRelayActive || fee.feeWei == null) {
      return {
        isRelayActive: false,
        couldPayFromSuperToken: false,
        couldPayFromUnderlying: false,
        fingerprint: "inactive",
      };
    }

    const hasUnderlying =
      fee.underlyingAddress != null && fee.requiredUnderlyingWei != null;
    const isUnderlyingSelected = paymentMode === "usdc-permit2";
    // Positively confirmed Permit2: capabilities settled in favour AND the underlying
    // resolves. Anything short of that leaves the Super Token path live, because the
    // executor degrades to it (unsupported chain, or no resolvable underlying).
    const isUnderlyingConfirmed =
      isUnderlyingSelected && canPayWithUsdc && hasUnderlying;

    return {
      isRelayActive: true,
      feeToken: fee.feeToken,
      feeWei: fee.feeWei,
      feeUnderlyingToken: fee.underlyingAddress,
      feeUnderlyingWei: fee.requiredUnderlyingWei,
      couldPayFromSuperToken: !isUnderlyingConfirmed,
      couldPayFromUnderlying:
        isUnderlyingSelected &&
        hasUnderlying &&
        (canPayWithUsdc || isCapabilitiesUnresolved),
      fingerprint: [
        fee.feeToken,
        fee.feeWei,
        fee.underlyingAddress,
        fee.requiredUnderlyingWei,
        paymentMode,
        canPayWithUsdc,
        isCapabilitiesUnresolved,
      ].join("|"),
    };
  }, [
    isRelayActive,
    fee.feeToken,
    fee.feeWei,
    fee.underlyingAddress,
    fee.requiredUnderlyingWei,
    paymentMode,
    canPayWithUsdc,
    isCapabilitiesUnresolved,
  ]);
}
