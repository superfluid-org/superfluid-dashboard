import { add } from "date-fns";
import {
  timeUnitWordMap,
  UnitOfTime,
  unitOfTimeList,
} from "../features/send/FlowRateInput";

interface DurationWithUnit {
  duration: number;
  unitOfTime: UnitOfTime;
}

export function getDurationLabel(durationWithUnit: DurationWithUnit) {
  const label = timeUnitWordMap[durationWithUnit.unitOfTime];
  return `${label}${durationWithUnit.duration > 0 ? "s" : ""}`;
}

export function formatDuration(durationSeconds: number): DurationWithUnit {
  const unitOfTime = [...unitOfTimeList]
    .reverse()
    .find((s) => durationSeconds / s > 1);

  if (unitOfTime) {
    return {
      duration: durationSeconds / unitOfTime,
      unitOfTime: unitOfTime as UnitOfTime,
    };
  }

  return {
    duration: durationSeconds / UnitOfTime.Month,
    unitOfTime: UnitOfTime.Month,
  };
}

export function getDatesBetween(startDate: Date, endDate: Date) {
  const datesBetween = [];
  let currentDate = startDate;

  while (currentDate < endDate) {
    datesBetween.push(currentDate);
    currentDate = add(new Date(currentDate), { days: 1 });
  }

  datesBetween.push(endDate);

  return datesBetween;
}

export const dateNowSeconds = () => Math.floor(Date.now() / 1000);
