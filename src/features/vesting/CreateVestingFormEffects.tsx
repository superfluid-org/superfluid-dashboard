import { useFormContext } from "react-hook-form";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import { useEffect } from "react";
import { CommonFormEffects } from "../common/CommonFormEffects";

export function CreateVestingFormEffects() {
  const {
    watch,
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

  return <CommonFormEffects />;
}
