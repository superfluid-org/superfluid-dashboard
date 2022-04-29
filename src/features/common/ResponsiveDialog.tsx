import { Dialog, DialogProps, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";

const ResponsiveDialog: FC<DialogProps> = ({ children, ...props }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog fullWidth={true} maxWidth={"sm"} fullScreen={fullScreen} {...props}>
      {children}
    </Dialog>
  );
};

export default ResponsiveDialog;
