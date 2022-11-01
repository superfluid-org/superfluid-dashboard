import {
  Alert,
  Box,
  Button,
  Card,
  FormGroup,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TooltipIcon from "../common/TooltipIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import AddressSearch from "../send/AddressSearch";
import { timeUnitWordMap, unitOfTimeList } from "../send/FlowRateInput";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  transactionButtonDefaultProps,
} from "../transactionBoundary/TransactionButton";
import { PartialVestingForm, ValidVestingForm } from "./VestingFormProvider";
import { ErrorMessage } from "@hookform/error-message";
import { dateNowSeconds } from "../../utils/dateUtils";
import format from "date-fns/fp/format";
import add from "date-fns/fp/add";

type VestingToken = Token & SuperTokenMinimal;

enum CreateVestingView {
  Form,
  Preview,
}

export const CreateVestingScheduleCard: FC<PropsWithChildren> = () => {
  const { watch } = useFormContext<PartialVestingForm>();
  const [tokenAddress] = watch(["data.tokenAddress"]);

  const { network } = useExpectedNetwork();
  const { token } = subgraphApi.useTokenQuery(
    tokenAddress
      ? {
          chainId: network.id,
          id: tokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        token: result.currentData
          ? ({
              ...result.currentData,
              address: result.currentData.id,
              type: getSuperTokenType({
                network,
                address: result.currentData.id,
                underlyingAddress: result.currentData.underlyingAddress,
              }),
            } as VestingToken)
          : undefined,
      }),
    }
  );

  const [view, setView] = useState<CreateVestingView>(CreateVestingView.Form);

  return (
    <Card>
      {view === CreateVestingView.Form && (
        <VestingForm token={token} setView={setView} />
      )}
      {view === CreateVestingView.Preview && (
        <VestingPreview token={token} setView={setView} />
      )}
    </Card>
  );
};

const VestingForm: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingView) => void;
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
    tokenAddress,
    receiverAddress,
    totalAmountEther,
    startDate,
    cliffAmountEther,
    vestingPeriod,
    cliffPeriod,
  ] = watch([
    "data.tokenAddress",
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
      name="data.tokenAddress"
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
            disablePast={true}
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
            onChange={(e) =>
              onChange({
                numerator: e.target.value,
                denominator: value.denominator,
              })
            }
            onBlur={onBlur}
            InputProps={{
              sx: {
                "border-top-right-radius": 0,
                "border-bottom-right-radius": 0,
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
              "border-top-left-radius": 0,
              "border-bottom-left-radius": 0,
            }}
          >
            {unitOfTimeList.map((unitOfTime) => (
              <MenuItem key={unitOfTime} value={unitOfTime} onBlur={onBlur}>
                {timeUnitWordMap[unitOfTime]}
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
                "border-top-right-radius": 0,
                "border-bottom-right-radius": 0,
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
              "border-top-left-radius": 0,
              "border-bottom-left-radius": 0,
            }}
          >
            {unitOfTimeList.map((unitOfTime) => (
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
      onClick={() => setView(CreateVestingView.Preview)}
    >
      Preview Vesting Schedule
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
      <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
        Create Vesting Schedule
      </Typography>

      {ValidationSummary}

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{Labels.Receiver}</FormLabel>
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
          <FormLabel>{Labels.Token}</FormLabel>
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
          <FormLabel>{Labels.TotalVestingPeriod}</FormLabel>
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
          <FormLabel>{Labels.TotalVestedAmount}</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {VestingAmountController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>{Labels.CliffPeriod}</FormLabel>
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
          <FormLabel>{Labels.CliffAmount}</FormLabel>
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
          <FormLabel>{Labels.VestingStartDate}</FormLabel>
          <TooltipIcon title="The date when stream scheduler tries to cancel the stream." />
        </Stack>
        {StartDateController}
      </FormGroup>

      <FormGroup>{PreviewVestingScheduleButton}</FormGroup>
    </Stack>
  );
};

const VestingPreview: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingView) => void;
}> = ({ token, setView }) => {
  const { watch } = useFormContext<ValidVestingForm>();

  const [
    tokenAddress,
    receiverAddress,
    totalAmountEther,
    startDate,
    cliffAmountEther,
    vestingPeriod,
    cliffPeriod,
  ] = watch([
    "data.tokenAddress",
    "data.receiverAddress",
    "data.totalAmountEther",
    "data.startDate",
    "data.cliffAmountEther",
    "data.vestingPeriod",
    "data.cliffPeriod",
  ]);

  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

  const BackButton = (
    <Box>
      <IconButton
        data-cy={"back-button"}
        color="inherit"
        onClick={() => setView(CreateVestingView.Form)}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  const SubmitButton = (
    <TransactionBoundary mutationResult={createVestingScheduleResult}>
      {() => (
        <TransactionButton onClick={async (signer) => {}}>
          Create Vesting Schedule
        </TransactionButton>
      )}
    </TransactionBoundary>
  );

  const cliffDate = add(
    {
      seconds: cliffPeriod.numerator * cliffPeriod.denominator,
    },
    startDate
  );

  const endDate = add(
    {
      seconds: vestingPeriod.numerator * vestingPeriod.denominator,
    },
    startDate
  );

  return (
    <Stack gap={1}>
      {BackButton}
      <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
        Preview Vesting Schedule
      </Typography>

      <Stack>
        <Typography color="text.secondary">{Labels.Receiver}</Typography>
        <Typography color="text.primary">{receiverAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">{Labels.Token}</Typography>
        <Typography color="text.primary">{tokenAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {Labels.TotalVestedAmount}
        </Typography>
        <Typography color="text.primary">
          {totalAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {Labels.VestingStartDate}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", startDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">{Labels.CliffPeriod}</Typography>
        <Typography color="text.primary">
          {cliffPeriod.numerator} {timeUnitWordMap[cliffPeriod.denominator]}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", cliffDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">{Labels.CliffAmount}</Typography>
        <Typography color="text.primary">
          {cliffAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {Labels.TotalVestingPeriod}
        </Typography>
        <Typography color="text.primary">
          {vestingPeriod.numerator} {timeUnitWordMap[vestingPeriod.denominator]}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", endDate)}
        </Typography>
      </Stack>

      <ConnectionBoundary>{SubmitButton}</ConnectionBoundary>
    </Stack>
  );
};

enum Labels {
  Receiver = "Receiver",
  CliffPeriod = "Cliff Period",
  CliffAmount = "Cliff Amount",
  VestingStartDate = "Vesting Start Date",
  Token = "Token",
  TotalVestingPeriod = "Total Vesting Period",
  TotalVestedAmount = "Total Vested Amount",
}
