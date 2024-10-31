import { Box, Stack, Typography } from "@mui/material";
import { FC, memo, useMemo } from "react";
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
import { calculateAdditionalDataFromValidVestingForm } from "../calculateAdditionalDataFromValidVestingForm";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { convertPeriodToSeconds } from "./convertPeriod";

interface BatchVestingPreviewProps extends VestingTransactionSectionProps { }

const BatchVestingPreview: FC<BatchVestingPreviewProps> = ({
    token,
    network,
    setView,
}) => {
    const { watch } = useFormContext<ValidBatchVestingForm>();

    const [
        startDate,
        vestingPeriod,
        cliffPeriod,
        cliffEnabled,
        claimEnabled,
        schedules,
    ] = watch([
        "data.startDate",
        "data.vestingPeriod",
        "data.cliffPeriod",
        "data.cliffEnabled",
        "data.claimEnabled",
        "data.schedules",
    ]);

    const { numerator: cliffNumerator = 0, denominator: cliffDenominator } = cliffPeriod;

    const vestingSchedules = useMemo(() => {
        return schedules.map((schedule) => {
            const flowRate = parseEtherOrZero(schedule.totalAmountEther).div(vestingPeriod.numerator * vestingPeriod.denominator);
            // TODO: Handle cliff period type better?
            const cliffAmount = flowRate.mul(cliffNumerator * cliffDenominator);

            console.log(schedule)

            return calculateAdditionalDataFromValidVestingForm({
                data: {
                    startDate,
                    vestingPeriod,
                    cliffPeriod,
                    cliffEnabled,
                    claimEnabled,
                    superTokenAddress: token.address,
                    receiverAddress: schedule.receiverAddress,
                    totalAmountEther: schedule.totalAmountEther.toString(), // TODO: Find out why I need to do .toString here
                    cliffAmountEther: cliffEnabled ? formatEther(cliffAmount) : undefined,
                }
            });
        });
    }, [schedules, startDate, vestingPeriod, cliffPeriod, cliffEnabled, claimEnabled]);

    const cliffAmount = vestingSchedules.reduce((acc, schedule) => acc.add(schedule.cliffAmount), BigNumber.from(0));
    const cliffAmountEther = formatEther(cliffAmount);

    const totalAmount = vestingSchedules.reduce((acc, schedule) => acc.add(schedule.totalAmount), BigNumber.from(0));
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
            </Stack>

        </Stack>
    );
};

export default memo(BatchVestingPreview);
