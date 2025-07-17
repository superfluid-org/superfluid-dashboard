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
import { VestingScheduleCreatedEvent, VestingScheduleUpdatedEvent } from "@/vesting-subgraph/vestingEvents";

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
  vestingActivities: VestingActivities,
  vestingSchedule: VestingSchedule,
  frequency: UnitOfTime
) {
  const {
    startDate,
    endDate,
    cliffDate,
    cliffAndFlowDate,
    cliffAmount,
    flowRate: flowRateFallback
  } = vestingSchedule;
  const dates = getDatesBetween(
    fromUnixTime(startDate),
    fromUnixTime(endDate),
    frequency
  );

  const creationEvent = vestingActivities.find(activity => activity.keyEvent.name === "VestingScheduleCreated") as Activity<VestingScheduleCreatedEvent> | undefined;

  const updateEventsOrderedAsc = vestingActivities.filter((activity) => activity.keyEvent.name === "VestingScheduleUpdated") as Activity<VestingScheduleUpdatedEvent>[];

  let lastFlowRate = creationEvent?.keyEvent?.flowRate ?? flowRateFallback;
  let lastFlowRateTimestamp = cliffAndFlowDate;
  let lastAmountStreamed = BigNumber.from(0);

  // If there is no cliff then we are not going to add a separate data point for that.
  let cliffAdded = cliffAmount === "0";

  return dates.reduce((mappedData: DataPoint[], date: Date) => {
    const dateUnix = getUnixTime(date);

    const updateEventsMatchingDate = updateEventsOrderedAsc.filter(event => event.keyEvent.timestamp <= dateUnix);
    const updateEventWithHighestTimestamp = maxBy((event) => event.keyEvent.timestamp, updateEventsMatchingDate);

    if (updateEventWithHighestTimestamp) {
      const newLastFlowRateTimestamp = updateEventWithHighestTimestamp.keyEvent.timestamp;
      lastAmountStreamed = BigNumber.from(newLastFlowRateTimestamp - lastFlowRateTimestamp).mul(lastFlowRate).add(lastAmountStreamed)

      lastFlowRate = updateEventWithHighestTimestamp.keyEvent.flowRate;
      lastFlowRateTimestamp = newLastFlowRateTimestamp;
    }

    let secondsStreamed = dateUnix - lastFlowRateTimestamp;

    if (secondsStreamed > 0) {
      const amountStremed = lastAmountStreamed.add(BigNumber.from(secondsStreamed).mul(lastFlowRate));

      const etherAmount = formatEther(amountStremed.add(cliffAmount));

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

export function vestingScheduleToTokenBalance(
  vestingSchedule: VestingSchedule
): TokenBalance | null {
  const {
    flowRate,
    endDate,
    endExecutedAt,
    cliffAndFlowDate,
    didEarlyEndCompensationFail,
    earlyEndCompensation,
    deletedAt,
    remainderAmount,
    claimedAt,
    claimValidityDate,
    settledAmount,
    settledAt: settledAt_,
    failedAt
  } = vestingSchedule;

  const nowTimestamp = getUnixTime(new Date());

  // If not reached the cliff and flow date then return 0 balance.
  if (nowTimestamp < cliffAndFlowDate) {
    return {
      balance: "0",
      totalNetFlowRate: "0",
      timestamp: nowTimestamp,
    };
  }

  // If the vesting schedule was deleted and not claimed (when claimable), return 0 balance
  if (deletedAt && claimValidityDate && !claimedAt) {
    return {
      balance: "0",
      totalNetFlowRate: "0",
      timestamp: deletedAt,
    };
  }

  // Not claimed and after the claim validity date (i.e. claim expired).
  if (!claimedAt && claimValidityDate && nowTimestamp > claimValidityDate) {
    return {
      balance: "0",
      totalNetFlowRate: "0",
      timestamp: nowTimestamp,
    };
  }

  // If the vesting schedule was claimed after the end date, return the total amount.
  const wasClaimedAfterEndDate = (claimedAt ?? 0) > endDate;
  if (wasClaimedAfterEndDate) {
    return {
      balance: vestingSchedule.totalAmount,
      totalNetFlowRate: "0",
      timestamp: endDate,
    };
  }

  // Claimable and after the end date.
  if (!claimedAt && claimValidityDate && nowTimestamp > endDate) {
    return {
      balance: vestingSchedule.totalAmount,
      totalNetFlowRate: "0",
      timestamp: nowTimestamp,
    };
  }

  if (endExecutedAt) {
    let balance = BigNumber.from(vestingSchedule.totalAmount)

    if (didEarlyEndCompensationFail) {
      balance = balance.sub(BigNumber.from(earlyEndCompensation ?? "0"));
    }

    if (endExecutedAt > endDate) {
      // Add the overflow
      balance = balance.add(BigNumber.from(endExecutedAt - endDate).mul(flowRate));
    }

    return {
      balance: balance.toString(),
      totalNetFlowRate: "0",
      timestamp: endExecutedAt,
    };
  }

  // If settledAmount and settledAt are available (not zero), use them as the base
  // The settled values capture updates to the schedule.
  const settledAmountBN = BigNumber.from(settledAmount);
  const settledAt = settledAt_ || cliffAndFlowDate;

  const anchorTimestamp = failedAt || deletedAt || nowTimestamp;
  const secondsStreamedSinceSettlement = Math.max(0, anchorTimestamp - settledAt);

  // Start with settledAmount and add the amount streamed since settlement
  let balance = settledAmountBN
    .add(BigNumber.from(secondsStreamedSinceSettlement).mul(flowRate));

  const balanceString = balance.toString();

  return {
    balance: balanceString,
    totalNetFlowRate: vestingSchedule.status.isFinished ? "0" : flowRate,
    timestamp: anchorTimestamp,
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

export function calculateVestingScheduleAllocated(
  cliffAndFlowDate: number,
  endDate: number,
  flowRate: string,
  cliffAmount: string,
  remainderAmount: string
): BigNumber {
  const secondsVesting = endDate - cliffAndFlowDate;
  return BigNumber.from(secondsVesting).mul(flowRate).add(cliffAmount).add(remainderAmount);
}