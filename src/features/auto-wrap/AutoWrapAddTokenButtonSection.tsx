

import { ButtonProps } from "@mui/material";
import { FC, memo, useCallback, useState } from "react";
import AutoWrapTokenAddButton from "./transactionButtons/AutoWrapTokenAddButton";
import AutoWrapAddTokenDialogSection from "./dialogs/AutoWrapAddTokenDialogSection";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { PlatformWhitelistedStatuses } from "./ScheduledWrapTables";

const AutoWrapAddTokenButtonSection: FC<{ ButtonProps?: ButtonProps, platformWhitelistedStatuses:PlatformWhitelistedStatuses }> = ({ ButtonProps = {}, platformWhitelistedStatuses }) => {
    const [isEnableAutoWrapDialogOpen, setEnableAutoWrapDialogOpen] = useState(false);
    const { visibleAddress } = useVisibleAddress();
    const openEnableAutoWrapDialog = useCallback(() => setEnableAutoWrapDialogOpen(true), [setEnableAutoWrapDialogOpen]);
    const closeEnableAutoWrapDialog = useCallback(() => setEnableAutoWrapDialogOpen(false), [setEnableAutoWrapDialogOpen]);

    if (!visibleAddress) {
        return null;
    }
    
    return <>
        <AutoWrapTokenAddButton ButtonProps={ButtonProps} openEnableAutoWrapDialog={openEnableAutoWrapDialog} />
        <AutoWrapAddTokenDialogSection
            platformWhitelistedStatuses={platformWhitelistedStatuses}
            closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
            isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
        />
    </>
}

export default memo(AutoWrapAddTokenButtonSection);