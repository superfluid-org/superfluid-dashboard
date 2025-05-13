import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import * as chain from "wagmi/chains";

export interface GasRecommendation {
  maxFeeGwei: number;
  maxPriorityFeeGwei: number;
}

const gasApi = createApi({
  reducerPath: "gas_price",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    recommendedGas: builder.query<
      GasRecommendation | null,
      { chainId: number }
    >({
      queryFn: async ({ chainId }) => {
        const endpointMap: { [key: number]: string } = {
          [chain.polygon.id]: "https://gasstation.polygon.technology/v2"
        };

        const endpoint = endpointMap[chainId];

        if (!endpoint) {
          return { data: null };
        }

        const response = await axios.get<MaticGasStationResponse>(endpoint);
        const { maxFee, maxPriorityFee } = response.data.fast;

        return {
          data: {
            maxFeeGwei: Number(maxFee),
            maxPriorityFeeGwei: Number(maxPriorityFee),
          } as GasRecommendation,
        };
      },
    }),
  }),
});

export default gasApi;

interface MaticGasStationResponse {
  safeLow: {
    maxPriorityFee: number;
    maxFee: number;
  };
  standard: {
    maxPriorityFee: number;
    maxFee: number;
  };
  fast: {
    maxPriorityFee: number;
    maxFee: number;
  };
  estimatedBaseFee: number;
  blockTime: number;
  blockNumber: number;
}
