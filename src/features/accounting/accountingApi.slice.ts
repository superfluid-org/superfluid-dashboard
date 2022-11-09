import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";

export interface VirtualStreamPeriod {
  startTime: number;
  endTime: number;
  amount: string;
}

export interface AccountingStreamPeriod {
  id: string;
  flowRate: string;
  token: {
    id: Address;
    symbol: string;
    name: string;
    underlyingAddress: Address;
  };
  sender: {
    id: Address;
  };
  receiver: {
    id: Address;
  };
  startedAtTimestamp: number;
  startedAtBlockNumber: number;
  startedAtEvent: {
    transactionHash: string;
  };
  stoppedAtTimestamp?: number;
  stoppedAtBlockNumber?: number;
  stoppedAtEvent?: {
    transactionHash: string;
  };
  totalAmountStreamed: string;

  virtualPeriods: VirtualStreamPeriod[];
}

const accountingApi = createApi({
  reducerPath: "accounting",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    streamPeriods: builder.query<
      AccountingStreamPeriod[],
      { chains: number[]; address: Address; start: number; end: number }
    >({
      query: (params) => ({
        url: "http://localhost:8888/v1/getAccountingItems",
        params,
      }),
    }),
  }),
});

export default accountingApi;
