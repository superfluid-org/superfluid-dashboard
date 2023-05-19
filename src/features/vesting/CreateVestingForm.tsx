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
import { skipToken } from "@reduxjs/toolkit/query";
import { add } from "date-fns";
import { FC, memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { inputPropsForEtherAmount } from "../../utils/inputPropsForEtherAmount";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { subgraphApi } from "../redux/store";
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
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import useActiveAutoWrap from "./useActiveAutoWrap";
import { TokenType } from "../redux/endpoints/tokenTypes";

export enum VestingFormLabels {
  Receiver = "Receiver",
  Network = "Network",
  CliffPeriod = "Cliff Period",
  CliffAmount = "Cliff Amount",
  VestingStartDate = "Vesting Start Date",
  SuperToken = "Super Token",
  TotalVestingPeriod = "Total Vesting Period",
  TotalVestedAmount = "Total Vested Amount",
  AutoWrap = "Enable Auto-Wrap",
}

export enum VestingTooltips {
  AutoWrap = "Auto-Wrap wraps your regular ERC-20 tokens to Super Tokens automatically, making it easy to send your streams without the need for manual token wrapping. All your current and future streams will have Auto-Wrap enabled for the selected token and network.",
}

const CreateVestingForm: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingCardView) => void;
}> = ({ token, setView }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { network } = useExpectedNetwork();

  const { watch, control, formState, setValue } =
    useFormContext<PartialVestingForm>();

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

  const [cliffEnabled, vestingPeriod, setupAutoWrap] = watch([
    "data.cliffEnabled",
    "data.vestingPeriod",
    "data.setupAutoWrap",
  ]);

  const ReceiverController = (
    <Controller
      control={control}
      name="data.receiverAddress"
      render={({ field: { value, onChange, onBlur } }) => (
        <AddressSearch
          address={value}
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
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          data-cy={"total-amount-input"}
          value={value}
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
        render={({ field: { value, onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                data-cy={"date-input"}
                fullWidth
                {...props}
                onBlur={onBlur}
              />
            )}
            value={value}
            ampm={false}
            onChange={onChange}
            disablePast
            minDateTime={minVestingStartDate}
            maxDateTime={maxVestingStartDate}
          />
        )}
      />
    </LocalizationProvider>
  );

  const CliffAmountController = (
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
                {token?.symbol ?? ""}
              </Typography>
            ),
          }}
          inputProps={{
            ...inputPropsForEtherAmount,
          }}
        />
      )}
    />
  );

  const CliffPeriodController = (
    <Controller
      control={control}
      name="data.cliffPeriod"
      render={({ field: { value, onChange, onBlur } }) => (
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
          <TextField
            data-cy={"cliff-period-input"}
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
            type="number"
            inputMode="numeric"
          />
          <Select
            data-cy={"cliff-period-unit"}
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
              .filter(
                (x) =>
                  x >= (network.testnet ? UnitOfTime.Minute : UnitOfTime.Day) &&
                  x <= UnitOfTime.Year
              )
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
              inputMode="numeric"
            />
            <Select
              data-cy={"total-period-unit"}
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
                .filter(
                  (x) =>
                    x >=
                      (network.testnet ? UnitOfTime.Minute : UnitOfTime.Day) &&
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
      }}
    />
  );

  const CliffEnabledController = (
    <Controller
      control={control}
      name="data.cliffEnabled"
      render={({ field: { value, onChange, onBlur } }) => (
        <FormControlLabel
          data-cy={"cliff-toggle"}
          control={
            <Switch
              checked={value}
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
              onBlur={onBlur}
            />
          }
          label="Add Cliff"
        />
      )}
    />
  );

  const { visibleAddress } = useVisibleAddress();

  const queryAutoWrap =
    network.autoWrap &&
    visibleAddress &&
    token &&
    getSuperTokenType({
      network,
      address: token.id,
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
          underlyingTokenAddress: token.underlyingAddress,
        }
      : "skip"
  );

  const isAutoWrapInputVisible =
    queryAutoWrap &&
    !isAutoWrapLoading &&
    !activeAutoWrapSchedule &&
    !isAutoWrapAllowanceSufficient;

  const AutoWrapController = (
    <Controller
      control={control}
      name="data.setupAutoWrap"
      render={({ field: { value, onChange, onBlur } }) => (
        <FormControlLabel
          label={VestingFormLabels.AutoWrap}
          control={
            <Switch checked={!!value} onChange={onChange} onBlur={onBlur} />
          }
        />
      )}
    />
  );

  const PreviewVestingScheduleButton = (
    <Button
      data-cy={"preview-schedule-button"}
      {...transactionButtonDefaultProps}
      disabled={!formState.isValid || formState.isValidating}
      onClick={() => setView(CreateVestingCardView.Preview)}
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
    <Stack component={"form"} gap={4}>
      <Stack gap={2.5}>
        {ValidationSummary}

        <FormGroup>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel>{VestingFormLabels.Receiver}</FormLabel>
            <TooltipWithIcon title="Must not be an exchange address" />
          </Stack>
          {ReceiverController}
        </FormGroup>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isBelowMd ? "1fr" : "1fr 1fr",
            gap: 2.5,
          }}
        >
          <FormGroup>
            <FormLabel>{VestingFormLabels.SuperToken}</FormLabel>
            {TokenController}
          </FormGroup>
          <FormGroup>
            <FormLabel>{VestingFormLabels.VestingStartDate}</FormLabel>
            {StartDateController}
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
            {VestingAmountController}
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
            {VestingPeriodController}
          </FormGroup>
        </Box>

        <Stack direction="row" alignItems="center">
          {CliffEnabledController}
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
              {CliffAmountController}
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
              {CliffPeriodController}
            </FormGroup>
          </Box>
        )}

        {isAutoWrapInputVisible && (
          <Stack direction="row" alignItems="center">
            {AutoWrapController}
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

      <Stack gap={1}>{PreviewVestingScheduleButton}</Stack>
    </Stack>
  );
};

export default memo(CreateVestingForm);
