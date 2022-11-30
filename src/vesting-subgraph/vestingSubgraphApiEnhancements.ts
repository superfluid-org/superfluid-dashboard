import { networkDefinition } from "../features/network/networks";
import { api as api_getVestingSchedules } from "./getVestingSchedules.generated";
import { api as api_getVestingSchedule } from "./getVestingSchedule.generated";
import { api } from "./vestingSubgraphApi";

api_getVestingSchedules.enhanceEndpoints({
  endpoints: {
    getVestingSchedules: {
      providesTags: [
        {
          type: "GENERAL",
          id: networkDefinition.goerli.id, // TODO(KK): Works for only Goerli right now
        },
      ],
    },
  },
});

api_getVestingSchedule.enhanceEndpoints({
  endpoints: {
    getVestingSchedule: {
      providesTags: [
        {
          type: "GENERAL",
          id: networkDefinition.goerli.id, // TODO(KK): Works for only Goerli right now
        },
      ],
    },
  },
});

export const vestingSubgraphApi = api; // Important to export this from here so that this module would be invoked both client-side & server-side for the enhancements to run.