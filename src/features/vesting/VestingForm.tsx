import {
  Box,
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { on } from "events";
import { FC, PropsWithChildren, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getTimeInSeconds } from "../../utils/dateUtils";
import TooltipIcon from "../common/TooltipIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";
import AddressSearch from "../send/AddressSearch";
import { timeUnitWordMap, unitOfTimeList } from "../send/FlowRateInput";
import TokenIcon from "../token/TokenIcon";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { PartialVestingForm } from "./VestingFormProvider";

const VestingForm: FC<PropsWithChildren> = () => {
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
    vestingDuration,
    cliffPeriod,
  ] = watch([
    "data.tokenAddress",
    "data.receiverAddress",
    "data.totalAmountEther",
    "data.startDate",
    "data.cliffAmountEther",
    "data.vestingDuration",
    "data.cliffPeriod",
  ]);

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
            } as Token & SuperTokenMinimal)
          : undefined,
      }),
    }
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

  const TotalAmountController = (
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

  const CliffDurationController = (
    <Controller
      control={control}
      name="data.cliffPeriod"
      render={({ field: { onChange, onBlur } }) => (
        <Box>
          <TextField
            value={cliffPeriod.numerator}
            onChange={(e) =>
              onChange({
                numerator: e.target.value,
                denominator: cliffPeriod.denominator,
              })
            }
            onBlur={onBlur}
          />
          <Select
            value={cliffPeriod.denominator}
            onChange={(e) =>
              onChange({
                numerator: cliffPeriod.numerator,
                denominator: e.target.value,
              })
            }
            onBlur={onBlur}
          >
            {unitOfTimeList.map((unitOfTime) => (
              <MenuItem value={unitOfTime} onBlur={onBlur}>
                {timeUnitWordMap[unitOfTime]}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    />
  );

  const VestingDurationController = (
    <Controller
      control={control}
      name="data.vestingDuration"
      render={({ field: { onChange, onBlur } }) => (
        <Box>
          <TextField
            value={cliffPeriod.numerator}
            onChange={(e) =>
              onChange({
                numerator: e.target.value,
                denominator: cliffPeriod.denominator,
              })
            }
            onBlur={onBlur}
          />
          <Select
            value={cliffPeriod.denominator}
            onChange={(e) =>
              onChange({
                numerator: cliffPeriod.numerator,
                denominator: e.target.value,
              })
            }
            onBlur={onBlur}
          >
            {unitOfTimeList.map((unitOfTime) => (
              <MenuItem value={unitOfTime} onBlur={onBlur}>
                {timeUnitWordMap[unitOfTime]}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    />
  );

  return (
    <Box component={"form"}>
      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>Receiver</FormLabel>
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
          <FormLabel>Super Token</FormLabel>
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
          <FormLabel>TODO: TotalAmountController</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {TotalAmountController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>Start Date</FormLabel>
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
          <FormLabel>TODO: Cliff Amount</FormLabel>
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
          <FormLabel>TODO: Cliff Duration</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {CliffDurationController}
      </FormGroup>

      <FormGroup>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel>TODO: Vesting Duration</FormLabel>
          <TooltipIcon title="TODO:" />
        </Stack>
        {VestingDurationController}
      </FormGroup>
    </Box>
  );
};

export default VestingForm;
