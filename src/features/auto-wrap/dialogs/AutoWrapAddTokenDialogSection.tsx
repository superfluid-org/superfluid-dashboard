import { FC, memo } from "react";
import ResponsiveDialog from "../../common/ResponsiveDialog";
import {
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Stack,
    Typography,
    useTheme,
    useMediaQuery,
    FormGroup,
    FormLabel, Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddTokenWrapFormProvider, { PartialAddTokenWrapForm } from "./AddTokenWrapFormProvider";
import { Controller, useFormContext } from "react-hook-form";
import NetworkSelect from "./NetworkSelect";
import TokenSelect from "./TokenSelect";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { Network } from "../../network/networks";
import AutoWrapEnableDialogContentSection from "../../vesting/dialogs/AutoWrapEnableDialogContentSection";


const AutoWrapAddTokenForm: FC<{ closeEnableAutoWrapDialog: () => void }> = ({
    closeEnableAutoWrapDialog,
}) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    const { control, watch, setValue, trigger, reset } = useFormContext<PartialAddTokenWrapForm>();

    const [
        network,
        token,
    ] = watch([
        "data.network",
        "data.token",
    ]);

    return <> <Stack component={DialogTitle} sx={{ p: 3 }}>
        <Typography variant="h4">Add Token</Typography>
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
        <Stack gap={3} component={DialogContent}>
            <Grid
                direction={isBelowMd ? "column" : "row"}
                gap={isBelowMd ? 2 : 0}
                container
                justifyContent={"space-between"}
            >
                <Grid>
                    <FormGroup>
                        <FormLabel>Network</FormLabel>
                        <Controller
                            control={control}
                            name="data.network"
                            render={({ field: { value, onChange, onBlur } }) => (
                                <NetworkSelect
                                    disabled={false}
                                    network={value}
                                    placeholder={"Select network"}
                                    onChange={(e) => {
                                        onChange(e);
                                        setValue("data.token", undefined);
                                        onBlur();
                                        trigger();
                                    }}
                                    predicate={(network: Network) => !!network.autoWrap}
                                />
                            )}
                        />
                    </FormGroup>
                </Grid>
                <Grid gap={2}>
                    <FormGroup>
                        <FormLabel>Token</FormLabel>
                        <Controller
                            control={control}
                            name="data.token"
                            render={({ field: { onChange, onBlur } }) => (
                                <TokenSelect
                                    disabled={false}
                                    network={watch("data.network")}
                                    token={token}
                                    placeholder={"Select token"}
                                    onChange={(e) => {
                                        onChange(e);
                                        onBlur();
                                        trigger();
                                    }}
                                    filterArgs={{
                                        underlyingAddress_not: null,
                                    }}
                                />
                            )}
                        />
                    </FormGroup>
                </Grid>
            </Grid>
            {token && network ?
                <ConnectionBoundary expectedNetwork={network}>
                    <AutoWrapEnableDialogContentSection
                        closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
                        token={token}
                        network={network}
                    /></ConnectionBoundary> 
                    : <Button fullWidth={true}
                        data-cy={"enable-auto-wrap-button"}
                        variant="contained"
                        disabled={true}
                        size="large">Add</Button>
            }
        </Stack></>
}

const AutoWrapAddTokenDialogSection: FC<{ closeEnableAutoWrapDialog: () => void, isEnableAutoWrapDialogOpen: boolean }> = (
    { closeEnableAutoWrapDialog, isEnableAutoWrapDialogOpen }) => {

    return <ResponsiveDialog
        data-cy={"auto-wrap-add-token-dialog-section"}
        open={isEnableAutoWrapDialogOpen}
        onClose={closeEnableAutoWrapDialog}
        PaperProps={{ sx: { borderRadius: "20px", maxWidth: 479 } }}
        keepMounted={true}
    >
        <AddTokenWrapFormProvider initialFormValues={{}}>
            <AutoWrapAddTokenForm closeEnableAutoWrapDialog={closeEnableAutoWrapDialog} />
        </AddTokenWrapFormProvider>
    </ResponsiveDialog>
};

export default memo(AutoWrapAddTokenDialogSection);
