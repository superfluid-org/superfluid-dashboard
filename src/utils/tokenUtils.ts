import { BigNumber } from "ethers";

export const MAX_SAFE_SECONDS = BigNumber.from(8640000000000); //In seconds, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps
const BIG_NUMBER_ZERO = BigNumber.from(0);

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

// TODO: This needs to be tested
export function calculateMaybeCriticalAtTimestamp(
  updatedAtTimestamp: BigNumber,
  balanceUntilUpdatedAt: BigNumber,
  totalDeposit: BigNumber,
  totalNetFlowRate: BigNumber
): BigNumber {
  if (
    balanceUntilUpdatedAt.lte(BIG_NUMBER_ZERO) ||
    totalNetFlowRate.gte(BIG_NUMBER_ZERO)
  ) {
    return BIG_NUMBER_ZERO;
  }

  const criticalTimestamp = balanceUntilUpdatedAt
    .add(totalDeposit)
    .div(totalNetFlowRate.abs());
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
