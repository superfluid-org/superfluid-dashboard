import { add, Duration } from "date-fns";
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
    currentDate = add(new Date(currentDate), duration);
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

export const getTimeInSeconds = (date: Date) =>
  Math.floor(date.getTime() / 1000);

export const dateNowSeconds = () => Math.floor(Date.now() / 1000);
