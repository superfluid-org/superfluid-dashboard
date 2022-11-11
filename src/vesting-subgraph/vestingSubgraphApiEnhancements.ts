import { networkDefinition } from "../features/network/networks";
import { api as api_getVestingSchedules } from "./getVestingSchedules.generated";
import { api as api_getVestingSchedule } from "./getVestingSchedule.generated";

api_getVestingSchedules.enhanceEndpoints({
  endpoints: {
    getVestingSchedules: {
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: "5", // TODO(KK): Works for only Goerli right now
        },
      ],
    },
  },
});

api_getVestingSchedule.enhanceEndpoints({
  endpoints: {
    getVestingSchedule: {
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: "5", // TODO(KK): Works for only Goerli right now
        },
      ],
    },
  },
});
