import {
  Box,
  DialogContent,
  FormGroup,
  FormLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  UpsertTokenAccessFormProviderProps,
  PartialUpsertTokenAccessForm,
} from "./UpsertTokenAccessFormProvider";
import { FC, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import UnsavedChangesConfirmationDialog from "./UnsavedChangesConfirmationDialog";
import EditDialogTitle from "./DialogTitle";
import { FlowRateInput, UnitOfTime } from "../../send/FlowRateInput";

import TokenSelect from "../TokenSelect";
import RevokeButton from "../RevokeButton";
import SaveButton from "../SaveButton";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { formatEther } from "ethers/lib/utils.js";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { FlowOperatorPermissionSwitch } from "./FlowOperatorPermissionSwitch";
import AddressSearch from "../../send/AddressSearch";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";
import SelectNetwork from "../../network/SelectNetwork";

export type TokenAccessProps = {
  flowRateAllowance: {
    amountWei: BigNumber;
    unitOfTime: UnitOfTime;
  };
  flowOperatorPermissions: number;
  tokenAllowanceWei: BigNumber;
};

export const UpsertTokenAccessForm: FC<{
  closeDialog: () => void;
  initialFormValues: UpsertTokenAccessFormProviderProps["initialFormData"];
}> = ({ initialFormValues, closeDialog }) => {
  const {
    control,
    formState: { isDirty, isValid, isValidating },
    watch,
    setValue,
    reset,
  } = useFormContext<PartialUpsertTokenAccessForm>();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [
    flowOperatorPermissions,
    flowRateAllowance,
    tokenAllowanceWei,
    network,
    token,
    operatorAddress,
  ] = watch([
    "data.flowOperatorPermissions",
    "data.flowRateAllowance",
    "data.tokenAllowanceWei",
    "data.network",
    "data.token",
    "data.operatorAddress",
  ]);

  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const isNewEntry = useMemo(
    () => Object.keys(initialFormValues).length <= 1, // Allow network to be passed in.
    [initialFormValues]
  );

  const initialTokenAllowanceEther = removeTrailingZero(formatEther(tokenAllowanceWei));
  const [tokenAllowanceEther, setTokenAllowanceEther] = useState(initialTokenAllowanceEther);
  
  const initialFlowRateAllowance = {
    amountEther: removeTrailingZero(formatEther(flowRateAllowance.amountWei)),
    unitOfTime: flowRateAllowance.unitOfTime,
  };
  const [flowRateAllowanceEther, setFlowRateAllowanceEther] = useState(initialFlowRateAllowance);
  
  useEffect(() => {
    setTokenAllowanceEther(initialTokenAllowanceEther);
    setFlowRateAllowanceEther(initialFlowRateAllowance);
  }, [
    tokenAllowanceWei,
    flowRateAllowance.amountWei,
    flowRateAllowance.unitOfTime,
  ]);

  let isAnyFieldChanged = isDirty;

  const handleOnCloseBtnClick = () => {
    if (isAnyFieldChanged && isValid) {
      setUnsavedChanges(true);
    } else {
      closeDialog();
    }
  };

  useEffect(() => {
    if (isNewEntry) {
      return;
    }

    setUnsavedChanges(false);
    reset({
      data: {
        network: initialFormValues.network,
        token: initialFormValues.token,
        operatorAddress: initialFormValues.operatorAddress,
        flowRateAllowance: initialFormValues.flowRateAllowance,
        flowOperatorPermissions: initialFormValues.flowOperatorPermissions,
        tokenAllowanceWei: initialFormValues.tokenAllowanceWei,
      },
    });
  }, [initialFormValues]);

  const onSuccessCallback = () => {
    isNewEntry
      ? reset({
          data: {
            network: initialFormValues.network || undefined,
            token: initialFormValues.token || undefined,
            operatorAddress: initialFormValues.operatorAddress || undefined,
            flowRateAllowance: initialFormValues.flowRateAllowance || {
              amountWei: BigNumber.from(0),
              unitOfTime: UnitOfTime.Second,
            },
            flowOperatorPermissions:
              initialFormValues.flowOperatorPermissions || 0,
            tokenAllowanceWei:
              initialFormValues.tokenAllowanceWei || BigNumber.from(0),
          },
        })
      : () => {};
  };

  const SaveButtonComponent = (
    <SaveButton
      onSuccessCallback={() => onSuccessCallback()}
      initialAccess={{
        flowRateAllowance: initialFormValues.flowRateAllowance || {
          amountWei: BigNumber.from(0),
          unitOfTime: UnitOfTime.Second,
        },
        flowOperatorPermissions: initialFormValues.flowOperatorPermissions || 0,
        tokenAllowanceWei:
          initialFormValues.tokenAllowanceWei || BigNumber.from(0),
      }}
      editedAccess={{
        flowRateAllowance: flowRateAllowance,
        flowOperatorPermissions: flowOperatorPermissions,
        tokenAllowanceWei: tokenAllowanceWei,
      }}
      network={network}
      operatorAddress={operatorAddress}
      superToken={token}
      disabled={!isValid || isValidating || !isAnyFieldChanged}
      title={isNewEntry ? "Add" : "Save changes"}
    />
  );

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {hasUnsavedChanges ? (
        <UnsavedChangesConfirmationDialog
          onClose={closeDialog}
          SaveButtonComponent={SaveButtonComponent}
        />
      ) : (
        <Box>
          <EditDialogTitle onClose={handleOnCloseBtnClick}>
            <Typography variant="h4">
              {isNewEntry ? "Add Permissions" : "Modify Permissions"}
            </Typography>
          </EditDialogTitle>
          <Stack component={DialogContent} sx={{ p: 4 }}>
            <Stack gap={2}>
              <Grid
                direction={isBelowMd ? "column" : "row"}
                gap={isBelowMd ? 2 : 0}
                container
                justifyContent={"space-between"}
              >
                <Grid>
                  <FormGroup
                    sx={{
                      ".MuiButtonBase-root": { minWidth: "200px" },
                    }}
                  >
                    <FormLabel>Network</FormLabel>
                    <Controller
                      control={control}
                      name="data.network"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <SelectNetwork
                          isIconButton={false}
                          isCollapsable={true}
                          disabled={!isNewEntry}
                          network={value}
                          placeholder={"Select network"}
                          onChange={(e) => {
                            setValue("data.token", undefined);
                            onChange(e);
                          }}
                          onBlur={onBlur}
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
                          disabled={!isNewEntry || !network}
                          network={network}
                          token={token}
                          placeholder={"Select token"}
                          onChange={onChange}
                          onBlur={onBlur}
                        />
                      )}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              <FormGroup>
                <FormLabel>Operator</FormLabel>
                <Controller
                  control={control}
                  name="data.operatorAddress"
                  render={({ field: { onChange, onBlur } }) => (
                    <AddressSearch
                      address={operatorAddress}
                      onChange={onChange}
                      onBlur={onBlur}
                      addressLength={isBelowMd ? "medium" : "long"}
                      ButtonProps={{
                        fullWidth: true,
                        disabled: !isNewEntry,
                        ...(!isNewEntry && { endIcon: undefined }),
                      }}
                      AddressSearchDialogProps={{
                        title: "Select the operator address",
                      }}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Token Allowance</FormLabel>
                <Controller
                  control={control}
                  name="data.tokenAllowanceWei"
                  render={({ field: { onChange, onBlur } }) => (
                    <TextField
                      sx={{ marginTop: "1px" }}
                      value={tokenAllowanceEther}
                      onChange={(event) => {
                        const newValue = event.target.value;
                        setTokenAllowanceEther(newValue);
                      }}
                      onBlur={() => {
                        onChange(parseEtherOrZero(tokenAllowanceEther));
                        onBlur();
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
                  render={({ field: { onChange, onBlur } }) => (
                    <FlowRateInput
                      flowRateEther={flowRateAllowanceEther}
                      onChange={setFlowRateAllowanceEther}
                      onBlur={() => {
                        onChange({
                          amountWei: parseEtherOrZero(
                            flowRateAllowanceEther.amountEther
                          ),
                          unitOfTime: flowRateAllowanceEther.unitOfTime,
                        });
                        onBlur();
                      }}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Stream Permissions</FormLabel>
                <Controller
                  control={control}
                  name="data.flowOperatorPermissions"
                  render={({ field: { value, onBlur, onChange } }) => (
                    <FlowOperatorPermissionSwitch
                      currentPermissions={value}
                      onBlur={onBlur}
                      onChange={onChange}
                    />
                  )}
                />
              </FormGroup>
              <ConnectionBoundaryButton
                impersonationTitle={"Stop viewing"}
                changeNetworkTitle={"Change Network"}
                ButtonProps={{
                  size: "large",
                  fullWidth: true,
                  variant: "outlined",
                }}
              >
                {SaveButtonComponent}
                {!isNewEntry && network && token && (
                  <RevokeButton
                    network={network}
                    operatorAddress={operatorAddress}
                    superToken={token}
                    access={{
                      flowRateAllowance:
                        initialFormValues.flowRateAllowance || {
                          amountWei: BigNumber.from(0),
                          unitOfTime: UnitOfTime.Second,
                        },
                      flowOperatorPermissions:
                        initialFormValues.flowOperatorPermissions || 0,
                      tokenAllowanceWei:
                        initialFormValues.tokenAllowanceWei ||
                        BigNumber.from(0),
                    }}
                  />
                )}
              </ConnectionBoundaryButton>
            </Stack>
          </Stack>
        </Box>
      )}
    </ConnectionBoundary>
  );
};

function removeTrailingZero(str: string): string {
  return str.replace(/\.0$/, "");
}
