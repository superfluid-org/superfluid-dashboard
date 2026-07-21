import { FormLabel, Stack } from "@mui/material";
import { memo, ReactNode } from "react";
import TooltipWithIcon from "../common/TooltipWithIcon";

// One label treatment for every field on the send forms. The optional info icon
// sits directly after the label text rather than pushed to the far right of the
// field, so icons line up with their subject instead of floating at varying
// distances across differently-sized inputs.
export const FieldLabel = memo(function FieldLabel(props: {
  children: ReactNode;
  tooltip?: ReactNode;
  // Id of the control this labels. The send-form controls aren't wrapped in a
  // FormControl (several aren't even native inputs — the receiver and token
  // pickers are buttons that open dialogs), so the association has to be made
  // explicitly for a label click to reach the control.
  htmlFor?: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      // Owns the gap to the input; FormLabel's own margin is cancelled so the
      // row height doesn't depend on whether a tooltip is present.
      sx={{ mb: 1 }}
    >
      <FormLabel
        htmlFor={props.htmlFor}
        sx={{ mb: 0, ...(props.htmlFor ? { cursor: "pointer" } : {}) }}
      >
        {props.children}
      </FormLabel>
      {props.tooltip && (
        <TooltipWithIcon
          title={props.tooltip}
          IconProps={{ sx: { fontSize: 16 } }}
        />
      )}
    </Stack>
  );
});
