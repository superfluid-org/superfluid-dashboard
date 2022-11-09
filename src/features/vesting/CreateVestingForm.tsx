import { FC, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Controller, useFormContext } from "react-hook-form";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import AddressSearch from "../send/AddressSearch";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  UnitOfTime,
  timeUnitWordMap,
  unitOfTimeList,
} from "../send/FlowRateInput";
import { transactionButtonDefaultProps } from "../transactionBoundary/TransactionButton";
import { ErrorMessage } from "@hookform/error-message";
import TooltipIcon from "../common/TooltipIcon";
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import { DeleteVestingTransactionButton } from "./DeleteVestingTransactionButton";

export enum VestingFormLabels {
  Receiver = "Receiver",
  CliffPeriod = "Cliff Period",
  CliffAmount = "Cliff Amount",
  VestingStartDate = "Vesting Start Date",
  Token = "Token",
  TotalVestingPeriod = "Total Vesting Period",
  TotalVestedAmount = "Total Vested Amount",
}

export const CreateVestingForm: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingCardView) => void;
}> = ({ token, setView }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { network } = useExpectedNetwork();

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetFormData,
  } = useFormContext<PartialVestingForm>();

  const [
    superTokenAddress,
    receiverAddress,
    totalAmountEther,
    startDate,
    cliffAmountEther,
    vestingPeriod,
    cliffPeriod,
  ] = watch([
    "data.superTokenAddress",
    "data.receiverAddress",
    "data.totalAmountEther",
    "data.startDate",
    "data.cliffAmountEther",
    "data.vestingPeriod",
    "data.cliffPeriod",
  ]);

  // console.log({
  //   tokenAddress,
  //   receiverAddress,
  //   totalAmountEther,
  //   startDate,
  //   cliffAmountEther,
  //   vestingPeriod,
  //   cliffPeriod
  // })

  const ReceiverController = (
    <Controller
      control={control}
      name="data.receiverAddress"
      render={({ field: { onChange, onBlur } }) => (
        <AddressSearch
          address={receiverAddress}
          onChange={onChange}
          onBlur={onBlur}
          addressLength={isBelowMd ? "medium" : "long"}
          ButtonProps={{ fullWidth: true }}
        />
      )}
    />
  );

  const networkCustomTokens = useNetworkCustomTokens(network.id);

  const listedSuperTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.id,
    filter: {
      isSuperToken: true,
      isListed: true,
    },
  });

  const customSuperTokensQuery = subgraphApi.useTokensQuery(
    networkCustomTokens.length > 0
      ? {
          chainId: network.id,
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
          type: getSuperTokenType({ ...x, network, address: x.id }),
          address: x.id,
          name: x.name,
          symbol: x.symbol,
          decimals: 18,
          isListed: x.isListed,
        })),
    [network, listedSuperTokensQuery.data, customSuperTokensQuery.data]
  );

  const TokenController = (
    <Controller
      control={control}
      name="data.superTokenAddress"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          token={token}
          tokenSelection={{
            showUpgrade: true,
            tokenPairsQuery: {
              data: superTokens,
              isFetching:
                listedSuperTokensQuery.isFetching ||
                customSuperTokensQuery.isFetching,
            },
          }}
          onTokenSelect={(x) => onChange(x.address)}
          onBlur={onBlur}
          ButtonProps={{ variant: "input" }}
        />
      )}
    />
  );

  const VestingAmountController = (
    <Controller
      control={control}
      name="data.totalAmountEther"
      render={({ field: { onChange, onBlur } }) => (
        <TextField
          value={totalAmountEther}
          onChange={onChange}
          onBlur={onBlur}
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {token?.symbol ?? ""}
              </Typography>
            ),
          }}
        />
      )}
    />
  );

  const StartDateController = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.startDate"
        render={({ field: { onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField fullWidth {...props} onBlur={onBlur} />
            )}
            value={startDate}
            ampm={false}
            onChange={onChange}
            disablePast
          />
        )}
      />
    </LocalizationProvider>
  );

  const CliffAmountController = (
    <Controller
      control={control}
      name="data.cliffAmountEther"
      render={({ field: { onChange, onBlur } }) => (
        <TextField
          value={cliffAmountEther}
          onChange={onChange}
          onBlur={onBlur}
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {token?.symbol ?? ""}
              </Typography>
            ),
          }}
        />
      )}
    />
  );

  const CliffPeriodController = (
    <Controller
      control={control}
      name="data.cliffPeriod"
      render={({ field: { onChange, onBlur, value } }) => (
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
          <TextField
            value={value.numerator}
            onChange={(e) => onChange({
              numerator: e.target.value,
              denominator: value.denominator,
            })}
            onBlur={onBlur}
            InputProps={{
              sx: {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            }} />
          <Select
            value={value.denominator}
            onChange={(e) => onChange({
              numerator: value.numerator,
              denominator: e.target.value,
            })}
            onBlur={onBlur}
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            {unitOfTimeList
              .filter((x) => x >= UnitOfTime.Day)
              .map((unitOfTime) => (
                <MenuItem key={unitOfTime} value={unitOfTime} onBlur={onBlur}>
                  {timeUnitWordMap[unitOfTime]}(s)
                </MenuItem>
              ))}
          </Select>
        </Box>
      )}
    />
  );

  const VestingPeriodController = (
    <Controller
      control={control}
      name="data.vestingPeriod"
      render={({ field: { onChange, onBlur, value } }) => (
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
          <TextField
            value={value.numerator}
            onChange={(e) =>
              onChange({
                numerator: e.target.value,
                denominator: value.denominator,
              })
            }
            onBlur={onBlur}
            InputProps={{
              sx: {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          />
          <Select
            value={value.denominator}
            onChange={(e) =>
              onChange({
                numerator: value.numerator,
                denominator: e.target.value,
              })
            }
            onBlur={onBlur}
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            {unitOfTimeList
              .filter((x) => x >= UnitOfTime.Day)
              .map((unitOfTime) => (
                <MenuItem key={unitOfTime} value={unitOfTime} onBlur={onBlur}>
                  {timeUnitWordMap[unitOfTime]}(s)
                </MenuItem>
              ))}
          </Select>
        </Box>
      )}
    />
  );

  const PreviewVestingScheduleButton = (
    <Button
      {...transactionButtonDefaultProps}
      disabled={!formState.isValid || formState.isValidating}
      onClick={() => setView(CreateVestingCardView.Preview)}
    >
      Preview the Vesting Schedule
    </Button>
  );

  const ValidationSummary = (
    <ErrorMessage
      name="data"
      // ErrorMessage has a bug and current solution is to pass in errors via props.
      // TODO: keep eye on this issue: https://github.com/react-hook-form/error-message/issues/91
      errors={formState.errors}
      render={({ message }) =>
        !!message && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {message}
          </Alert>
        )
      }
    />
  );

  return (
    <Stack component={"form"} gap={1}>
      {ValidationSummary}

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.Receiver}</FormLabel>
          <TooltipIcon title="Must not be an exchange address" />
        </Stack>
        {ReceiverController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.Token}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {TokenController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.VestingStartDate}</FormLabel>
          <TooltipIcon title="The date when stream scheduler tries to cancel the stream." />
        </Stack>
        {StartDateController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.CliffPeriod}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {CliffPeriodController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.CliffAmount}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {CliffAmountController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.TotalVestingPeriod}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {VestingPeriodController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{VestingFormLabels.TotalVestedAmount}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {VestingAmountController}
      </FormGroup>

      <FormGroup>{PreviewVestingScheduleButton}</FormGroup>
      <FormGroup>
        <DeleteVestingTransactionButton />
      </FormGroup>
    </Stack>
  );
};
