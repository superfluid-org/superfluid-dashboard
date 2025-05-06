import { ErrorMessage } from "@hookform/error-message";
import {
  Alert,
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
import { endOfMonth, startOfMonth, sub } from "date-fns";
import { FC, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import MultiAddressSearch from "../../components/AddressSearch/MultiAddressSearch";
import CurrencySelect from "../../components/CurrencySelect/CurrencySelect";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { UnitOfTime } from "../send/FlowRateInput";
import {
  PartialAccountingExportForm,
  ValidAccountingExportForm,
} from "./AccountingExportFormProvider";

const MIN_DATE = startOfMonth(
  sub(new Date(), {
    years: 3,
  })
);

const MAX_DATE = endOfMonth(new Date());

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

interface AccountingExportFormProps {
  onSubmit: (data: ValidAccountingExportForm["data"]) => void;
}

const AccountingExportForm: FC<AccountingExportFormProps> = ({ onSubmit }) => {
  const theme = useTheme();

  const { watch, control, formState: { isValid, isValidating, errors }, getValues } =
    useFormContext<PartialAccountingExportForm>();

  const [addresses = [], counterparties = [], startDate, endDate] = watch([
    "data.addresses",
    "data.counterparties",
    "data.startDate",
    "data.endDate",
  ]);

  const submitAccountingForm = () => {
    const { data } = getValues() as ValidAccountingExportForm;
    onSubmit(data);
  };

  // Work-around for react-hook-issue
  const [isFormValid, setIsFormValid] = useState(false);
  useEffect(() => {
    setIsFormValid(!isValidating && isValid);
  }, [isValid, isValidating])

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

        <ErrorMessage
          name="data"
          // ErrorMessage has a bug and current solution is to pass in errors via props.
          // TODO: keep eye on this issue: https://github.com/react-hook-form/error-message/issues/91
          errors={errors}
          render={({ message }) =>
            !!message && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {message}
              </Alert>
            )
          }
        />

        <Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mr: 0.75 }}
          >
            <FormLabel>View for addresses</FormLabel>
            <TooltipWithIcon title="The address(es) you’re getting accounting data for." />
          </Stack>
          <Controller
            control={control}
            name="data.addresses"
            render={({ field: { value, onChange } }) => (
              <MultiAddressSearch
                placeholder={
                  (addresses || []).length > 0
                    ? `${(addresses || []).length} address(es) selected`
                    : "Select address(es)"
                }
                addresses={value || []}
                onChange={onChange}
                disabledAddresses={counterparties || []}
              />
            )}
          />
        </Stack>

        <Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mr: 0.75 }}
          >
            <FormLabel>Counterparty addresses (optional)</FormLabel>
            <TooltipWithIcon title="Must not be an exchange address. If no addresses are selected, all counterparties will be fetched." />
          </Stack>
          <Controller
            control={control}
            name="data.counterparties"
            render={({ field: { value, onChange } }) => (
              <MultiAddressSearch
                placeholder={
                  (counterparties || []).length > 0
                    ? `${(counterparties || []).length} address(es) selected`
                    : "Select address(es)"
                }
                addresses={value || []}
                onChange={onChange}
                disabledAddresses={addresses || []}
              />
            )}
          />
        </Stack>

        <Stack direction="row" gap={2} alignItems="center" flex={1}>
          <Stack flex={1}>
            <FormLabel>Date Range</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack data-cy="date-ranges" direction="row" gap={1}>
                <Controller
                  control={control}
                  name="data.startDate"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      views={["year", "month"]}
                      format={"MM/yy"}
                      minDate={MIN_DATE}
                      maxDate={endDate || MAX_DATE}
                      value={value}
                      onChange={(date) =>
                        onChange(date ? startOfMonth(date) : null)
                      }
                      slotProps={{
                        textField: {
                          helperText: null,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="data.endDate"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      views={["year", "month"]}
                      format="MM/yy"
                      minDate={startDate || MIN_DATE}
                      maxDate={MAX_DATE}
                      value={value}
                      onChange={(date) =>
                        onChange(date ? endOfMonth(date) : null)
                      }
                      slotProps={{
                        textField: {
                          helperText: null,
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </LocalizationProvider>
          </Stack>

          <Stack flex={1}>
            <FormLabel>Price Granularity</FormLabel>
            <Controller
              control={control}
              name="data.priceGranularity"
              render={({ field: { value, onChange } }) => (
                <Select
                  data-cy={"price-granularity"}
                  value={value}
                  onChange={(e) =>
                    onChange(Number(e.target.value) as UnitOfTime)
                  }
                >
                  {GranularityOptions.map((unitOfTime) => (
                    <MenuItem
                      key={unitOfTime}
                      value={unitOfTime}
                      translate="yes"
                    >
                      {GranularityWordMap[unitOfTime]}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Stack>
        </Stack>

        <Stack direction="row" gap={2} alignItems="center" flex={1}>
          <Stack flex={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>Accounting Period</FormLabel>
            </Stack>
            <Controller
              control={control}
              name="data.virtualizationPeriod"
              render={({ field: { value, onChange } }) => (
                <Select data-cy={"accounting-period"} value={value} onChange={onChange}>
                  {GranularityOptions.map((unitOfTime) => (
                    <MenuItem
                      key={unitOfTime}
                      value={unitOfTime}
                      translate="yes"
                    >
                      {GranularityWordMap[unitOfTime]}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Stack>

          <Stack flex={1}>
            <FormLabel>Fiat Conversion</FormLabel>
            <Controller
              control={control}
              name="data.currencyCode"
              render={({ field: { value, onChange } }) => (
                <CurrencySelect
                  value={value || undefined}
                  onChange={onChange}
                  PopoverProps={{
                    transformOrigin: {
                      horizontal: "right",
                      vertical: "top",
                    },
                    anchorOrigin: { horizontal: "right", vertical: "top" },
                  }}
                />
              )}
            />
          </Stack>
        </Stack>

        <Button
          data-cy={"export-preview-button"}
          variant="contained"
          size="large"
          onClick={submitAccountingForm}
          disabled={!isFormValid}
        >
          Export Preview
        </Button>
      </Stack>
    </Card>
  );
};

export default AccountingExportForm;
