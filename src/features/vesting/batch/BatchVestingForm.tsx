import { Box, FormControlLabel, FormGroup, Switch, FormLabel, Stack, useMediaQuery, useTheme, Input } from "@mui/material";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { CreateVestingCardView } from "../CreateVestingSection";
import { PartialBatchVestingForm } from "./BatchVestingFormProvider";
import { Controller, useFormContext } from "react-hook-form";
import { PreviewButton } from "../PreviewButton";
import { memo, useRef } from "react";
import { UnitOfTime } from "../../send/FlowRateInput";
import { ClaimController, CliffPeriodController, StartDateController, TokenController, VestingFormLabels, VestingPeriodController, VestingTooltips } from "../CreateVestingForm";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { ValidationSummary } from "../ValidationSummary";
import Papa from "papaparse";
import { csvSchema, headerSchema } from "./types";
import { LoadingButton } from "@mui/lab";
import { transactionButtonDefaultProps } from "../../transactionBoundary/TransactionButton";
import { BatchReceiversTable } from "./BatchReceiversTable";
import { ValidationError } from "yup";

export function BatchVestingForm(props: {
    token: SuperTokenMinimal | null | undefined;
    setView: (value: CreateVestingCardView) => void;
}) {
    const { token, setView } = props;

    const { network } = useExpectedNetwork();
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

    const { watch } = useFormContext<PartialBatchVestingForm>();
    const [cliffEnabled, schedules] = watch(["data.cliffEnabled", "data.schedules"]);

    return (
        <Stack component={"form"} gap={4}>
            <Stack gap={2.5}>
                <ValidationSummary />

                <FormGroup>
                    <FormLabel>{VestingFormLabels.SuperToken}</FormLabel>
                    <TokenController token={token} network={network} />
                </FormGroup>
                <FormGroup>
                    <FormLabel>{VestingFormLabels.VestingStartDate}</FormLabel>
                    <StartDateController />
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

                <Stack gap={2}>
                    <Stack direction="row" alignItems="center">
                        <CliffEnabledController />
                        <TooltipWithIcon title="Set the cliff date and amount to be granted." />
                    </Stack>

                    {cliffEnabled && (
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
                    )}
                </Stack>

                <Stack data-cy="claim-switch-and-tooltip" direction="row" alignItems="center">
                    <ClaimController />
                    <TooltipWithIcon title={VestingTooltips.Claim} />
                </Stack>

            </Stack>


            {schedules.length > 0 && <BatchReceiversTable token={token} schedules={schedules} />}

            <Stack gap={1}>
                {schedules.length > 0 && <PreviewButton setView={setView} />}
                <FileController />
            </Stack>
        </Stack>
    )
}

const CliffEnabledController = memo(function CliffEnabledController() {
    const { control, setValue, watch } = useFormContext<{
        data: {
            cliffEnabled: boolean;
            vestingPeriod: {
                numerator: string;
                denominator: UnitOfTime;
            };
            cliffPeriod: {
                numerator: string;
                denominator: UnitOfTime;
            };
        }
    }>();
    const cliffPeriod = watch("data.vestingPeriod");

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
                                    setValue(
                                        "data.cliffPeriod",
                                        {
                                            numerator: "",
                                            denominator: cliffPeriod.denominator,
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

const FileController = memo(function FileController() {
    const { control, watch, setValue, setError, clearErrors } = useFormContext<PartialBatchVestingForm>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const schedules = watch("data.schedules");
    const hasSchedules = schedules.length > 0;

    return (
        <Controller
            control={control}
            name={"data.schedules"}
            render={({ field: { value, onChange, ...field } }) => {
                return (
                    <>
                        <LoadingButton {...transactionButtonDefaultProps} variant={hasSchedules ? "outlined" : "contained"} onClick={() => fileInputRef.current?.click()}>
                            {hasSchedules ? "Change CSV" : "Upload CSV"}
                        </LoadingButton>
                        <Input
                            {...field}
                            style={{ display: 'none' }}
                            inputRef={fileInputRef}
                            inputProps={{ accept: ".csv" }}
                            value={""}
                            onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                const file = event.target.files?.[0] ?? null;
                                clearErrors("data.schedules");

                                if (file) {
                                    Papa.parse(file, {
                                        header: true,
                                        complete: (results) => {
                                            try {
                                                headerSchema.validateSync(results.meta.fields);

                                                try {
                                                    const dataCasted = csvSchema.cast(results.data);
                                                    setValue("data.schedules", dataCasted.map(x => ({
                                                        receiverAddress: x.receiver,
                                                        totalAmountEther: x["total-vested-amount"].toString(),
                                                    })), {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                        shouldTouch: true,
                                                    });
                                                } catch (dataError) {
                                                    if (dataError instanceof ValidationError) {
                                                        setError("data.schedules", {
                                                            message: "CSV data validation error: " + dataError.errors.join(", "),
                                                        });
                                                    } else {
                                                        throw dataError;
                                                    }
                                                }
                                              } catch (headerError) {
                                                if (headerError instanceof ValidationError) {
                                                    setError("data.schedules", {
                                                        message: "CSV header validation error: " + headerError.errors.join(", "),
                                                    });
                                                  } else {
                                                    throw headerError;
                                                  }
                                              }
                                            
                                        },
                                        error: (error) => {
                                            setError("data.schedules", {
                                                message: "Error parsing CSV. Error: " + error,
                                            });
                                        }
                                    });
                                } else {
                                    setError("data.schedules", {
                                        message: "No file selected.",
                                    });
                                }
                            }}
                            type="file"
                        />
                    </>
                );
            }}
        />
    )
});