import { BigNumber } from "ethers";
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
  schedule: {
    flowRate: string;
    cliffAndFlowExecutedAt?: number;
    cliffAndFlowDate: number;
    endDate: number;
    cliffAmount: string;
    remainderAmount: string;
    claimValidityDate: number;
  },
  {
    START_DATE_VALID_AFTER_IN_SECONDS,
    END_DATE_VALID_BEFORE_IN_SECONDS,
  }: {
    START_DATE_VALID_AFTER_IN_SECONDS: number;
    END_DATE_VALID_BEFORE_IN_SECONDS: number;
  }
): RequiredAccessForActiveVestingSchedule {
  const {
    flowRate,
    cliffAndFlowExecutedAt,
  } = schedule;

  const recommendedTokenAllowance = BigNumber.from(getMaximumNeededTokenAllowance({
    schedule,
    START_DATE_VALID_AFTER_IN_SECONDS,
    END_DATE_VALID_BEFORE_IN_SECONDS
  }).toString());

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

export function getMaximumNeededTokenAllowance(input: { schedule: {
  cliffAndFlowDate: number;
  endDate: number;
  cliffAndFlowExecutedAt?: number;
  flowRate: string;
  cliffAmount: string;
  remainderAmount: string;
  claimValidityDate: number;
}, START_DATE_VALID_AFTER_IN_SECONDS: number, END_DATE_VALID_BEFORE_IN_SECONDS: number }): bigint {
  const { schedule: { cliffAndFlowDate, endDate, cliffAndFlowExecutedAt }, START_DATE_VALID_AFTER_IN_SECONDS, END_DATE_VALID_BEFORE_IN_SECONDS } = input;

  const flowRate = BigInt(input.schedule.flowRate);
  const cliffAmount = BigInt(input.schedule.cliffAmount);
  const remainderAmount = BigInt(input.schedule.remainderAmount);

  const maxFlowDelayCompensationAmount = cliffAndFlowDate === 0
    ? 0n
    : BigInt(START_DATE_VALID_AFTER_IN_SECONDS) * flowRate;

  const maxEarlyEndCompensationAmount = endDate === 0
    ? 0n
    : BigInt(END_DATE_VALID_BEFORE_IN_SECONDS) * flowRate;

  const claimValidityDate = cliffAndFlowExecutedAt ? 0 : input.schedule.claimValidityDate;

  if (claimValidityDate === 0) {
    return cliffAmount +
      remainderAmount +
      maxFlowDelayCompensationAmount +
      maxEarlyEndCompensationAmount;
  } else if (claimValidityDate >= _minDateToExecuteEndInclusive({
    endDate,
    END_DATE_VALID_BEFORE_IN_SECONDS
  })) {
    return _getTotalVestedAmount({
      cliffAmount,
      remainderAmount,
      endDate,
      cliffAndFlowDate,
      flowRate
    });
  } else {
    return cliffAmount +
      remainderAmount +
      BigInt(claimValidityDate - cliffAndFlowDate) * flowRate +
      maxEarlyEndCompensationAmount;
  }
}

function _getTotalVestedAmount(input: { cliffAmount: bigint, remainderAmount: bigint, endDate: number, cliffAndFlowDate: number, flowRate: bigint }): bigint {
  return input.cliffAmount +
    input.remainderAmount +
    BigInt(input.endDate - input.cliffAndFlowDate) * input.flowRate;
}

function _minDateToExecuteEndInclusive(input: { endDate: number, END_DATE_VALID_BEFORE_IN_SECONDS: number }): number {
  return input.endDate - input.END_DATE_VALID_BEFORE_IN_SECONDS;
}