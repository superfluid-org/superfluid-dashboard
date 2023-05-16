import { FC, ReactNode, PropsWithChildren } from "react";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { Avatar, Button, DialogContent, DialogTitle, IconButton, Stack, Typography, alpha } from "@mui/material";
import { useTheme } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import styled from "@emotion/styled";
import { FlowRateInput } from "../send/FlowRateInput";
import { Controller } from "react-hook-form";


const EditIconWrapper = styled(Avatar)(({ theme }) => ({
    width: "40px",
    height: "40px",
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    borderColor: theme.palette.other.outline,
    [theme.breakpoints.down("md")]: {
        width: "32px",
        height: "32px",
    },
}));

interface AccessAllowanceEditDialogProps {
    children: ReactNode;
    onClose: () => void;
    open: boolean;
}

export const AccessAllowanceEditDialog: FC<AccessAllowanceEditDialogProps> = ({ onClose, children, open }) => {
    return <ResponsiveDialog
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { borderRadius: "20px", maxHeight: "100%" } }}
        translate="yes"
    >
        {children}
    </ResponsiveDialog>
};

export const EditERC20Allowance: FC<PropsWithChildren & { onClose: () => void }> = ({ onClose }) => {
    return (
        <>
            <EditAllowanceDialogTitle onClose={onClose} >
                <Stack alignItems={"center"} direction={"column"} gap={2}>
                    <EditIconWrapper>
                        <EditRoundedIcon />
                    </EditIconWrapper>
                    <Typography variant="h5">
                        Modify ERC20 Allowance
                    </Typography>
                </Stack>
            </EditAllowanceDialogTitle>
            <EditAllowanceDialogContent>
                <Stack gap={1}>
                    <Typography variant="body1" color="secondary">
                        You can edit the allowance of an ERC-20 token by clicking the edit button.
                    </Typography>
                    <Button
                        data-cy={"edit-ecr20-allowance-button"}
                        fullWidth
                        variant={"contained"}
                        size={"large"}
                    >
                        <Stack direction="row" alignItems="center" gap={"8px"}>
                            <Typography data-cy={"access-setting-address"} variant="h7">
                                Save Changes
                            </Typography>
                        </Stack>
                    </Button>
                </Stack>
            </EditAllowanceDialogContent>
        </>
    );
};


export const EditStreamAllowance: FC<PropsWithChildren & { onClose: () => void }> = ({ onClose }) => {
    return (
        <>
            <EditAllowanceDialogTitle onClose={onClose} >
                <Stack alignItems={"center"} direction={"column"} gap={2}>
                    <EditIconWrapper>
                        <EditRoundedIcon />
                    </EditIconWrapper>
                    <Typography variant="h5">
                        Modify Stream Allowance
                    </Typography>
                </Stack>
            </EditAllowanceDialogTitle>
            <EditAllowanceDialogContent>

                <Stack gap={1}>
                    <Button
                        data-cy={"edit-stream-allowance-button"}
                        fullWidth
                        variant={"contained"}
                        size={"large"}
                    >
                        <Stack direction="row" alignItems="center" gap={"8px"}>
                            <Typography data-cy={"access-setting-address"} variant="h7">
                                Save Changes
                            </Typography>
                        </Stack>
                    </Button>
                </Stack>
            </EditAllowanceDialogContent>
        </>
    );
};

export const EditAllowanceDialogTitle: FC<PropsWithChildren & { onClose: () => void }> = ({ children, onClose }) => {
    const theme = useTheme();

    return (
        <Stack alignItems={"center"} component={DialogTitle} sx={{ p: 4 }}>
            {children}
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    right: theme.spacing(3),
                    top: theme.spacing(3),
                }}
            >
                <CloseIcon />
            </IconButton>
        </Stack>
    );
};



export const EditAllowanceDialogContent: FC<PropsWithChildren> = ({
    children,
}) => {
    return (
        <Stack data-cy={"edit-allowance-dialog-content"} component={DialogContent} sx={{ p: 4 }}>
            {children}
        </Stack>
    );
};
