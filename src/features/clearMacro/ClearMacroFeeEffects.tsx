import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

/**
 * Re-runs form validation when the relay fee picture changes.
 *
 * The fee constraint lives in the form's yup schema, but React Hook Form does not re-validate
 * just because a resolver closed over new values — it validates on user input. Every input the
 * fee depends on settles asynchronously and independently of typing: the wallet-type
 * classification, the macro's fee getters, relay capabilities, the persisted gasless toggle
 * and payment mode, redux-persist rehydration.
 *
 * Without this, an amount entered before those settle stays "valid" until the next keystroke,
 * which is exactly the failure the fee constraint exists to prevent: the user enables gasless
 * after choosing a maximum amount and the form never re-checks it.
 *
 * Should be rendered inside a `FormProvider`.
 */
export function ClearMacroFeeEffects({ fingerprint }: { fingerprint: string }) {
  const { trigger, getValues } = useFormContext();
  // Deliberately starts undefined so the FIRST fingerprint counts as a change. With a warm
  // cache (SPA navigation: capabilities are `staleTime: Infinity`, the fee reads are cached)
  // the fee is already resolved at mount, so the first fingerprint is also the final one and
  // an already-seen ref would skip the only trigger there will ever be.
  const previous = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previous.current === fingerprint) return;
    previous.current = fingerprint;
    // Gate on "there is an amount to check", NOT on `isDirty`. Transaction restoration writes
    // the amount with `shouldDirty: false` (formRestorationOptions), so a restored
    // full-balance amount would never be re-validated — and the submit buttons read
    // `formState.isValid` directly rather than going through `handleSubmit`, so nothing else
    // would catch it either.
    if (!getValues("data.amountDecimal")) return;
    trigger();
  }, [fingerprint, getValues, trigger]);

  return null;
}
