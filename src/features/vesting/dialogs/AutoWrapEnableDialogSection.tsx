import { Token } from "@superfluid-finance/sdk-core";
import { FC, memo } from "react";
import { Network } from "../../network/networks";
import ResponsiveDialog from "../../common/ResponsiveDialog";
import { DialogContent, DialogTitle, IconButton, Stack, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoWrapEnableDialogContentSection from "./AutoWrapEnableDialogContentSection";

const AutoWrapEnableDialogSection: FC<{ closeEnableAutoWrapDialog: () => void, isEnableAutoWrapDialogOpen: boolean, token: Token, network: Network }> = (
  { closeEnableAutoWrapDialog, isEnableAutoWrapDialogOpen, token, network }) => {
  const theme = useTheme();

  return <ResponsiveDialog
    data-cy={"auto-wrap-enable-dialog"}
    open={isEnableAutoWrapDialogOpen}
    onClose={closeEnableAutoWrapDialog}
    PaperProps={{ sx: { borderRadius: "20px", maxWidth: 550 } }}
    keepMounted={true}
  >
    <DialogTitle>
      <Stack alignItems={"center"} component={DialogTitle} gap={0.5} sx={{ p: 3.5 }}>
        <Typography variant="h4">Enable Auto-Wrap</Typography>
        <IconButton
          aria-label="close"
          onClick={closeEnableAutoWrapDialog}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <AutoWrapEnableDialogContentSection
        closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
        token={token}
        network={network} />
    </DialogContent>
  </ResponsiveDialog>
};

export default memo(AutoWrapEnableDialogSection);
