

import { ButtonProps } from "@mui/material";
import { FC, memo, useCallback, useState } from "react";
import AutoWrapTokenAddButton from "./transactionButtons/AutoWrapTokenAddButton";
import AutoWrapAddTokenDialogSection from "./dialogs/AutoWrapAddTokenDialogSection";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

const AutoWrapAddTokenButtonSection: FC<{ ButtonProps?: ButtonProps }> = ({ ButtonProps = {} }) => {
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
            closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
            isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
        />
    </>
}

export default memo(AutoWrapAddTokenButtonSection);