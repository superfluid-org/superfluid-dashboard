import { fromUnixTime, getUnixTime, max, min } from "date-fns";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import orderBy from "lodash/fp/orderBy";
import maxBy from "lodash/fp/maxBy";
import { DataPoint } from "../components/Chart/LineChart";
import { UnitOfTime } from "../features/send/FlowRateInput";
import { VestingSchedule } from "../features/vesting/types";
import { VestingActivities } from "../pages/vesting/[_network]/[_id]";
import { TokenBalance, mapTokenBalancesToDataPoints } from "./chartUtils";
import { getDatesBetween } from "./dateUtils";
import { Activity } from "./activityUtils";
import { FlowUpdatedEvent } from "@superfluid-finance/sdk-core";

export function mapVestingActivitiesToTokenBalances(
  vestingActivities: VestingActivities,
  vestingSchedule: VestingSchedule
) {
  const lastFlowState = maxBy(
    (activity) => activity.keyEvent.timestamp,
    vestingActivities
      .filter((activity) => activity.keyEvent.name === "FlowUpdated")
      .filter(
        (activity) => activity.keyEvent.timestamp <= vestingSchedule.startDate
      )
  );

  return orderBy(
    (activity) => activity.keyEvent.timestamp,
    "asc",
    vestingActivities
  ).reduce(
    (tokenBalances, activity) => {
      const lastBalance = tokenBalances[tokenBalances.length - 1];

      const secondsElapsed =
        activity.keyEvent.timestamp - lastBalance.timestamp;

      const amountFlowed = BigNumber.from(lastBalance.totalNetFlowRate).mul(
        secondsElapsed
      );

      const newBalance = BigNumber.from(lastBalance.balance).add(amountFlowed);

      if (activity.keyEvent.name === "FlowUpdated") {
        return [
          ...tokenBalances,
          {
            balance: newBalance.toString(),
            totalNetFlowRate: activity.keyEvent.flowRate,
            timestamp: activity.keyEvent.timestamp,
          },
        ];
      } else if (activity.keyEvent.name === "Transfer") {
        const newerBalance = newBalance.add(activity.keyEvent.value);
        return [
          ...tokenBalances,
          {
            balance: newBalance.toString(),
            totalNetFlowRate: lastBalance.totalNetFlowRate,
            timestamp: activity.keyEvent.timestamp - 1,
          },
          {
            balance: newerBalance.toString(),
            totalNetFlowRate: lastBalance.totalNetFlowRate,
            timestamp: activity.keyEvent.timestamp,
          },
        ];
      }

      return tokenBalances;
    },
    [
      {
        balance: "0",
        totalNetFlowRate:
          (lastFlowState as Activity<FlowUpdatedEvent>)?.keyEvent.flowRate ||
          "0",
        timestamp: Number(vestingSchedule.startDate),
      } as TokenBalance,
    ] as TokenBalance[]
  );
}

export function mapVestingActualDataPoints(
  vestingActivities: VestingActivities,
  vestingSchedule: VestingSchedule,
  dateNow: Date,
  frequency: UnitOfTime
) {
  const startDate = fromUnixTime(Number(vestingSchedule.startDate));

  // If endExecutedAt is after the estimated end date then we will extend the graph until endExecutedAt.
  const absoluteMaxDate =
    vestingSchedule.endExecutedAt &&
    vestingSchedule.endExecutedAt > vestingSchedule.endDate
      ? fromUnixTime(vestingSchedule.endExecutedAt)
      : fromUnixTime(vestingSchedule.endDate);

  const expectedEndDate = min([absoluteMaxDate, dateNow]);

  const endDate = max([expectedEndDate, startDate]);

  const dates = getDatesBetween(startDate, endDate, frequency);

  const mappedTokenBalances = mapVestingActivitiesToTokenBalances(
    vestingActivities,
    vestingSchedule
  );

  const initialTokenBalance = {
    balance: "0",
    totalNetFlowRate: "0",
    timestamp: vestingSchedule.startDate,
  } as TokenBalance;

  return mapTokenBalancesToDataPoints(
    dates,
    mappedTokenBalances,
    frequency,
    initialTokenBalance
  );
}

export function mapVestingExpectedDataPoints(
  vestingSchedule: VestingSchedule,
  frequency: UnitOfTime
) {
  const {
    startDate,
    endDate,
    cliffDate,
    cliffAndFlowDate,
    flowRate,
    cliffAmount
  } = vestingSchedule;
  const dates = getDatesBetween(
    fromUnixTime(startDate),
    fromUnixTime(endDate),
    frequency
  );

  // If there is no cliff then we are not going to add a separate data point for that.
  let cliffAdded = cliffAmount === "0";

  return dates.reduce((mappedData: DataPoint[], date: Date) => {
    const dateUnix = getUnixTime(date);

    const secondsStreamed = dateUnix - cliffAndFlowDate;

    if (secondsStreamed > 0) {
      const amountStreamed = BigNumber.from(secondsStreamed).mul(flowRate);

      const etherAmount = formatEther(amountStreamed.add(cliffAmount));

      const newDataPoint = {
        x: date.getTime(),
        y: Number(etherAmount),
        ether: etherAmount,
      };

      if (!cliffAdded && cliffDate) {
        cliffAdded = true;
        const cliffAmountEther = formatEther(cliffAmount);

        return [
          ...mappedData,
          {
            x: fromUnixTime(cliffDate).getTime(),
            y: Number(cliffAmountEther),
            ether: cliffAmountEther,
          },
          newDataPoint,
        ];
      }

      return [...mappedData, newDataPoint];
    }

    return [
      ...mappedData,
      {
        x: date.getTime(),
        y: 0,
        ether: "0",
      },
    ];
  }, []);
}

export function calculateVestingScheduleAllocated(
  vestingSchedule: VestingSchedule
): BigNumber {
  const { cliffAmount, cliffAndFlowDate, flowRate, endDate, remainderAmount } = vestingSchedule;
  const secondsVesting = endDate - cliffAndFlowDate;
  return BigNumber.from(secondsVesting).mul(flowRate).add(cliffAmount).add(remainderAmount);
}

export function calculateVestingSchedulesAllocated(
  vestingSchedules: VestingSchedule[]
): BigNumber {
  return vestingSchedules.reduce(
    (total, vestingSchedule) =>
      total.add(calculateVestingScheduleAllocated(vestingSchedule)),
    BigNumber.from(0)
  );
}

export function vestingScheduleToTokenBalance(
  vestingSchedule: VestingSchedule
): TokenBalance | null {
  const {
    flowRate,
    cliffAmount,
    endDate,
    endExecutedAt,
    cliffAndFlowExecutedAt,
    cliffAndFlowDate,
    didEarlyEndCompensationFail,
    earlyEndCompensation,
    failedAt,
    deletedAt,
    remainderAmount,
    claimedAt
  } = vestingSchedule;

  if (failedAt) return null;

  const wasClaimedAfterEndDate = (claimedAt ?? 0) > endDate;
  const effectiveEndAt = (wasClaimedAfterEndDate ? endDate : undefined) || endExecutedAt || deletedAt;
  if (effectiveEndAt && effectiveEndAt > cliffAndFlowDate) {
    const secondsStreamed = effectiveEndAt - cliffAndFlowDate;
    const balance = BigNumber.from(secondsStreamed)
      .mul(flowRate)
      .add(cliffAmount)
      .add(remainderAmount)
      .add(didEarlyEndCompensationFail ? "0" : earlyEndCompensation ?? "0")
      .toString();

    return {
      balance,
      totalNetFlowRate: "0",
      timestamp: effectiveEndAt,
    };
  } else if (cliffAndFlowExecutedAt) {
    return {
      balance: cliffAmount,
      totalNetFlowRate: flowRate,
      timestamp: cliffAndFlowDate,
    };
  }

  return {
    balance: "0",
    totalNetFlowRate: "0",
    timestamp: getUnixTime(new Date()),
  };
}

export function aggregateTokenBalances(
  tokenBalances: TokenBalance[]
): TokenBalance {
  const latestBalance = maxBy((x) => x.timestamp, tokenBalances);

  const maxTimestamp = latestBalance
    ? latestBalance.timestamp
    : getUnixTime(new Date());

  return tokenBalances.reduce(
    (aggregatedBalance, tokenBalance) => {
      const syncedTokenBalance = getBalanceAtTimestamp(
        tokenBalance,
        aggregatedBalance.timestamp
      );

      const newBalance = BigNumber.from(aggregatedBalance.balance)
        .add(tokenBalance.balance)
        .add(syncedTokenBalance);

      const newFlowRate = BigNumber.from(
        aggregatedBalance.totalNetFlowRate
      ).add(tokenBalance.totalNetFlowRate);

      return {
        ...aggregatedBalance,
        balance: newBalance.toString(),
        totalNetFlowRate: newFlowRate.toString(),
      };
    },
    {
      timestamp: maxTimestamp,
      totalNetFlowRate: "0",
      balance: "0",
    } as TokenBalance
  );
}

export function getBalanceAtTimestamp(
  tokenBalance: TokenBalance,
  unixTimestamp: number
) {
  return BigNumber.from(unixTimestamp - tokenBalance.timestamp).mul(
    tokenBalance.totalNetFlowRate
  );
}
