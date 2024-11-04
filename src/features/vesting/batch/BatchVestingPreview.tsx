import { Box, Button, Stack, Typography } from "@mui/material";
import { FC, memo, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { add, format } from "date-fns";
import { VestingTransactionSectionProps } from "../transactionButtons/VestingTransactionButtonSection";
import { VestingScheduleGraph } from "../VestingScheduleGraph";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { VestingFormLabels } from "../CreateVestingForm";
import NetworkIcon from "../../network/NetworkIcon";
import { timeUnitWordMap } from "../../send/FlowRateInput";
import TokenIcon from "../../token/TokenIcon";
import { ValidBatchVestingForm } from "./BatchVestingFormProvider";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { convertPeriodToSeconds } from "./convertPeriod";
import { BatchReceiversTable } from "./BatchReceiversTable";
import { transactionButtonDefaultProps } from "../../transactionBoundary/TransactionButton";
import JSZip from "jszip";
import { getTxBuilderInputs_v2 } from "./gnosisSafe";
import { convertBatchFormToParams } from "./convertBatchFormToParams";
import { convertVestingScheduleFromAmountAndDurationsToAbsolutes } from "./VestingScheduleParams";
import { BatchVestingTransactionSection } from "./BatchVestingTransactionSection";

interface BatchVestingPreviewProps extends VestingTransactionSectionProps { }

const BatchVestingPreview: FC<BatchVestingPreviewProps> = ({
    token,
    network,
    setView,
}) => {
    const { watch } = useFormContext<ValidBatchVestingForm>();

    const validForm = watch();
    const formData = validForm.data;
    const { startDate, vestingPeriod, cliffPeriod, cliffEnabled, claimEnabled, schedules } = formData;

    const scheduleParams = useMemo(() => convertBatchFormToParams({
        data: formData
    }), [formData]);

    const scheduleAbsoluteParams = useMemo(() => scheduleParams.map(convertVestingScheduleFromAmountAndDurationsToAbsolutes), [scheduleParams]);

    const { cliffAmount, totalAmount } = useMemo(() => {
        const totalAmount = scheduleParams.reduce((acc, schedule) => acc.add(schedule.totalAmount), BigNumber.from(0));
        const cliffAmount = scheduleAbsoluteParams.reduce((acc, schedule) => acc.add(schedule.cliffAmount), BigNumber.from(0));
        return {
            cliffAmount,
            totalAmount
        }
    }, [scheduleAbsoluteParams, scheduleParams]);

    const cliffAmountEther = formatEther(cliffAmount);

    const totalAmountEther = formatEther(totalAmount);

    const cliffDate = cliffEnabled
        ? add(
            startDate,
            {
                seconds: convertPeriodToSeconds(cliffPeriod),
            },
        )
        : undefined;

    const endDate = add(
        startDate,
        {
            seconds: convertPeriodToSeconds(vestingPeriod)
        },
    );

    return (
        <Stack gap={3}>
            <Box sx={{ my: 2 }}>
                <VestingScheduleGraph
                    startDate={startDate}
                    endDate={endDate}
                    cliffDate={cliffDate}
                    cliffAmount={parseEtherOrZero(cliffAmountEther)}
                    totalAmount={parseEtherOrZero(totalAmountEther)}
                />
            </Box>

            <Stack gap={2} sx={{ mb: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

                    <Stack>
                        <Typography color="text.secondary">
                            {VestingFormLabels.Network}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <NetworkIcon size={28} network={network} />
                            <Typography>{network.name}</Typography>
                        </Stack>
                    </Stack>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Stack>
                        <Typography color="text.secondary">
                            {VestingFormLabels.SuperToken}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <TokenIcon isSuper chainId={network.id} tokenAddress={token.address} size={28} />
                            <Typography>{token.symbol}</Typography>
                        </Stack>
                    </Stack>
                    <Stack>
                        <Typography color="text.secondary">
                            {VestingFormLabels.VestingStartDate}
                        </Typography>
                        <Typography data-cy="preview-start-date" color="text.primary">
                            {format(startDate, "LLLL d, yyyy")}
                        </Typography>
                    </Stack>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Stack>
                        <Typography color="text.secondary">
                            {VestingFormLabels.TotalVestedAmount}
                        </Typography>
                        <Typography data-cy={"preview-total-amount"}>
                            {totalAmountEther} {token.symbol}
                        </Typography>
                    </Stack>

                    <Stack>
                        <Typography color="text.secondary">
                            {VestingFormLabels.TotalVestingPeriod}
                        </Typography>
                        <Typography data-cy="preview-total-period" color="text.primary">
                            {vestingPeriod.numerator}{" "}
                            {timeUnitWordMap[vestingPeriod.denominator]} (
                            {format(endDate, "LLLL d, yyyy")})
                        </Typography>
                    </Stack>
                </Box>

                {cliffEnabled && cliffDate && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <Stack>
                            <Typography color="text.secondary">
                                {VestingFormLabels.CliffAmount}
                            </Typography>
                            <Typography data-cy={"preview-cliff-amount"}>
                                {cliffAmountEther} {token.symbol}
                            </Typography>
                        </Stack>

                        <Stack>
                            <Typography color="text.secondary">
                                {VestingFormLabels.CliffPeriod}
                            </Typography>
                            <Typography data-cy="preview-cliff-period" color="text.primary">
                                {cliffPeriod.numerator}{" "}
                                {timeUnitWordMap[cliffPeriod.denominator]} (
                                {format(cliffDate, "LLLL d, yyyy")})
                            </Typography>
                        </Stack>
                    </Box>
                )}

                <BatchReceiversTable schedules={schedules} token={token} />
            </Stack>


            <Stack gap={1}>
                <BatchVestingTransactionSection token={token} setView={setView} />

                <Button {...transactionButtonDefaultProps} variant="outlined" onClick={async () => {
                    const zip = new JSZip();
                    const batchFolder = zip.folder("batch");

                    const safeTxBuilderJSONs = await getTxBuilderInputs_v2({
                        network,
                        schedules: scheduleParams
                    });

                    safeTxBuilderJSONs?.forEach((safeTxBuilderJSON, i) => {
                        const blob = new Blob([JSON.stringify(safeTxBuilderJSON)], {
                            type: "application/json",
                        });

                        batchFolder?.file(`batch-${i}.json`, blob);
                    });

                    const objectURL = URL.createObjectURL(
                        (await batchFolder?.generateAsync({ type: "blob" })) as Blob
                    );

                    const a = document.createElement('a');
                    a.href = objectURL;
                    a.download = 'batch.zip'; // Set the file name
                    document.body.appendChild(a);
                    a.click();

                    // Clean up by revoking the object URL and removing the link
                    URL.revokeObjectURL(objectURL);
                    document.body.removeChild(a);

                }}>
                    Download Gnosis Safe TX
                </Button>
            </Stack>


        </Stack>
    );
};

export default memo(BatchVestingPreview);
