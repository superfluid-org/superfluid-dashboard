import { VestingSchedule as SubgraphVestingSchedule } from "../../vesting-subgraph/schema.generated";

export type VestingSchedule = Omit<SubgraphVestingSchedule, "tasks">