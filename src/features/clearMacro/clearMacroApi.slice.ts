import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "../../utils/config";
import { isClearMacroIntegrationEnabled } from "./clearMacroIntegration";
import {
  ClearMacroClientError,
  fetchClearMacroCapabilities,
  getRelayExecution,
  postRelayExecution,
} from "./relayExecutionClient";
import type {
  ClearMacroCapabilities,
  CreateRelayExecutionRequest,
  RelayExecution,
} from "./types";

export const clearMacroApi = createApi({
  reducerPath: "clearMacroApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["ClearMacroCapabilities", "ClearMacroExecution"],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 90,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getClearMacroCapabilities: build.query<ClearMacroCapabilities | null, void>({
      async queryFn() {
        if (!isClearMacroIntegrationEnabled()) {
          return { data: null };
        }
        try {
          const data = await fetchClearMacroCapabilities(
            config.clearMacro.providerBaseUrl
          );
          return { data };
        } catch (e) {
          if (e instanceof ClearMacroClientError) {
            return {
              error: {
                status: e.httpStatus ?? ("CUSTOM_ERROR" as const),
                data: e.body ?? e.message,
              },
            };
          }
          return {
            error: {
              status: "FETCH_ERROR" as const,
              error: String(e),
            },
          };
        }
      },
      providesTags: [{ type: "ClearMacroCapabilities", id: "LIST" }],
    }),

    getClearMacroRelayExecution: build.query<
      RelayExecution | null,
      { executionId: string; includeEvents?: boolean }
    >({
      async queryFn({ executionId, includeEvents }) {
        if (!isClearMacroIntegrationEnabled()) {
          return { data: null };
        }
        try {
          const data = await getRelayExecution(
            config.clearMacro.providerBaseUrl,
            executionId,
            { includeEvents }
          );
          return { data };
        } catch (e) {
          if (e instanceof ClearMacroClientError) {
            return {
              error: {
                status: e.httpStatus ?? ("CUSTOM_ERROR" as const),
                data: e.body ?? e.message,
              },
            };
          }
          return {
            error: {
              status: "FETCH_ERROR" as const,
              error: String(e),
            },
          };
        }
      },
      providesTags: (_r, _e, arg) => [
        { type: "ClearMacroExecution", id: arg.executionId },
      ],
    }),

    createClearMacroRelayExecution: build.mutation<
      RelayExecution,
      CreateRelayExecutionRequest
    >({
      async queryFn(body) {
        if (!isClearMacroIntegrationEnabled()) {
          return {
            error: {
              status: 403 as const,
              data: "ClearMacro integration is disabled or not configured",
            },
          };
        }
        try {
          const data = await postRelayExecution(
            config.clearMacro.providerBaseUrl,
            body
          );
          return { data };
        } catch (e) {
          if (e instanceof ClearMacroClientError) {
            return {
              error: {
                status: e.httpStatus ?? ("CUSTOM_ERROR" as const),
                data: e.body ?? e.message,
              },
            };
          }
          return {
            error: {
              status: "FETCH_ERROR" as const,
              error: String(e),
            },
          };
        }
      },
      invalidatesTags: (result) =>
        result ? [{ type: "ClearMacroExecution", id: result.id }] : [],
    }),
  }),
});

export const {
  useGetClearMacroCapabilitiesQuery,
  useLazyGetClearMacroCapabilitiesQuery,
  useGetClearMacroRelayExecutionQuery,
  useLazyGetClearMacroRelayExecutionQuery,
  useCreateClearMacroRelayExecutionMutation,
} = clearMacroApi;
