import { AccountTokenSnapshot } from "@superfluid-finance/sdk-core";
import { parseEther } from "@superfluid-finance/sdk-redux/node_modules/@ethersproject/units";
import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { dateNowSeconds } from "./dateUtils";

export const MAX_SAFE_SECONDS = BigNumber.from(8_640_000_000_000); // In seconds, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps
const BIG_NUMBER_ZERO = BigNumber.from(0);

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
  try {
    return parseEther(etherString);
  } catch (error) {
    return BigNumber.from("0");
  }
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
  bufferTimeInMinutes: number
) {
  const bufferTimeInSeconds = BigNumber.from(bufferTimeInMinutes * 60);

  if (!currentFlowRate.isZero())
    return currentFlowRate.mul(bufferTimeInSeconds);

  return streamedUntilUpdatedAt
    .div(BigNumber.from(createdAtTimestamp))
    .mul(bufferTimeInSeconds);
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
