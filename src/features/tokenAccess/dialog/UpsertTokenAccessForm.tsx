import {
  Box,
  DialogContent,
  FormGroup,
  FormLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  colors,
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
import { TokenDialogButton } from "../../tokenWrapping/TokenDialogButton";
import { useNetworkCustomTokens } from "../../customTokens/customTokens.slice";
import { subgraphApi } from "../../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { getSuperTokenType } from "../../redux/endpoints/adHocSubgraphEndpoints";
import TooltipWithIcon from "../../common/TooltipWithIcon";

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

  const initialTokenAllowanceEther = removeTrailingZero(
    formatEther(tokenAllowanceWei)
  );
  const [tokenAllowanceEther, setTokenAllowanceEther] = useState(
    initialTokenAllowanceEther
  );

  const initialFlowRateAllowance = {
    amountEther: removeTrailingZero(formatEther(flowRateAllowance.amountWei)),
    unitOfTime: flowRateAllowance.unitOfTime,
  };
  const [flowRateAllowanceEther, setFlowRateAllowanceEther] = useState(
    initialFlowRateAllowance
  );

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
            network: initialFormValues.network || null,
            token: initialFormValues.token || null,
            operatorAddress: initialFormValues.operatorAddress || "",
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

  const networkCustomTokens = useNetworkCustomTokens(network?.id!);

  const listedSuperTokensQuery = subgraphApi.useTokensQuery({
    chainId: network?.id!,
    filter: {
      isSuperToken: true,
      isListed: true,
    },
  });

  const customSuperTokensQuery = subgraphApi.useTokensQuery(
    networkCustomTokens.length > 0
      ? {
          chainId: network?.id!,
          filter: {
            isSuperToken: true,
            isListed: false,
            id_in: networkCustomTokens,
          },
        }
      : skipToken
  );

  const superTokens = useMemo(
    () =>
      (listedSuperTokensQuery.data?.items || [])
        .concat(customSuperTokensQuery.data?.items || [])
        .map((x) => ({
          ...x,
          type: getSuperTokenType({ ...x, network: network!, address: x.id }),
          address: x.id,
          name: x.name,
          symbol: x.symbol,
          decimals: 18,
          isListed: x.isListed,
        })),
    [
      network,
      listedSuperTokensQuery.isLoading,
      listedSuperTokensQuery.data,
      customSuperTokensQuery.isLoading,
      customSuperTokensQuery.data,
    ]
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
                        <TokenDialogButton
                          token={token}
                          network={network!}
                          tokenSelection={{
                            showUpgrade: true,
                            tokenPairsQuery: {
                              data: superTokens,
                              isFetching:
                                listedSuperTokensQuery.isFetching ||
                                customSuperTokensQuery.isFetching,
                            },
                          }}
                          onTokenSelect={(x) => onChange(x)}
                          onBlur={onBlur}
                          ButtonProps={{
                            disabled: !isNewEntry || !network,
                            variant: "outlined",
                            color: "secondary",
                            size: "large",
                            sx: {
                              minWidth: "200px",
                              justifyContent: "flex-start",
                              ".MuiButton-startIcon > *:nth-of-type(1)": {
                                fontSize: "16px",
                              },
                              ".MuiButton-endIcon": { marginLeft: "auto" },
                            },
                          }}
                        />
                      )}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              <FormGroup>
                <FormLabel>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Operator
                    <TooltipWithIcon
                      title="Address that is permitted to manage your streams for a specific Super Token and network."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </FormLabel>
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
                <FormLabel>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Token Allowance
                    <TooltipWithIcon
                      title="Defined transfer allowance cap for Super Tokens."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </FormLabel>
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
                <FormLabel>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Stream Allowance
                    <TooltipWithIcon
                      title="Defined flow rate allowance cap for Super Tokens."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </FormLabel>
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
                <FormLabel>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Stream Permissions
                    <TooltipWithIcon
                      title="Actions that Operator can execute on your behalf."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </FormLabel>
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
