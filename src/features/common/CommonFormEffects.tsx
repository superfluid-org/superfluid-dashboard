import { useEffect } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useFormContext } from "react-hook-form";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

type Props = {
  autoSwitchToWalletNetworkWhenDirty?: boolean;
};

/**
 * Should be wrapped with a react-hook-form FormProvider.
 */
export function CommonFormEffects({
  autoSwitchToWalletNetworkWhenDirty = false,
}: Props) {
  const {
    formState: { isDirty },
    trigger,
  } = useFormContext();

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  // When a form is dirty, we don't want to automatically switch to wallet network on wallet connect because it might end up emptying the form.
  useEffect(() => {
    if (isDirty && !autoSwitchToWalletNetworkWhenDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [
    isDirty,
    stopAutoSwitchToWalletNetwork,
    autoSwitchToWalletNetworkWhenDirty,
  ]);

  const { visibleAddress } = useVisibleAddress();

  // Note(KK): I don't quite remember why this was necessary... I think it was related to setting initial form values for the Wrap view and it not trigger validation right away.
  useEffect(() => {
    if (isDirty) {
      trigger();
    }
  }, [visibleAddress]);

  return null;
}
