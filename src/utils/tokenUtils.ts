import { AccountTokenSnapshot } from "@superfluid-finance/sdk-core";
import Decimal from "decimal.js";
import { BigNumber, BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import minBy from "lodash/fp/minBy";
import { Network } from "../features/network/networks";
import {
  FlowRateEther,
  UnitOfTime,
  unitOfTimeList,
} from "../features/send/FlowRateInput";
import { dateNowSeconds } from "./dateUtils";
import { getDecimalPlacesToRoundTo } from "./DecimalUtils";

export const MAX_SAFE_SECONDS = BigNumber.from(8_640_000_000_000); // In seconds, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps
export const BIG_NUMBER_ZERO = BigNumber.from(0);

export const getPrettyEtherValue = (weiValue: string) => {
  const etherValue = new Decimal(formatUnits(weiValue, "ether"));
  const decimalsToRoundTo = getDecimalPlacesToRoundTo(etherValue);
  return etherValue.toDP(decimalsToRoundTo).toString();
};

/**
 * This function is used to predict the unit of time selected when stream was started.
 * Time unit with the shortest (most simple) ether representation is returned.
 * TODO: Filter out time units that would produce repeating decimal points.
 */
export const getPrettyEtherFlowRate = (flowRateWei: string): FlowRateEther =>
  minBy(
    (flowRateEther) => flowRateEther.amountEther.length,
    unitOfTimeList.map((timeUnit) => ({
      unitOfTime: timeUnit,
      amountEther: getPrettyEtherValue(
        BigNumber.from(flowRateWei).mul(BigNumber.from(timeUnit)).toString()
      ),
    }))
  ) || {
    unitOfTime: UnitOfTime.Month,
    amountEther: getPrettyEtherValue(
      BigNumber.from(flowRateWei).mul(UnitOfTime.Month).toString()
    ),
  };

export const tryParseUnits = (
  value: string,
  unitName?: BigNumberish | undefined
): BigNumber | undefined => {
  try {
    return parseUnits(value, unitName);
  } catch (e) {
    return undefined;
  }
};

export const parseEtherOrZero = (etherString: string): BigNumber => {
  return parseAmountOrZero({ value: etherString, decimals: 18 });
};

export const parseAmountOrZero = (amount?: {
  value: string;
  decimals: number;
}): BigNumber => {
  if (amount) {
    try {
      return parseUnits(amount.value, amount.decimals);
    } catch (error) {
      return BigNumber.from("0");
    }
  } else {
    return BigNumber.from("0");
  }
};

export const subscriptionWeiAmountReceived = (
  publisherIndexValue: BigNumber,
  subscriberTotalAmountReceivedUntilUpdatedAt: BigNumber,
  subscriberIndexValueUntilUpdatedAt: BigNumber,
  subscriberUnits: BigNumber
) => {
  const publisherSubscriberDifference = publisherIndexValue
    .sub(subscriberIndexValueUntilUpdatedAt)
    .mul(subscriberUnits);

  const totalAmountReceived = subscriberTotalAmountReceivedUntilUpdatedAt.add(
    publisherSubscriberDifference
  );

  return totalAmountReceived;
};

export function calculateMaybeCriticalAtTimestamp(params: {
  updatedAtTimestamp: BigNumberish;
  balanceUntilUpdatedAtWei: BigNumberish;
  totalNetFlowRateWei: BigNumberish;
}): BigNumber {
  const updatedAtTimestamp = BigNumber.from(params.updatedAtTimestamp);
  const balanceUntilUpdatedAt = BigNumber.from(params.balanceUntilUpdatedAtWei);
  const totalNetFlowRate = BigNumber.from(params.totalNetFlowRateWei);

  if (
    balanceUntilUpdatedAt.lte(BIG_NUMBER_ZERO) ||
    totalNetFlowRate.gte(BIG_NUMBER_ZERO)
  ) {
    return BIG_NUMBER_ZERO;
  }

  const criticalTimestamp = balanceUntilUpdatedAt.div(totalNetFlowRate.abs());
  const calculatedCriticalTimestamp = criticalTimestamp.add(updatedAtTimestamp);

  if (calculatedCriticalTimestamp.gt(MAX_SAFE_SECONDS)) return MAX_SAFE_SECONDS;
  return calculatedCriticalTimestamp;
}

// TODO: This needs to be tested
export function calculateBuffer(
  streamedUntilUpdatedAt: BigNumber,
  currentFlowRate: BigNumber,
  createdAtTimestamp: number,
  bufferTimeInMinutes: number,
  minBuffer: BigNumber
) {
  const bufferTimeInSeconds = BigNumber.from(bufferTimeInMinutes * 60);

  if (!currentFlowRate.isZero()) {
    const calculatedBuffer = currentFlowRate.mul(bufferTimeInSeconds);
    return calculatedBuffer.gte(minBuffer) ? calculatedBuffer : minBuffer;
  }

  const calculatedBuffer = streamedUntilUpdatedAt
    .div(BigNumber.from(createdAtTimestamp))
    .mul(bufferTimeInSeconds);

  return calculatedBuffer.gte(minBuffer) ? calculatedBuffer : minBuffer;
}

export function calculateBufferAmount(
  network: Network,
  flowRate: BigNumberish,
  minBuffer: string
): BigNumber {
  const minBufferBN = BigNumber.from(minBuffer);
  const calculatedBuffer = BigNumber.from(flowRate)
    .mul(network.bufferTimeInMinutes)
    .mul(60);

  return calculatedBuffer.gte(minBufferBN) ? calculatedBuffer : minBufferBN;
}

export const calculateCurrentBalance = ({
  flowRateWei,
  balanceWei,
  balanceTimestamp,
}: {
  flowRateWei: BigNumberish;
  balanceWei: BigNumberish;
  balanceTimestamp: number;
}): BigNumber => {
  const amountStreamedSinceUpdate = BigNumber.from(dateNowSeconds())
    .sub(balanceTimestamp)
    .mul(flowRateWei);
  return BigNumber.from(balanceWei).add(amountStreamedSinceUpdate);
};

export const getMinimumStreamTimeInMinutes = (bufferTimeInMinutes: number) =>
  bufferTimeInMinutes * 6;

export const tokenSnapshotsDefaultSort = (
  token1: AccountTokenSnapshot,
  token2: AccountTokenSnapshot
) => {
  const token1Balance = calculateCurrentBalance({
    flowRateWei: token1.totalNetFlowRate,
    balanceWei: token1.balanceUntilUpdatedAt,
    balanceTimestamp: token1.updatedAtTimestamp,
  });
  const token2Balance = calculateCurrentBalance({
    flowRateWei: token2.totalNetFlowRate,
    balanceWei: token2.balanceUntilUpdatedAt,
    balanceTimestamp: token2.updatedAtTimestamp,
  });

  if (token1Balance.eq(token2Balance)) {
    return token1.updatedAtTimestamp < token2.updatedAtTimestamp ? 1 : -1;
  }

  return token1Balance.lt(token2Balance) ? 1 : -1;
};
