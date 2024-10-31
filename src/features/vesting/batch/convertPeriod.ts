import { UnitOfTime } from "../../send/FlowRateInput";

type Period = {
    numerator?: number;
    denominator: UnitOfTime;
}

export function convertPeriodToSeconds(period: Period) {
    const { numerator = 0, denominator } = period;
    return numerator * denominator;
}