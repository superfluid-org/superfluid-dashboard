import { optimism } from "wagmi/chains";
import { UnitOfTime } from "../send/FlowRateInput";

export function getClaimPeriodInSeconds(input: {
    claimEnabled: boolean;
    totalDurationInSeconds: number;
    chainId: number;
}) {
    if (!input.claimEnabled) {
        return 0;
    }

    if (input.chainId === optimism.id) {
        return input.totalDurationInSeconds + UnitOfTime.Year;
    }

    return input.totalDurationInSeconds;
}

export function getClaimValidityDate(input: {
    claimEnabled: boolean;
    endDateTimestamp: number;
    chainId: number;
}) {
    if (!input.claimEnabled) {
        return undefined;
    }

    if (input.chainId === optimism.id) {
        return input.endDateTimestamp + UnitOfTime.Year;
    }

    return input.endDateTimestamp;
}