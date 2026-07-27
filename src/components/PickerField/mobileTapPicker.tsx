import { TextField, TextFieldProps } from "@mui/material";
import { usePickerContext } from "@mui/x-date-pickers";
import { FieldOwnerState } from "@mui/x-date-pickers/models";
import { MouseEventHandler } from "react";

/**
 * Restores MUI X v7's mobile date-field behaviour.
 *
 * In v7, `useMobilePicker` forced the field `readOnly` and wired its `onClick`
 * to open the picker. v8 does neither (the field props only add `id`), so on
 * touch devices tapping a date field focuses it and raises the soft keyboard
 * instead of opening the picker modal — only the calendar icon opens it.
 * `enableAccessibleFieldDOMStructure={false}` does not cover this.
 *
 * Two levers are needed, at different layers:
 * - `readOnly` must arrive as a *field-internal* prop, i.e. through
 *   `slotProps.textField` (see `mobileTapTextFieldProps`), so it reaches
 *   `useField` and suppresses editing. It must NOT be set on the picker
 *   itself, which would disable the calendar icon too.
 * - opening on click needs `usePickerContext`, only available below the
 *   picker's provider — hence the `textField` slot component below.
 *
 * Desktop is untouched: the variant comes from MUI's own responsive
 * resolution, the same `desktopModeMediaQuery` the picker already used.
 *
 * NOTE: this renders `@mui/material`'s `TextField` because we still pin
 * `enableAccessibleFieldDOMStructure={false}`. When that pin is removed (it
 * has to be before MUI X v9), the base must become `PickersTextField`.
 */
function MobileTapTextField(props: TextFieldProps) {
  const { variant, triggerStatus, setOpen } = usePickerContext();

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    props.onClick?.(event);

    // The open-picker icon button calls preventDefault, so this does not
    // double-toggle when the icon itself is tapped.
    if (
      variant === "mobile" &&
      triggerStatus === "enabled" &&
      !event.isDefaultPrevented()
    ) {
      setOpen(true);
    }
  };

  return <TextField {...props} onClick={handleClick} />;
}

export const mobileTapPickerSlots = { textField: MobileTapTextField };

export const mobileTapTextFieldProps =
  <T extends Record<string, unknown>>(props?: T) =>
  (ownerState: FieldOwnerState) => ({
    ...props,
    readOnly: ownerState.pickerVariant === "mobile",
  });
