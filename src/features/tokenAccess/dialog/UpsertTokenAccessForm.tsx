import {
  Box,
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
import { useUpsertTokenAccessDialog } from "./UpsertTokenAccessDialogProvider";
import { FC, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import UnsavedChangesConfirmationDialog from "./UnsavedChangesConfirmationDialog";
import EditDialogTitle from "./DialogTitle";
import EditDialogContent from "./DialogContent";
import { FlowRateInput, UnitOfTime } from "../../send/FlowRateInput";

import NetworkSelect from "../NetworkSelect";
import TokenSelect from "../TokenSelect";
import RevokeButton from "../RevokeButton";
import SaveButton from "../SaveButton";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { formatEther } from "ethers/lib/utils.js";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { FlowOperatorPermissionSwitch } from "./FlowOperatorPermissionSwitch";
import AddressSearch from "../../send/AddressSearch";

export type TokenAccessProps = {
  flowRateAllowance: {
    amountWei: BigNumber;
    unitOfTime: UnitOfTime;
  };
  flowOperatorPermissions: number;
  tokenAllowanceWei: BigNumber;
};

export const UpsertTokenAccessForm: FC<{
  initialFormValues: UpsertTokenAccessFormProviderProps["initialFormData"];
}> = ({ initialFormValues }) => {
  const {
    control,
    formState: { isDirty, isValid, isValidating },
    watch,
    setValue,
  } = useFormContext<PartialUpsertTokenAccessForm>();

  const { closeDialog } = useUpsertTokenAccessDialog();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);

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

  const isNewEntry = useMemo(
    () => Object.keys(initialFormValues).length === 0,
    [initialFormValues]
  );

  const [tokenAllowanceEther, setTokenAllowanceEther] = useState(
    formatEther(tokenAllowanceWei ?? BigNumber.from(0)) // TODO(KK): Why do I need to use null check here?
  );

  const [flowRateAllowanceEther, setFlowRateAllowanceEther] = useState({
    amountEther: formatEther(flowRateAllowance.amountWei ?? BigNumber.from(0)), // TODO(KK): Why do I need to use null check here?
    unitOfTime: flowRateAllowance.unitOfTime,
  });

  useEffect(() => {
    setTokenAllowanceEther(formatEther(tokenAllowanceWei));
    setFlowRateAllowanceEther({
      amountEther: formatEther(flowRateAllowance.amountWei),
      unitOfTime: flowRateAllowance.unitOfTime,
    });
  }, [
    tokenAllowanceWei,
    flowRateAllowance.amountWei,
    flowRateAllowance.unitOfTime,
  ]);

  // let isAnyFieldChanged = useMemo(
  //   () =>
  //     Object.keys(formState.touchedFields.data || {}).some((key) => {
  //       const currentValue = watch(
  //         `data.${key as keyof typeof initialFormValues}`
  //       );
  //       const initialValue =
  //         initialFormValues[key as keyof typeof initialFormValues];
  //       return !isEqual(currentValue, initialValue);
  //     }),
  //   [formState, initialFormValues]
  // );

  const isAnyFieldChanged = isDirty;

  const handleOnCloseBtnClick = () => {
    if (isAnyFieldChanged && isValid) {
      setUnsavedChanges(true);
    } else {
      closeDialog();
    }
  };

  const SaveButtonComponent = (
    <SaveButton
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
      tokenAddress={token?.address}
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
              {isNewEntry ? "Add Permission" : "Modify Permission"}
            </Typography>
          </EditDialogTitle>
          <EditDialogContent>
            <Stack gap={2}>
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
                          network={value}
                          placeholder={"Select network"}
                          disabled={!isNewEntry}
                          onChange={(e) => {
                            setValue("data.token", null);
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
                          disabled={!isNewEntry}
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
                <FormLabel>Address</FormLabel>
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
                <FormLabel>ERC-20 Allowance</FormLabel>
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
              {SaveButtonComponent}
              {!isNewEntry && network && token && (
                <RevokeButton
                  network={network}
                  operatorAddress={operatorAddress}
                  tokenAddress={token.address}
                  access={{
                    flowRateAllowance: flowRateAllowance,
                    flowOperatorPermissions: flowOperatorPermissions,
                    tokenAllowanceWei: tokenAllowanceWei,
                  }}
                  onRevokeButtonClick={closeDialog}
                />
              )}
            </Stack>
          </EditDialogContent>
        </Box>
      )}
    </ConnectionBoundary>
  );
};
