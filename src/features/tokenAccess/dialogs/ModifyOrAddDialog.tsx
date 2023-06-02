import { Box, FormGroup, FormLabel, Grid, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import ModifyOrAddTokenAccessFormProvider, { ModifyOrAddTokenAccessFormProviderProps, PartialModifyOrAddTokenAccessForm } from "./ModifyOrAddTokenAccessFormProvider";
import { useModifyOrAddTokenAccessBoundary } from "./ModifyOrAddTokenAccessBoundary";
import { FC, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import UnsavedChangesConfirmationDialog from "./UnsavedChangesConfirmationDialog";
import EditDialogTitle from "./EditDialogTitle";
import EditDialogContent from "./EditDialogContent";
import { FlowRateInput, UnitOfTime } from "../../send/FlowRateInput";
import { ACL_CREATE_PERMISSION_LABEL, ACL_DELETE_PERMISSION_LABEL, ACL_UPDATE_PERMISSION_LABEL } from "../../../utils/flowOperatorPermissionsToString";
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION, ACL_UPDATE_PERMISSION } from "../../redux/endpoints/flowSchedulerEndpoints";
import NetworkSelect from "../components/NetworkSelect";
import TokenSelect from "../components/TokenSelect";
import RevokeButton from "../RevokeButton";
import SaveButton from "../SaveButton";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { formatEther } from "ethers/lib/utils.js";

interface Permission {
    name: string;
    value: number;
    label: string;
}

const permissions: Permission[] = [
    { name: ACL_CREATE_PERMISSION_LABEL, value: ACL_CREATE_PERMISSION, label: ACL_CREATE_PERMISSION_LABEL },
    { name: ACL_UPDATE_PERMISSION_LABEL, value: ACL_UPDATE_PERMISSION, label: ACL_UPDATE_PERMISSION_LABEL },
    { name: ACL_DELETE_PERMISSION_LABEL, value: ACL_DELETE_PERMISSION, label: ACL_DELETE_PERMISSION_LABEL },
];

export type TokenAccessProps = {
    flowRateAllowance: {
        amountEther: BigNumber;
        unitOfTime: UnitOfTime;
    };
    flowOperatorPermissions: number;
    tokenAllowance: BigNumber;
};

const FlowPermissionSwitch: FC<{
    currentPermissions: number,
    onChange: (permission: number) => void;
    onBlur: () => void;
}> = ({ currentPermissions, onChange, onBlur }) => {

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

    const isPermissionActive = (permissionValue: number) => (currentPermissions & permissionValue) !== 0;

    const renderSwitch = (permission: Permission) => (
        <Stack key={permission.name} direction="row" alignItems="center">
            <Switch
                color="primary"
                checked={isPermissionActive(permission.value)}
                value={permission.value}
                onChange={() => onChange(currentPermissions ^ permission.value)}
                onBlur={onBlur}
            />
            <Typography variant="h6">{permission.label}</Typography>
        </Stack>
    );

    return (
        <Stack direction={isBelowMd ? "column" : "row"} justifyContent={"space-between"}>
            {permissions.map(renderSwitch)}
        </Stack>
    );
};

const ModifyOrEditForm: FC<{ onClose: () => void }> = ({ onClose }) => {
    const { control, formState, watch, setValue } = useFormContext<PartialModifyOrAddTokenAccessForm>();

    const { initialFormValues } = useModifyOrAddTokenAccessBoundary();

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

    const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);

    const [
        flowPermissions,
        flowRateAllowance,
        tokenAllowance,
        network,
        token,
        operatorAddress] = watch(["data.flowPermissions",
            "data.flowRateAllowance",
            "data.tokenAllowance",
            "data.network",
            "data.token",
            "data.operatorAddress"
        ])

        formState.touchedFields;

      

    const handleOnCloseBtnClick = () => {
        if (false) {
            setUnsavedChanges(true);
        } else {
            onClose();
        }
    };

    const isNewEntry = Object.keys(initialFormValues).length === 0;

    return hasUnsavedChanges ? (
        <UnsavedChangesConfirmationDialog onClose={onClose} onSaveChanges={() => console.log("testing")} />
    ) : (
        <Box>
            <EditDialogTitle onClose={handleOnCloseBtnClick}>
                <Typography variant="h4"> {isNewEntry ? "Add Permission" : "Modify Permission"} </Typography>
            </EditDialogTitle>
            <EditDialogContent>
                <Stack gap={2}>
                    <Grid direction={isBelowMd ? "column" : "row"} gap={isBelowMd ? 2 : 0} container justifyContent={"space-between"} >
                        <Grid >
                            <FormGroup>
                                <FormLabel>Network</FormLabel>
                                <Controller
                                    control={control}
                                    name="data.network"
                                    render={({ field: { onChange, onBlur } }) => (
                                        <NetworkSelect
                                            network={watch("data.network")}
                                            placeholder={"Select network"}
                                            onChange={(e) => {
                                                onChange(e)
                                                setValue("data.token", undefined);
                                                onBlur()
                                            }}
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
                                            network={watch("data.network")}
                                            token={watch("data.token")}
                                            placeholder={"Select token"}
                                            onChange={(e) => {
                                                onChange(e)
                                                onBlur()
                                            }}
                                        />
                                    )}
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <FormGroup>
                        <FormLabel>Address</FormLabel>
                        <Controller
                            control={control}
                            name="data.operatorAddress"
                            render={({ field: { onChange, onBlur } }) => (
                                <TextField
                                    value={watch("data.operatorAddress")}
                                    placeholder={"Enter the address you want to grant permission to"}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>ERC-20 Allowance</FormLabel>
                        <Controller
                            control={control}
                            name="data.tokenAllowance"
                            render={({ field }) => (
                                <TextField sx={{ marginTop: "1px" }}
                                    {...field}
                                    value={formatEther(watch("data.tokenAllowance"))}
                                    onChange={(event) => {
                                        const newValue = event.target.value;
                                        if (!newValue) {
                                            setValue("data.tokenAllowance", parseEtherOrZero(newValue));
                                        }
                                    }}
                                />
                            )}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Stream Allowance</FormLabel>
                        <Controller
                            control={control}
                            name="data.flowRateAllowance"
                            render={({ field: { value, onBlur } }) => (
                                <FlowRateInput
                                    flowRateEther={{
                                        amountEther: formatEther(
                                            value.amountEther
                                        ),
                                        unitOfTime: value.unitOfTime
                                    }}
                                    onChange={(value) => {
                                        const newValue = value.amountEther;
                                        if (!newValue) {
                                            setValue("data.flowRateAllowance", {
                                                amountEther: parseEtherOrZero(newValue),
                                                unitOfTime: value.unitOfTime
                                            });
                                        }
                                    }}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Stream Permissions</FormLabel>
                        <Controller
                            control={control}
                            name="data.flowPermissions"
                            render={({ field }) => (
                                <FlowPermissionSwitch
                                    currentPermissions={watch("data.flowPermissions")}
                                    {...field}
                                />
                            )}
                        />
                    </FormGroup>
                    <SaveButton
                        initialAccess={{
                            flowRateAllowance: initialFormValues.flowRateAllowance || {
                                amountEther: BigNumber.from(0),
                                unitOfTime: UnitOfTime.Second,
                            },
                            flowOperatorPermissions: initialFormValues.flowPermissions || 0,
                            tokenAllowance: initialFormValues.tokenAllowance || BigNumber.from(0),
                        }}
                        editedAccess={{
                            flowRateAllowance: flowRateAllowance,
                            flowOperatorPermissions: flowPermissions,
                            tokenAllowance: tokenAllowance,
                        }}
                        network={network}
                        operatorAddress={operatorAddress}
                        tokenAddress={token?.address}
                        disabled={!formState.isValid || formState.isValidating}
                        title={isNewEntry ? "Add" : "Save changes"}
                    />
                    {!isNewEntry && network !== undefined && token !== undefined && <RevokeButton
                        network={network}
                        operatorAddress={operatorAddress}
                        tokenAddress={token.address}
                        access={{
                            flowRateAllowance: flowRateAllowance,
                            flowOperatorPermissions: flowPermissions,
                            tokenAllowance: tokenAllowance,
                        }} />}
                </Stack>
            </EditDialogContent>
        </Box>
    );
};



const ModifyOrAddDialog: FC<{ initialFormValues: ModifyOrAddTokenAccessFormProviderProps["initialFormValues"] }> = ({ initialFormValues }) => {
    const { closeDialog } = useModifyOrAddTokenAccessBoundary()
    return (
        <Stack component={"form"}>
            <ModifyOrAddTokenAccessFormProvider initialFormValues={initialFormValues}>
                <ModifyOrEditForm onClose={closeDialog} />
            </ModifyOrAddTokenAccessFormProvider>
        </Stack>
    );
};

export default ModifyOrAddDialog;
