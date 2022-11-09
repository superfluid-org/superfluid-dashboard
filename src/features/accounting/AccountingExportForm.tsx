import {
  Button,
  Card,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fromUnixTime, getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import CurrencySelect from "../../components/CurrencySelect/CurrencySelect";
import { CurrencyCode } from "../../utils/currencyUtils";
import TooltipIcon from "../common/TooltipIcon";
import { UnitOfTime } from "../send/FlowRateInput";
import { PartialAccountingExportForm } from "./AccountingExportFormProvider";

const GranularityOptions = [
  UnitOfTime.Day,
  UnitOfTime.Week,
  UnitOfTime.Month,
  UnitOfTime.Year,
];

const GranularityWordMap = {
  [UnitOfTime.Second]: "Every Second",
  [UnitOfTime.Minute]: "Every Minute",
  [UnitOfTime.Hour]: "Hourly",
  [UnitOfTime.Day]: "Daily",
  [UnitOfTime.Week]: "Weekly",
  [UnitOfTime.Month]: "Monthly",
  [UnitOfTime.Year]: "Yearly",
};

interface AccountingExportFormProps {}

const AccountingExportForm: FC<AccountingExportFormProps> = ({}) => {
  const theme = useTheme();

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetFormData,
  } = useFormContext<PartialAccountingExportForm>();

  const [
    receiverAddress,
    startTimestamp,
    endTimestamp,
    priceGranularity,
    virtualizationPeriod,
    currencyCode,
  ] = watch([
    "data.receiverAddress",
    "data.startTimestamp",
    "data.endTimestamp",
    "data.priceGranularity",
    "data.virtualizationPeriod",
    "data.currencyCode",
  ]);

  const onDateRangeChange = (startDate?: Date, endDate?: Date) => {
    setValue("data.startTimestamp", startDate ? getUnixTime(startDate) : null);
    setValue("data.endTimestamp", endDate ? getUnixTime(endDate) : null);
  };

  const startDate = useMemo(
    () => (startTimestamp ? fromUnixTime(startTimestamp) : null),
    [startTimestamp]
  );

  const endDate = useMemo(
    () => (endTimestamp ? fromUnixTime(endTimestamp) : null),
    [endTimestamp]
  );

  const onStartDateChange = (date: Date | null) => {
    setValue("data.startTimestamp", date ? getUnixTime(date) : null);
  };

  const onEndDateChange = (date: Date | null) => {
    setValue("data.endTimestamp", date ? getUnixTime(date) : null);
  };

  const onPriceGranularityChange = (e: any) => {
    setValue("data.priceGranularity", Number(e.target.value) as UnitOfTime);
  };

  const onVirtualizationPeriodChange = (e: any) => {
    setValue("data.virtualizationPeriod", Number(e.target.value) as UnitOfTime);
  };

  const onCurrencyCodeChange = (newCurrencyCode: CurrencyCode) => {
    setValue("data.currencyCode", newCurrencyCode);
  };
  return (
    <Card
      elevation={1}
      sx={{
        maxWidth: "600px",
        position: "relative",
        [theme.breakpoints.down("md")]: {
          boxShadow: "none",
          backgroundImage: "none",
          borderRadius: 0,
          border: 0,
          p: 0,
        },
      }}
    >
      <Stack spacing={2.5}>
        <Stack gap={1}>
          <Typography variant="h5">Export Stream Data</Typography>
          <Typography variant="body1" color="text.secondary">
            Download a .csv file containing all relevant streaming data for use
            in external bookkeeping systems
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mr: 0.75 }}
        >
          <FormLabel>Receiver</FormLabel>
          <TooltipIcon title="Must not be an exchange address" />
        </Stack>

        <Stack direction="row" gap={2} alignItems="center" flex={1}>
          <Stack flex={1}>
            <FormLabel>Date Range</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" gap={1}>
                <DatePicker
                  views={["year", "month"]}
                  inputFormat="MM/yy"
                  minDate={new Date("2012-03-01")}
                  maxDate={new Date("2023-06-01")}
                  value={startDate}
                  onChange={onStartDateChange}
                  renderInput={(params: any) => (
                    <TextField {...params} helperText={null} />
                  )}
                />
                <DatePicker
                  views={["year", "month"]}
                  inputFormat="MM/yy"
                  minDate={startDate || new Date("2012-03-01")}
                  maxDate={new Date("2023-06-01")}
                  value={endDate}
                  onChange={onEndDateChange}
                  renderInput={(params: any) => (
                    <TextField {...params} helperText={null} />
                  )}
                />
              </Stack>
            </LocalizationProvider>
          </Stack>

          <Stack flex={1}>
            <FormLabel>Price Granularity</FormLabel>
            <Select
              value={priceGranularity}
              onChange={onPriceGranularityChange}
            >
              {GranularityOptions.map((unitOfTime) => (
                <MenuItem key={unitOfTime} value={unitOfTime} translate="yes">
                  {GranularityWordMap[unitOfTime]}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        <Stack direction="row" gap={2} alignItems="center" flex={1}>
          <Stack flex={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>Virtualization Period</FormLabel>
              <TooltipIcon title="The date when stream scheduler tries to cancel the stream." />
            </Stack>
            <Select
              value={virtualizationPeriod}
              onChange={onVirtualizationPeriodChange}
            >
              {GranularityOptions.map((unitOfTime) => (
                <MenuItem key={unitOfTime} value={unitOfTime} translate="yes">
                  {GranularityWordMap[unitOfTime]}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack flex={1}>
            <FormLabel>Fiat Conversion</FormLabel>
            <CurrencySelect
              value={currencyCode || undefined}
              onChange={onCurrencyCodeChange}
            />
          </Stack>
        </Stack>

        <Button variant="contained" size="xl">
          Export Preview
        </Button>
      </Stack>
    </Card>
  );
};

export default AccountingExportForm;
