import { getUnixTime } from "date-fns";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { ValidBatchVestingForm } from "./BatchVestingFormProvider";
import { VestingScheduleFromAmountAndDurationsParams } from "./VestingScheduleParams";
import { convertPeriodToSeconds } from "./convertPeriod";
import { getClaimPeriodInSeconds } from "../claimPeriod";

export function convertBatchFormToParams(formValues: ValidBatchVestingForm, chainId: number): VestingScheduleFromAmountAndDurationsParams[] {
    const { superTokenAddress, startDate, cliffPeriod, claimEnabled, vestingPeriod, schedules } = formValues.data;

    const totalDuration = convertPeriodToSeconds(vestingPeriod);

    return schedules.map(x => {
        return {
            superToken: superTokenAddress,
            receiver: x.receiverAddress,
            totalAmount: parseEtherOrZero(x.totalAmountEther).toString(),
            totalDuration,
            startDate: getUnixTime(startDate),
            cliffPeriod: convertPeriodToSeconds(cliffPeriod),
            claimPeriod: getClaimPeriodInSeconds({
                claimEnabled: claimEnabled ?? false,
                totalDurationInSeconds: totalDuration,
                chainId,
            }),
        } as VestingScheduleFromAmountAndDurationsParams
    });
}   