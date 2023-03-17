import { BigNumber, BigNumberish } from "ethers";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "../../redux/endpoints/flowSchedulerEndpoints";

export type RequiredAccessForActiveVestingSchedule = {
  recommendedTokenAllowance: BigNumber;
  requiredFlowRateAllowance: BigNumber;
  requiredFlowOperatorPermissions: number;
}

export function calculateRequiredAccessForActiveVestingSchedule(
  {
    flowRate,
    cliffAmount,
    cliffAndFlowExecutedAt,
  }: {
    flowRate: BigNumberish;
    cliffAmount: BigNumberish;
    cliffAndFlowExecutedAt?: number;
  },
  {
    START_DATE_VALID_AFTER_IN_SECONDS,
    END_DATE_VALID_BEFORE_IN_SECONDS,
  }: {
    START_DATE_VALID_AFTER_IN_SECONDS: number;
    END_DATE_VALID_BEFORE_IN_SECONDS: number;
  }
): RequiredAccessForActiveVestingSchedule {
  const tokenAllowanceForStartDateValidAfter = BigNumber.from(flowRate).mul(
    START_DATE_VALID_AFTER_IN_SECONDS
  );

  const tokenAllowanceForEndDateValidBefore = BigNumber.from(flowRate).mul(
    END_DATE_VALID_BEFORE_IN_SECONDS
  );

  const recommendedTokenAllowance = cliffAndFlowExecutedAt
    ? tokenAllowanceForEndDateValidBefore
    : BigNumber.from(cliffAmount)
        .add(tokenAllowanceForStartDateValidAfter)
        .add(tokenAllowanceForEndDateValidBefore);

  const requiredFlowRateAllowance = cliffAndFlowExecutedAt
    ? BigNumber.from("0")
    : BigNumber.from(flowRate);

  // https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  const requiredFlowOperatorPermissions = cliffAndFlowExecutedAt
    ? ACL_DELETE_PERMISSION // Create not needed after cliffAndFlows are executed
    : ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION;

  return {
    recommendedTokenAllowance,
    requiredFlowRateAllowance,
    requiredFlowOperatorPermissions,
  };
}
