import { VestingSchedule as SubgraphVestingSchedule } from "../../vesting-subgraph/.graphclient/index";

export type VestingSchedule = Omit<SubgraphVestingSchedule, "tasks" | "events">