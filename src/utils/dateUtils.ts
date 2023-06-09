import { add, Duration } from "date-fns";
import {
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfSecond,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfWeek,
  startOfYear,
} from "date-fns/fp";
import { UnitOfTime } from "../features/send/FlowRateInput";

export function getDatesBetween(
  startDate: Date,
  endDate: Date,
  frequency = UnitOfTime.Day
) {
  const datesBetween = [];
  let currentDate = startDate;
  const duration = getDurationByUnit(frequency);

  while (currentDate < endDate) {
    datesBetween.push(currentDate);
    currentDate = getUnitPeriodStart(
      add(new Date(currentDate), duration),
      frequency
    );
  }

  datesBetween.push(endDate);

  return datesBetween;
}

function getDurationByUnit(unit: UnitOfTime): Duration {
  switch (unit) {
    case UnitOfTime.Second:
      return { seconds: 1 };
    case UnitOfTime.Minute:
      return { minutes: 1 };
    case UnitOfTime.Hour:
      return { hours: 1 };
    case UnitOfTime.Day:
      return { days: 1 };
    case UnitOfTime.Week:
      return { weeks: 1 };
    case UnitOfTime.Month:
      return { months: 1 };
    case UnitOfTime.Year:
      return { years: 1 };
  }
}

function getUnitPeriodStart(date: Date, unit: UnitOfTime): Date {
  switch (unit) {
    case UnitOfTime.Second:
      return startOfSecond(date);
    case UnitOfTime.Minute:
      return startOfMinute(date);
    case UnitOfTime.Hour:
      return startOfHour(date);
    case UnitOfTime.Day:
      return startOfDay(date);
    case UnitOfTime.Week:
      return startOfWeek(date);
    case UnitOfTime.Month:
      return startOfMonth(date);
    case UnitOfTime.Year:
      return startOfYear(date);
  }
}

export const getTimeInSeconds = (date: Date) =>
  Math.floor(date.getTime() / 1000);

export const dateNowSeconds = () => Math.floor(Date.now() / 1000);
