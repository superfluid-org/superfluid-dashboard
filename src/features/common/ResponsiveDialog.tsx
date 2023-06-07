import { Dialog, DialogProps, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";

export type ResponsiveDialogProps = DialogProps;

const ResponsiveDialog: FC<DialogProps> = ({ children, ...props }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog fullWidth maxWidth={"sm"} fullScreen={fullScreen} {...props}>
      {children}
    </Dialog>
  );
};

export default ResponsiveDialog;
