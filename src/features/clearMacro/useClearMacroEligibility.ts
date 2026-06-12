import { useCallback } from "react";
import { clearMacroForwarderAddress } from "@sfpro/sdk/abi";
import { useAccount } from "@/hooks/useAccount";
import { Network } from "../network/networks";
import { applySettings } from "../settings/appSettings.slice";
import { useClearMacroEnabled } from "../settings/appSettingsHooks";
import { useAppDispatch } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { ClearMacroActionKind } from "./dashboardClearMacro";

export function isClearMacroSupportedOnNetwork(network: Network): boolean {
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
  const isEligible =
    !!actionKind &&
    isClearMacroSupportedOnNetwork(network) &&
    isEOA === true &&
    !!address &&
    visibleAddress?.toLowerCase() === address.toLowerCase();

  const setRelayEnabled = useCallback(
    (enabled: boolean) =>
      dispatch(applySettings({ clearMacroEnabled: enabled })),
    [dispatch]
  );

  return { isEligible, isRelayEnabled, setRelayEnabled };
}
