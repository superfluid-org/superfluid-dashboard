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
import { chainSupportsSafeMessage, RelayAuthorizationMethod } from "./relayApi";
import { useRelayCapabilities } from "./useRelayCapabilities";

/** The wagmi connector id for a Safe opened as a Safe App. */
export const SAFE_CONNECTOR_ID = "safe";

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
 * Why the relay cannot engage, when it cannot. Distinguished so the UI can wait rather than
 * refuse, and refuse specifically rather than generically.
 */
export type ClearMacroIneligibilityReason =
  /** The wallet type is still being classified (`isEOA === null`). Wait, do not refuse. */
  | "classification-pending"
  /** A Safe App is connected but the provider's capabilities have not resolved yet. Wait. */
  | "capability-pending"
  /** Capabilities could not be fetched. Fail closed, but say it is a lookup problem. */
  | "capability-unavailable"
  /** A Safe App on a chain where the provider only accepts plain signatures. */
  | "safe-unsupported-on-network"
  /** A contract wallet reached through WalletConnect/injected rather than as a Safe App. */
  | "contract-wallet-not-safe-app"
  /** Not a macro network, not connected, or impersonating. */
  | "unsupported";

export interface ClearMacroEligibility {
  /** The relay CAN engage for this action (regardless of the user's preference). */
  isEligible: boolean;
  /**
   * The account/network half of `isEligible` (macro network + supported wallet + connected +
   * not impersonating), independent of any action — for gates that exist before an action
   * kind does, e.g. the send form's forced-relay scheduling and allowlist bypass.
   */
  isAccountEligible: boolean;
  /**
   * How the signer would authorize the digest, once eligible. `undefined` while ineligible.
   * The executor branches on this, and for `safeMessageV1` it must never fall back to a paid
   * write.
   */
  authorizationMethod: RelayAuthorizationMethod | undefined;
  /**
   * The relay exists on this network and the ONLY blocker is the wallet type: a confirmed
   * smart-contract wallet that we cannot authorize. Derived only for settled cases — it stays
   * false while classification or capabilities are still pending, so the UI never flashes a
   * refusal at a wallet that turns out to be supported.
   */
  isContractWalletBlocked: boolean;
  /** Set whenever `isAccountEligible` is false, so callers can wait vs refuse deliberately. */
  ineligibilityReason: ClearMacroIneligibilityReason | undefined;
  /**
   * Something is still resolving. Gates that must fail closed (forced scheduling) have to
   * treat this as "not yet", never as "no".
   */
  isPending: boolean;
  /** The user's persisted preference. */
  isRelayEnabled: boolean;
  setRelayEnabled: (enabled: boolean) => void;
}

/**
 * The single source of Clear Macro eligibility truth for the UI — mirrors the executor's gate
 * in `useSuperfluidWriteContract` so what the user sees and what executes cannot drift.
 *
 * Three-way rather than the old `isEOA === true` boolean:
 *
 * - EOA + same visible signer -> eligible, authorized by a plain signature, synchronously.
 * - Contract wallet + same signer + the Safe App connector -> eligible only once the provider
 *   confirms `safeMessageV1` for this chain. Asynchronous, and fails closed on every unknown.
 * - Any other contract wallet -> blocked, even if it is a Safe. A Safe reached through
 *   WalletConnect or an injected provider cannot propose an off-chain message through the Safe
 *   Apps SDK, so the authorization we would build could never be signed.
 */
export function useClearMacroEligibility(
  actionKind: ClearMacroActionKind | undefined,
  network: Network
): ClearMacroEligibility {
  const dispatch = useAppDispatch();
  const { address, connector } = useAccount();
  const { isEOA, visibleAddress } = useVisibleAddress();
  const isRelayEnabled = useClearMacroEnabled();
  const capabilities = useRelayCapabilities();

  const isNetworkSupported = isClearMacroSupportedOnNetwork(network);
  // `isEOA` classifies the VISIBLE address — it only stands for the signer when they
  // are the same account (i.e. not impersonating). Same gate as the executor's.
  const isSameSigner =
    !!address && visibleAddress?.toLowerCase() === address.toLowerCase();
  const isSafeApp = connector?.id === SAFE_CONNECTOR_ID;

  let isAccountEligible = false;
  let authorizationMethod: RelayAuthorizationMethod | undefined;
  let ineligibilityReason: ClearMacroIneligibilityReason | undefined;

  if (!isNetworkSupported || !isSameSigner) {
    ineligibilityReason = "unsupported";
  } else if (isEOA === null || isEOA === undefined) {
    ineligibilityReason = "classification-pending";
  } else if (isEOA) {
    isAccountEligible = true;
    authorizationMethod = "signature";
  } else if (!isSafeApp) {
    ineligibilityReason = "contract-wallet-not-safe-app";
  } else if (capabilities.isPending) {
    ineligibilityReason = "capability-pending";
  } else if (!capabilities.data) {
    ineligibilityReason = "capability-unavailable";
  } else if (chainSupportsSafeMessage(capabilities.data, network.id)) {
    isAccountEligible = true;
    authorizationMethod = "safeMessageV1";
  } else {
    ineligibilityReason = "safe-unsupported-on-network";
  }

  const isPending =
    ineligibilityReason === "classification-pending" ||
    ineligibilityReason === "capability-pending";

  // Only settled refusals, so a still-resolving Safe App never flashes "not available".
  const isContractWalletBlocked =
    ineligibilityReason === "contract-wallet-not-safe-app" ||
    ineligibilityReason === "safe-unsupported-on-network" ||
    ineligibilityReason === "capability-unavailable";

  const isEligible = !!actionKind && isAccountEligible;

  const setRelayEnabled = useCallback(
    (enabled: boolean) =>
      dispatch(applySettings({ clearMacroEnabled: enabled })),
    [dispatch]
  );

  return {
    isEligible,
    isAccountEligible,
    authorizationMethod,
    isContractWalletBlocked,
    ineligibilityReason,
    isPending,
    isRelayEnabled,
    setRelayEnabled,
  };
}
