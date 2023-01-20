import { fromUnixTime, getUnixTime, min } from "date-fns";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import sortBy from "lodash/fp/sortBy";
import { DataPoint } from "../components/Chart/LineChart";
import { UnitOfTime } from "../features/send/FlowRateInput";
import { VestingSchedule } from "../features/vesting/types";
import { VestingActivities } from "../pages/vesting/[_network]/[_id]";
import { TokenBalance, mapTokenBalancesToDataPoints } from "./chartUtils";
import { getDatesBetween } from "./dateUtils";

export function mapVestingActivitiesToTokenBalances(
  vestingActivities: VestingActivities,
  vestingSchedule: VestingSchedule
) {
  console.log({ vestingSchedule, vestingActivities });
  return sortBy(
    (activity) => activity.keyEvent.timestamp,
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
            balance: lastBalance.balance,
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
        totalNetFlowRate: "0",
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

  const endDate = vestingSchedule.endExecutedAt
    ? min([fromUnixTime(Number(vestingSchedule.endExecutedAt)), dateNow])
    : min([fromUnixTime(Number(vestingSchedule.endDate)), dateNow]);

  const dates = getDatesBetween(startDate, endDate, frequency);

  const mappedTokenBalances = mapVestingActivitiesToTokenBalances(
    vestingActivities,
    vestingSchedule
  );

  const initialTokenBalance = {
    balance: "0",
    totalNetFlowRate: "0",
    timestamp: Number(vestingSchedule.startDate),
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
    startDate: startDateUnix,
    endDate: endDateUnix,
    cliffDate: cliffDateUnix,
    flowRate,
    cliffAmount,
  } = vestingSchedule;

  const startDate = fromUnixTime(Number(startDateUnix));
  const endDate = fromUnixTime(Number(endDateUnix));

  const cliffAndFlowDateUnix = Number(
    cliffDateUnix !== "0" ? cliffDateUnix : startDateUnix
  );

  const dates = getDatesBetween(startDate, endDate, frequency);

  // If there is no cliff then we are not going to add a separate data point for that.
  let cliffAdded = cliffAmount === "0";

  return dates.reduce((mappedData: DataPoint[], date: Date) => {
    const dateUnix = getUnixTime(date);

    const secondsStreamed = dateUnix - cliffAndFlowDateUnix;

    if (secondsStreamed > 0) {
      const amountStreamed = BigNumber.from(secondsStreamed).mul(flowRate);

      const etherAmount = formatEther(amountStreamed.add(cliffAmount || "0"));

      const newDataPoint = {
        x: date.getTime(),
        y: Number(etherAmount),
        ether: etherAmount,
      };

      if (!cliffAdded) {
        cliffAdded = true;
        const cliffAmountEther = formatEther(cliffAmount || "0");

        return [
          ...mappedData,
          {
            x: fromUnixTime(Number(cliffDateUnix)).getTime(),
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
  const { cliffAmount, cliffAndFlowDate, flowRate, endDate } = vestingSchedule;
  const secondsVesting = Number(endDate) - Number(cliffAndFlowDate);
  return BigNumber.from(secondsVesting)
    .mul(flowRate)
    .add(cliffAmount || "0");
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
