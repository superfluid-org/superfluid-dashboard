import {
  BaseQuery,
  RpcEndpointBuilder
} from "@superfluid-finance/sdk-redux";
import { VestingScheduleFromAmountAndDurationsParams } from "../../vesting/batch/VestingScheduleParams";

interface GetGnosisSafeJsonResponse extends BaseQuery<string> {
  params: VestingScheduleFromAmountAndDurationsParams[];
}

export const createBatchVestingEndpoints = (builder: RpcEndpointBuilder) => ({
  getGnosisSafeJson: builder.query<string, void>({
    queryFn: () => {
      

      return ({ data: "" });
    },
    keepUnusedDataFor: 180
  }),
});
