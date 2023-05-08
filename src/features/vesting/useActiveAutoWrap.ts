import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  GetWrapSchedule,
  WrapSchedule,
} from "../redux/endpoints/autoWrapEndpoints";
import { rpcApi } from "../redux/store";

export interface ActiveAutoWrapQueryResponse {
  isAutoWrapLoading: boolean;
  activeAutoWrapSchedule: WrapSchedule | null | undefined;
  isAutoWrapAllowanceSufficient: boolean | undefined;
}

const useActiveAutoWrap = (
  arg: GetWrapSchedule | "skip"
): ActiveAutoWrapQueryResponse => {
  const isSkip = arg === "skip";

  const { isLoading: isAutoWrapLoading, data: activeAutoWrap } =
    rpcApi.useGetActiveWrapScheduleQuery(isSkip ? skipToken : arg);

  const {
    isLoading: isAutoWrapAllowanceLoading,
    data: isAutoWrapAllowanceSufficient,
  } = rpcApi.useIsAutoWrapAllowanceSufficientQuery(
    isSkip || !activeAutoWrap
      ? skipToken
      : {
          ...arg,
          upperLimit: activeAutoWrap.upperLimit,
        }
  );

  return {
    isAutoWrapLoading: isAutoWrapLoading || isAutoWrapAllowanceLoading,
    activeAutoWrapSchedule: activeAutoWrap,
    isAutoWrapAllowanceSufficient: isAutoWrapAllowanceSufficient,
  };
};

export default useActiveAutoWrap;
