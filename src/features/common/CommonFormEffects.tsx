import { useEffect } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useFormContext } from "react-hook-form";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

/**
 * Should be wrapped with a react-hook-form FormProvider.
 */
export function CommonFormEffects() {
  const {
    formState: { isDirty },
    trigger,
  } = useFormContext();

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  // When a form is dirty, we don't want to automatically switch to wallet network on wallet connect because it might end up emptying the form.
  useEffect(() => {
    if (isDirty) stopAutoSwitchToWalletNetwork();
  }, [isDirty, stopAutoSwitchToWalletNetwork]);

  const { visibleAddress } = useVisibleAddress();

  // Note(KK): I don't quite remember why this was necessary... I think it was related to setting initial form values for the Wrap view and it not trigger validation right away.
  useEffect(() => {
    if (isDirty) {
      trigger();
    }
  }, [visibleAddress]);

  return null;
}
