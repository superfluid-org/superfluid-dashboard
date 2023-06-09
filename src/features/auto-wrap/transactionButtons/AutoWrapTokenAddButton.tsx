import { Button, ButtonProps } from "@mui/material";
import { FC, memo } from "react";
import AddIcon from "@mui/icons-material/Add";

const AutoWrapTokenAddButton: FC<{ ButtonProps?: ButtonProps, openEnableAutoWrapDialog: () => void }> = ({ ButtonProps = {}, openEnableAutoWrapDialog }) => {

    return <Button
        data-cy={"add-token-auto-wrap-button"}
        variant="contained"
        color="primary"
        size="medium"
        endIcon={<AddIcon />}
        onClick={openEnableAutoWrapDialog}
        {...ButtonProps || {}}
    >
        Add Token
    </Button>
}

export default memo(AutoWrapTokenAddButton);
