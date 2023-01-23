import { GetVestingScheduleQuery } from "../../vesting-subgraph/.graphclient";

export type VestingSchedule = NonNullable<Required<GetVestingScheduleQuery>["vestingSchedule"]>