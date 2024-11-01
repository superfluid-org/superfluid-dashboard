import { BigNumber } from "ethers";
import { Address } from "viem"

export type VestingScheduleFromAmountAndDurationsParams = {
    superToken: Address;
    receiver: Address;
    totalAmount: string;
    totalDuration: number;
    startDate: number;
    cliffPeriod: number;
    claimPeriod: number;
}

export type VestingScheduleFromAbsolutesParams = {
    superToken: Address;
    receiver: Address;
    startDate: number;
    cliffDate: number;
    flowRate: string;
    cliffAmount: string;
    endDate: number;
    claimValidityDate: number;
    remainderAmount: string;
}

export function convertVestingScheduleFromAmountAndDurationsToAbsolutes(params: VestingScheduleFromAmountAndDurationsParams): VestingScheduleFromAbsolutesParams {
    const { superToken, receiver, totalAmount, totalDuration, startDate, cliffPeriod, claimPeriod } = params;

    const cliffDate = startDate + cliffPeriod;
    const endDate = startDate + totalDuration;
    const claimValidityDate = startDate + claimPeriod;

    const flowRate = BigNumber.from(totalAmount).div(totalDuration);
    const remainderAmount = BigNumber.from(totalAmount).sub(flowRate.mul(totalDuration));
    const cliffAmount = BigNumber.from(cliffPeriod).mul(flowRate);

    return {
        superToken,
        receiver,
        startDate,
        cliffDate,
        flowRate: flowRate.toString(),
        cliffAmount: cliffAmount.toString(),
        endDate,
        claimValidityDate,
        remainderAmount: remainderAmount.toString()
    }
}