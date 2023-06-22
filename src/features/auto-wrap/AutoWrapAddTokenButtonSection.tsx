import { Button, ButtonProps } from "@mui/material";
import { FC, memo, useState } from "react";
import AutoWrapAddTokenDialogSection from "./dialogs/AutoWrapAddTokenDialogSection";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { PlatformWhitelistedStatuses } from "./ScheduledWrapTables";
import AddIcon from "@mui/icons-material/Add";

const AutoWrapAddTokenButtonSection: FC<{
  ButtonProps?: ButtonProps;
  platformWhitelistedStatuses: PlatformWhitelistedStatuses;
}> = ({ ButtonProps = {}, platformWhitelistedStatuses }) => {
  const [isEnableAutoWrapDialogOpen, setEnableAutoWrapDialogOpen] =
    useState(false);
  const { visibleAddress } = useVisibleAddress();

  const openEnableAutoWrapDialog = () => setEnableAutoWrapDialogOpen(true);
  const closeEnableAutoWrapDialog = () => setEnableAutoWrapDialogOpen(false);

  if (!visibleAddress) {
    return null;
  }

  return (
    <>
      <Button
        data-cy={"add-token-auto-wrap-button"}
        variant="contained"
        color="primary"
        size="medium"
        endIcon={<AddIcon />}
        onClick={openEnableAutoWrapDialog}
        {...(ButtonProps || {})}
      >
        Add Token
      </Button>
      <AutoWrapAddTokenDialogSection
        platformWhitelistedStatuses={platformWhitelistedStatuses}
        closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
        isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
      />
    </>
  );
};

export default memo(AutoWrapAddTokenButtonSection);
