import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import config from "../../utils/config";
import { CurrencyCode } from "../../utils/currencyUtils";
import { UnitOfTime } from "../send/FlowRateInput";

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
  priceGranularity: UnitOfTime;
  virtualization: UnitOfTime;
  currency: CurrencyCode;
  receivers?: Address[];
}

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
