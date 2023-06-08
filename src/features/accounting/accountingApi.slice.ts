import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import config from "../../utils/config";
import { CurrencyCode } from "../../utils/currencyUtils";
import { UnitOfTime } from "../send/FlowRateInput";

export enum VirtualizationPeriod {
  Second = "second",
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}

export interface VirtualStreamPeriod {
  startTime: number;
  endTime: number;
  amount: string;
  amountFiat: string;
}

export interface AccountingStreamPeriod {
  id: string;
  chainId: number;
  flowRate: string;
  token: {
    id: Address;
    symbol: string;
    name: string;
    underlyingAddress: Address;
  };
  sender: Address;
  receiver: Address;
  startedAtTimestamp: number;
  startedAtBlockNumber: number;
  startedAtEvent: string;
  stoppedAtTimestamp?: number;
  stoppedAtBlockNumber?: number;
  stoppedAtEvent?: string;
  totalAmountStreamed: string;
  virtualPeriods: VirtualStreamPeriod[];
}

interface StreamPeriodsArguments {
  chains: number[];
  addresses: Address[];
  start: number;
  end: number;
  priceGranularity: VirtualizationPeriod;
  virtualization: VirtualizationPeriod;
  currency: CurrencyCode;
  receivers?: Address[];
}

export const UnitOfTimeVirtualizationMap = {
  [UnitOfTime.Second]: VirtualizationPeriod.Second,
  [UnitOfTime.Minute]: VirtualizationPeriod.Minute,
  [UnitOfTime.Hour]: VirtualizationPeriod.Hour,
  [UnitOfTime.Day]: VirtualizationPeriod.Day,
  [UnitOfTime.Week]: VirtualizationPeriod.Week,
  [UnitOfTime.Month]: VirtualizationPeriod.Month,
  [UnitOfTime.Year]: VirtualizationPeriod.Year,
};

const accountingApi = createApi({
  reducerPath: "accounting",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    streamPeriods: builder.query<
      AccountingStreamPeriod[],
      StreamPeriodsArguments
    >({
      query: (params) => ({
        url: `${config.accountingApi}/stream-periods`,
        params,
      }),
    }),
  }),
});

export default accountingApi;
