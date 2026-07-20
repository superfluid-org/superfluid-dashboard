import { useCallback } from "react";
import { clearMacroForwarderAddress } from "@sfpro/sdk/abi";
import { useAccount } from "@/hooks/useAccount";
import config from "@/utils/config";
import { Network } from "../network/networks";
import { applySettings } from "../settings/appSettings.slice";
import { useClearMacroEnabled } from "../settings/appSettingsHooks";
import { useAppDispatch } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { ClearMacroActionKind } from "./dashboardClearMacro";

export function isClearMacroSupportedOnNetwork(network: Network): boolean {
  // Deployment-wide kill switch (NEXT_PUBLIC_DISABLE_CLEAR_MACRO). Checked here so
  // every consumer — the UI eligibility hook, the send form's forced-relay scheduling
  // and allowlist bypass, and the executor gate — goes dark together.
  if (config.isClearMacroDisabled) return false;

  return Boolean(
    network.dashboardClearMacro &&
      clearMacroForwarderAddress[
        network.id as keyof typeof clearMacroForwarderAddress
      ]
  );
}

/**
 * The single source of Clear Macro eligibility truth for the UI — mirrors the executor's
 * gate in `useSuperfluidWriteContract` (same network capability check, same `isEOA === true`
 * signal from `VisibleAddressContext`) so what the user sees and what executes cannot drift.
 */
export function useClearMacroEligibility(
  actionKind: ClearMacroActionKind | undefined,
  network: Network
): {
  /** The relay CAN engage for this action (regardless of the user's preference). */
  isEligible: boolean;
  /**
   * The account/network half of `isEligible` (macro network + confirmed EOA + connected +
   * not impersonating), independent of any action — for gates that exist before an action
   * kind does, e.g. the send form's forced-relay scheduling and allowlist bypass.
   */
  isAccountEligible: boolean;
  /**
   * The relay exists on this network and the ONLY blocker is the wallet type: a
   * confirmed smart-contract wallet (`isEOA === false` — 7702-delegated EOAs count as
   * EOAs) on a macro network, connected and not impersonating. Lets the UI show a
   * "relay not available" state instead of rendering nothing; stays false while the
   * classification is still pending.
   */
  isContractWalletBlocked: boolean;
  /** The user's persisted preference. */
  isRelayEnabled: boolean;
  setRelayEnabled: (enabled: boolean) => void;
} {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { isEOA, visibleAddress } = useVisibleAddress();
  const isRelayEnabled = useClearMacroEnabled();

  // `isEOA` classifies the VISIBLE address — it only stands for the signer when they
  // are the same account (i.e. not impersonating). Same gate as the executor's.
  const isSameSigner =
    !!address && visibleAddress?.toLowerCase() === address.toLowerCase();
  const isAccountEligible =
    isClearMacroSupportedOnNetwork(network) && isEOA === true && isSameSigner;
  const isContractWalletBlocked =
    isClearMacroSupportedOnNetwork(network) && isEOA === false && isSameSigner;

  const isEligible = !!actionKind && isAccountEligible;

  const setRelayEnabled = useCallback(
    (enabled: boolean) =>
      dispatch(applySettings({ clearMacroEnabled: enabled })),
    [dispatch]
  );

  return {
    isEligible,
    isAccountEligible,
    isContractWalletBlocked,
    isRelayEnabled,
    setRelayEnabled,
  };
}
