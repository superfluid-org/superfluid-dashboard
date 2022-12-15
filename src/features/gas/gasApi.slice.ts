import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import axios from "axios";
import { chain } from "wagmi";

export interface GasRecommendation {
  maxFeeGwei: number;
  maxPriorityFeeGwei: number;
}

const gasApi = createApi({
  reducerPath: "gas_price",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    recommendedGas: builder.query<GasRecommendation | null, { chainId: number }>({
      queryFn: async ({ chainId }) => {
        // Polygon
        if (chainId === chain.polygon.id) {
          const {
            data: {
              fast: { maxFee, maxPriorityFee },
            },
          } = await axios.get<MaticGasStationResponse>(
            "https://gasstation-mainnet.matic.network/v2"
          );
          return {
            data: {
              maxFeeGwei: maxFee,
              maxPriorityFeeGwei: maxPriorityFee,
            } as GasRecommendation,
          };
        }

        // Polygon Mumbai
        if (chainId === chain.polygonMumbai.id) {
          const {
            data: {
              fast: { maxFee, maxPriorityFee },
            },
          } = await axios.get<MaticGasStationResponse>(
            "https://gasstation-mumbai.matic.today/v2"
          );
          return {
            data: {
              maxFeeGwei: maxFee,
              maxPriorityFeeGwei: maxPriorityFee,
            } as GasRecommendation,
          };
        }

        return {
          data: null,
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
