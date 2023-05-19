import { useFormContext } from "react-hook-form";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import { useEffect } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export function CreateVestingFormEffects() {
  const {
    watch,
    formState: { isDirty },
    resetField,
  } = useFormContext<PartialVestingForm>();

  const [superTokenAddress] = watch(["data.superTokenAddress"]);
  useEffect(
    () =>
      void resetField("data.setupAutoWrap", {
        keepDirty: true,
        keepTouched: true,
        keepError: false,
      }),
    [superTokenAddress]
  );

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  useEffect(() => {
    if (isDirty) stopAutoSwitchToWalletNetwork();
  }, [isDirty, stopAutoSwitchToWalletNetwork]);

  return null;
}
