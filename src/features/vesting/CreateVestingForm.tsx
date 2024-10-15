import { ErrorMessage } from "@hookform/error-message";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { add } from "date-fns";
import { FC, memo, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { inputPropsForEtherAmount } from "../../utils/inputPropsForEtherAmount";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import AddressSearch from "../send/AddressSearch";
import {
  timeUnitWordMap,
  UnitOfTime,
  unitOfTimeList,
} from "../send/FlowRateInput";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { transactionButtonDefaultProps } from "../transactionBoundary/TransactionButton";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingCardView } from "./CreateVestingSection";
import useActiveAutoWrap from "./useActiveAutoWrap";
import { SuperTokenMinimal, TokenType } from "../redux/endpoints/tokenTypes";
import { useVestingVersion } from "../../hooks/useVestingVersion";
import { useSuperTokens } from "../../hooks/useSuperTokens";
import { Network } from "../network/networks";

export enum VestingFormLabels {
  Receiver = "Receiver",
  Network = "Network",
  CliffPeriod = "Cliff Period",
  CliffAmount = "Cliff Amount",
  VestingStartDate = "Vesting Start Date",
  SuperToken = "Super Token",
  TotalVestingPeriod = "Total Vesting Period",
  TotalVestedAmount = "Total Vested Amount",
  Claim = "Require Receiver to Claim",
  AutoWrap = "Enable Auto-Wrap",
}

export enum VestingTooltips {
  AutoWrap = "Auto-Wrap wraps your regular ERC-20 tokens to Super Tokens automatically, making it easy to send your streams without the need for manual token wrapping. All your current and future streams will have Auto-Wrap enabled for the selected token and network.",
  Claim = "Recipients will need to actively claim the vesting schedule with an on-chain transaction to receive the funds. This mitigate funds loss in case they can’t access their wallet."
}

const CreateVestingForm = memo(function CreateVestingForm(props: {
  token: SuperTokenMinimal | null | undefined;
  setView: (value: CreateVestingCardView) => void;
}) {
  const { token, setView } = props;
  const { network } = useExpectedNetwork();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { watch } = useFormContext<PartialVestingForm>();
  const [ cliffEnabled, setupAutoWrap ] = watch(["data.cliffEnabled", "data.setupAutoWrap"]);

  const { vestingVersion } = useVestingVersion();
  const isClaimFeatureEnabled = vestingVersion === "v2";

  const { visibleAddress } = useVisibleAddress();

  const queryAutoWrap =
    network.autoWrap &&
    visibleAddress &&
    token &&
    getSuperTokenType({
      network,
      address: token.address,
      underlyingAddress: token.underlyingAddress,
    }) === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    queryAutoWrap
      ? {
        chainId: network.id,
        accountAddress: visibleAddress,
        superTokenAddress: token.address,
        underlyingTokenAddress: token.underlyingAddress!, // TODO: Do it without the bang?
      }
      : "skip"
  );

  const isAutoWrapInputVisible =
    queryAutoWrap &&
    !isAutoWrapLoading &&
    !activeAutoWrapSchedule &&
    !isAutoWrapAllowanceSufficient;

  return (
    <Stack component={"form"} gap={4}>
      <Stack gap={2.5}>
        <ValidationSummary />
        <FormGroup>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel>{VestingFormLabels.Receiver}</FormLabel>
            <TooltipWithIcon title="Must not be an exchange address" />
          </Stack>
          <ReceiverController isBelowMd={isBelowMd} />
        </FormGroup>

        {
          isClaimFeatureEnabled && (
            <Stack data-cy="claim-switch-and-tooltip" direction="row" alignItems="center">
              <ClaimController />
              <TooltipWithIcon title={VestingTooltips.Claim} />
            </Stack>
          )
        }

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isBelowMd ? "1fr" : "1fr 1fr",
            gap: 2.5,
          }}
        >
          <FormGroup>
            <FormLabel>{VestingFormLabels.SuperToken}</FormLabel>
            <TokenController token={token} network={network} />
          </FormGroup>
          <FormGroup>
            <FormLabel>{VestingFormLabels.VestingStartDate}</FormLabel>
            <StartDateController />
          </FormGroup>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isBelowMd ? "1fr" : "1fr 1fr",
            gap: 2.5,
          }}
        >
          <FormGroup>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>{VestingFormLabels.TotalVestedAmount}</FormLabel>
              <TooltipWithIcon title="Set the total amount to be vested" />
            </Stack>
            <VestingAmountController token={token} />
          </FormGroup>

          <FormGroup>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>{VestingFormLabels.TotalVestingPeriod}</FormLabel>
              <TooltipWithIcon title="Set the total length of time for vesting" />
            </Stack>
            <VestingPeriodController network={network} />
          </FormGroup>
        </Box>

        <Stack direction="row" alignItems="center">
          <CliffEnabledController />
          <TooltipWithIcon title="Set the cliff date and amount to be granted." />
        </Stack>

        {cliffEnabled && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isBelowMd ? "1fr" : "1fr 1fr",
              gap: 2,
            }}
          >
            <FormGroup>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <FormLabel>{VestingFormLabels.CliffAmount}</FormLabel>
                <TooltipWithIcon title="Set the amount to be vested at the cliff" />
              </Stack>
              <CliffAmountController token={token} />
            </FormGroup>

            <FormGroup>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <FormLabel>{VestingFormLabels.CliffPeriod}</FormLabel>
                <TooltipWithIcon title="Set the time until the cliff from the start date" />
              </Stack>
              <CliffPeriodController network={network} />
            </FormGroup>
          </Box>
        )}

        {isAutoWrapInputVisible && (
          <Stack data-cy="auto-wrap-switch-and-tooltip" direction="row" alignItems="center">
            <AutoWrapController />
            <TooltipWithIcon title={VestingTooltips.AutoWrap} />
          </Stack>
        )}

        {!(setupAutoWrap && !cliffEnabled) && (
          <Alert severity="warning">
            {cliffEnabled ? (
              setupAutoWrap ? (
                <>
                  <AlertTitle data-cy={"top-up-alert-title"}>
                    Don’t forget to top up for the cliff!
                  </AlertTitle>
                  <Typography data-cy={"top-up-alert-text"}>
                    The auto-wrap will not take account of the vesting cliff.
                    Remember to top up your Super Token balance for the cliff
                    amount and the first week of a vesting stream.
                  </Typography>
                </>
              ) : (
                <>
                  <AlertTitle data-cy={"top-up-alert-title"}>
                    Don’t forget to top up for the vesting schedule!
                  </AlertTitle>
                  <Typography data-cy={"top-up-alert-text"}>
                    Remember to top up your Super Token balance in time for the
                    cliff amount and vesting stream.
                  </Typography>
                </>
              )
            ) : (
              <>
                <AlertTitle data-cy={"top-up-alert-title"}>
                  Don’t forget to top up for the vesting schedule!
                </AlertTitle>
                <Typography data-cy={"top-up-alert-text"}>
                  Remember to top up your Super Token balance in time for the
                  vesting stream.
                </Typography>
              </>
            )}
          </Alert>
        )}
      </Stack>

      <Stack gap={1}>
        <PreviewVestingScheduleButton setView={setView} />
      </Stack>
    </Stack>
  );
});

export default CreateVestingForm;

// # Sub-components
const ReceiverController = memo(function ReceiverController(props: {
  isBelowMd: boolean
}) {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.receiverAddress"
      render={({ field: { value, onChange, onBlur } }) => (
        <AddressSearch
          address={value}
          onChange={onChange}
          onBlur={onBlur}
          addressLength={props.isBelowMd ? "medium" : "long"}
          ButtonProps={{ fullWidth: true }} />
      )} />
  );
})

const TokenController = memo(function TokenController(props: {
  token: SuperTokenMinimal | null | undefined,
  network: Network,
}) {
  const { control } = useFormContext<PartialVestingForm>();
  const { superTokens, isFetching } = useSuperTokens({ network: props.network });

  return (
    <Controller
      control={control}
      name="data.superTokenAddress"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          token={props.token}
          network={props.network}
          tokens={superTokens}
          isTokensFetching={isFetching}
          showUpgrade={true}
          onTokenSelect={(x) => onChange(x.address)}
          onBlur={onBlur}
          ButtonProps={{ variant: "input" }} />
      )} />
  );
});

const VestingAmountController = memo(function VestingAmountController(props: {
  token: SuperTokenMinimal | null | undefined,
}) {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.totalAmountEther"
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          data-cy={"total-amount-input"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {props.token?.symbol ?? ""}
              </Typography>
            ),
          }}
        />
      )}
    />
  );
});

const StartDateController = memo(function StartDateController() {
  const { control } = useFormContext<PartialVestingForm>();

  const minVestingStartDate = useMemo(
    () =>
      add(new Date(), {
        minutes: 15,
      }),
    []
  );

  const maxVestingStartDate = useMemo(
    () =>
      add(new Date(), {
        years: 1,
      }),
    []
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.startDate"
        render={({ field: { value, onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                data-cy={"date-input"}
                fullWidth
                {...props}
                onBlur={onBlur} />
            )}
            value={value}
            ampm={false}
            onChange={onChange}
            disablePast
            minDateTime={minVestingStartDate}
            maxDateTime={maxVestingStartDate} />
        )} />
    </LocalizationProvider>
  );
});

const CliffAmountController = memo(function CliffAmountController(props: {
  token: SuperTokenMinimal | null | undefined,
}) {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.cliffAmountEther"
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          data-cy={"cliff-amount-input"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {props.token?.symbol ?? ""}
              </Typography>
            ),
          }}
          inputProps={{
            ...inputPropsForEtherAmount,
          }} />
      )} />
  );
});

const CliffPeriodController = memo(function CliffPeriodController(props: {
  network: Network,
}) {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.cliffPeriod"
      render={({ field: { value, onChange, onBlur } }) => (
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
          <TextField
            data-cy={"cliff-period-input"}
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
            }}
            type="number"
            inputMode="numeric" />
          <Select
            data-cy={"cliff-period-unit"}
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
              .filter(
                (x) => x >= (props.network.testnet ? UnitOfTime.Minute : UnitOfTime.Day) &&
                  x <= UnitOfTime.Year
              )
              .map((unitOfTime) => (
                <MenuItem key={unitOfTime} value={unitOfTime} onBlur={onBlur}>
                  {timeUnitWordMap[unitOfTime]}(s)
                </MenuItem>
              ))}
          </Select>
        </Box>
      )} />
  );
});

const VestingPeriodController = memo(function VestingPeriodController(props: {
  network: Network,
}) {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.vestingPeriod"
      render={({ field: { value, onChange, onBlur } }) => {
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              alignItems: "stretch",
            }}
          >
            <TextField
              data-cy={"total-period-input"}
              value={value.numerator}
              onChange={(e) => {
                onChange({
                  numerator: e.target.value,
                  denominator: value.denominator,
                });
              }}
              onBlur={onBlur}
              InputProps={{
                sx: {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
              type="number"
              inputMode="numeric" />
            <Select
              data-cy={"total-period-unit"}
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
                .filter(
                  (x) => x >=
                    (props.network.testnet ? UnitOfTime.Minute : UnitOfTime.Day) &&
                    x <= UnitOfTime.Year
                )
                .map((unitOfTime) => (
                  <MenuItem key={unitOfTime} value={unitOfTime} onBlur={onBlur}>
                    {timeUnitWordMap[unitOfTime]}(s)
                  </MenuItem>
                ))}
            </Select>
          </Box>
        );
      }} />
  );
});

const CliffEnabledController = memo(function CliffEnabledController() {
  const { control, setValue, watch } = useFormContext<PartialVestingForm>();
  const vestingPeriod = watch("data.vestingPeriod");

  return (
    <Controller
      control={control}
      name="data.cliffEnabled"
      render={({ field: { value, onChange, onBlur } }) => {
        return (
          <FormControlLabel
            data-cy={"cliff-toggle"}
            control={<Switch
              checked={!!value}
              onChange={(_event, checked) => {
                onChange(checked);
                if (!checked) {
                  setValue("data.cliffAmountEther", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue(
                    "data.cliffPeriod",
                    {
                      numerator: "",
                      denominator: vestingPeriod.denominator,
                    },
                    { shouldDirty: true, shouldValidate: true }
                  );
                }
              }}
              onBlur={onBlur} />}
            label="Add Cliff" />
        );
      }} />
  );
});

const ClaimController = memo(function ClaimController() {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.claimEnabled"
      render={({ field: { value, onChange, onBlur } }) => (
        <FormControlLabel
          data-cy={"claim-toggle"}
          control={
            <Switch
              checked={value}
              onChange={(_event, checked) => {
                onChange(checked);
              }}
              onBlur={onBlur}
            />
          }
          label={VestingFormLabels.Claim}
        />
      )}
    />
  );
});

const AutoWrapController = memo(function AutoWrapController() {
  const { control } = useFormContext<PartialVestingForm>();

  return (
    <Controller
      control={control}
      name="data.setupAutoWrap"
      render={({ field: { value, onChange, onBlur } }) => (
        <FormControlLabel
          data-cy="auto-wrap-switch"
          label={VestingFormLabels.AutoWrap}
          control={
            <Switch checked={!!value} onChange={onChange} onBlur={onBlur} />
          }
        />
      )}
    />
  );
});

const PreviewVestingScheduleButton = memo(function PreviewVestingScheduleButton(props: {
  setView: (value: CreateVestingCardView) => void;
}) {
  const { formState: { isValid, isValidating } } = useFormContext<PartialVestingForm>();

  // A work-around for react-hook-form bug which causes the "cannot update a component while rendering another" error
  // https://github.com/orgs/react-hook-form/discussions/11760
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  useEffect(() => {
    setIsButtonDisabled(!isValid || isValidating);
  }, [isValid, isValidating]);

  return (
    <Button
      data-cy={"preview-schedule-button"}
      {...transactionButtonDefaultProps}
      disabled={isButtonDisabled}
      onClick={() => props.setView(CreateVestingCardView.Preview)}
    >
      Preview Vesting Schedule
    </Button>
  );
});

const ValidationSummary = memo(function ValidationSummary() {
  const { formState: { errors } } = useFormContext<PartialVestingForm>();

  return (
    <ErrorMessage
      name="data"
      errors={errors}
      render={({ message }) =>
        !!message && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {message}
          </Alert>
        )
      }
    />
  );
});